import { useEffect, useRef, useCallback } from "react";
import {
  enqueueSessionEvent,
  getPendingSessionEvents,
  clearSessionEvents,
  countPendingSessionEvents,
} from "@/utils/sessionEventDB";

type SectionId = "hero" | "features" | "pricing" | "cta";

interface SessionTrackerOptions {
  active: boolean;
  sessionId: string;
  tenantId: string;
  visitorName: string | null;
  visitorEmail: string | null;
}

const SCROLL_MILESTONES = [25, 50, 75, 100];
const TRACKED_SECTIONS: SectionId[] = ["hero", "features", "pricing", "cta"];
const FLUSH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const FLUSH_THRESHOLD = 10;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export function useSessionTracker({
  active,
  sessionId,
  tenantId,
  visitorName,
  visitorEmail,
}: SessionTrackerOptions) {
  const emittedScrollDepths = useRef<Set<number>>(new Set());
  const emittedSections = useRef<Set<string>>(new Set());
  const scrollDebounceTimer = useRef<number | null>(null);
  const pageEnterTime = useRef<number>(0);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const flushIntervalRef = useRef<number | null>(null);
  const flushingRef = useRef(false);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    flushingRef.current = true;

    try {
      const pending = await getPendingSessionEvents();
      if (pending.length === 0) return;

      const response = await fetch(`${API_URL}/session-events/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tenantId,
          visitorName,
          visitorEmail,
          events: pending.map(({ type, data, timestamp }) => ({
            type,
            data,
            timestamp,
          })),
        }),
      });

      if (response.ok) {
        await clearSessionEvents(pending.map((e) => e.id));
      } else {
        console.warn(
          "[SessionTracker] Flush failed with status:",
          response.status,
        );
      }
    } catch (err) {
      console.warn("[SessionTracker] Flush error (will retry):", err);
    } finally {
      flushingRef.current = false;
    }
  }, [sessionId, tenantId, visitorName, visitorEmail]);

  const track = useCallback(
    async (type: string, data: Record<string, unknown> = {}) => {
      await enqueueSessionEvent({
        sessionId,
        tenantId,
        visitorName,
        visitorEmail,
        type,
        data,
        timestamp: new Date().toISOString(),
      });

      const count = await countPendingSessionEvents();
      if (count >= FLUSH_THRESHOLD) {
        flush();
      }
    },
    [sessionId, tenantId, visitorName, visitorEmail, flush],
  );

  const handleScroll = useCallback(() => {
    if (scrollDebounceTimer.current) return;

    scrollDebounceTimer.current = window.setTimeout(() => {
      scrollDebounceTimer.current = null;

      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      const pct = Math.round((scrolled / total) * 100);

      for (const milestone of SCROLL_MILESTONES) {
        if (pct >= milestone && !emittedScrollDepths.current.has(milestone)) {
          emittedScrollDepths.current.add(milestone);
          track("scroll_depth", { depth: milestone });
        }
      }
    }, 1000);
  }, [track]);

  const setupIntersectionObserver = useCallback(() => {
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            !emittedSections.current.has(entry.target.id)
          ) {
            emittedSections.current.add(entry.target.id);
            track("section_view", { section: entry.target.id });
          }
        }
      },
      { threshold: 0.4 },
    );

    for (const sectionId of TRACKED_SECTIONS) {
      const el = document.getElementById(sectionId);
      if (el) intersectionObserver.current.observe(el);
    }
  }, [track]);

  const handleCTAClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("[data-track-cta]") as HTMLElement | null;
      if (btn) {
        track("cta_click", {
          buttonLabel:
            btn.dataset.trackCta || btn.textContent?.trim() || "unknown",
        });
      }
    },
    [track],
  );

  const handlePageExit = useCallback(async () => {
    const totalDwellTime = Math.round(
      (Date.now() - pageEnterTime.current) / 1000,
    );

    await enqueueSessionEvent({
      sessionId,
      tenantId,
      visitorName,
      visitorEmail,
      type: "page_exit",
      data: { totalDwellTime },
      timestamp: new Date().toISOString(),
    });

    const pending = await getPendingSessionEvents();
    if (pending.length === 0) return;

    const payload = JSON.stringify({
      sessionId,
      tenantId,
      visitorName,
      visitorEmail,
      events: pending.map(({ type, data, timestamp }) => ({
        type,
        data,
        timestamp,
      })),
    });

    const beaconSent = navigator.sendBeacon(
      `${API_URL}/session-events/batch`,
      new Blob([payload], { type: "application/json" }),
    );

    if (beaconSent) {
      await clearSessionEvents(pending.map((e) => e.id));
    }
  }, [sessionId, tenantId, visitorName, visitorEmail]);

  useEffect(() => {
    if (!active || !sessionId || !tenantId) return;

    pageEnterTime.current = Date.now();
    track("page_enter", {});

    flushIntervalRef.current = window.setInterval(() => {
      flush();
    }, FLUSH_INTERVAL_MS);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleCTAClick);
    window.addEventListener("beforeunload", handlePageExit);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") handlePageExit();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    setupIntersectionObserver();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleCTAClick);
      window.removeEventListener("beforeunload", handlePageExit);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      intersectionObserver.current?.disconnect();

      if (scrollDebounceTimer.current) {
        clearTimeout(scrollDebounceTimer.current);
      }
      if (flushIntervalRef.current) {
        clearInterval(flushIntervalRef.current);
      }

      flush();
    };
  }, [
    active,
    sessionId,
    tenantId,
    track,
    flush,
    handleScroll,
    handleCTAClick,
    handlePageExit,
    setupIntersectionObserver,
  ]);

  return { flush };
}
