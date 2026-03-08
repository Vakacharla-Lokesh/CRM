import { useEffect, useRef, useCallback } from "react";
import type { Socket } from "socket.io-client";

type SectionId = "hero" | "features" | "pricing" | "cta";

interface SessionTrackerOptions {
  socket: Socket | null;
  active: boolean;
}

const SCROLL_MILESTONES = [25, 50, 75, 100];
const TRACKED_SECTIONS: SectionId[] = ["hero", "features", "pricing", "cta"];

export function useSessionTracker({ socket, active }: SessionTrackerOptions) {
  const emittedScrollDepths = useRef<Set<number>>(new Set());
  const emittedSections = useRef<Set<string>>(new Set());
  const scrollDebounceTimer = useRef<number | null>(null);
  const pageEnterTime = useRef<number>(0);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  const emit = useCallback(
    (type: string, data: Record<string, unknown> = {}) => {
      if (!socket?.connected) return;
      socket.emit("session:event", {
        type,
        data,
        timestamp: new Date().toISOString(),
      });
    },
    [socket],
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
          emit("scroll_depth", { depth: milestone });
        }
      }
    }, 1000);
  }, [emit]);

  const setupIntersectionObserver = useCallback(() => {
    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            !emittedSections.current.has(entry.target.id)
          ) {
            emittedSections.current.add(entry.target.id);
            emit("section_view", { section: entry.target.id });
          }
        }
      },
      { threshold: 0.4 },
    );

    for (const sectionId of TRACKED_SECTIONS) {
      const el = document.getElementById(sectionId);
      if (el) intersectionObserver.current.observe(el);
    }
  }, [emit]);

  const handleCTAClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest("[data-track-cta]") as HTMLElement | null;
      if (btn) {
        emit("cta_click", {
          buttonLabel:
            btn.dataset.trackCta || btn.textContent?.trim() || "unknown",
        });
      }
    },
    [emit],
  );

  const handlePageExit = useCallback(() => {
    const totalDwellTime = Math.round(
      (Date.now() - pageEnterTime.current) / 1000,
    );
    emit("page_exit", { totalDwellTime });
    socket?.emit("session:end");
  }, [emit, socket]);

  useEffect(() => {
    if (!active || !socket) return;

    pageEnterTime.current = Date.now();

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
    };
  }, [
    active,
    socket,
    handleScroll,
    handleCTAClick,
    handlePageExit,
    setupIntersectionObserver,
  ]);
}
