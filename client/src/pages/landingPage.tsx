"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Github,
  Users,
  Building2,
  DollarSign,
  BarChart3,
  Phone,
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    icon: Users,
    title: "Lead Management",
    description:
      "Track and qualify leads through your sales funnel with rich profiles, scoring, and status tracking.",
  },
  {
    icon: DollarSign,
    title: "Deal Pipeline",
    description:
      "Move deals from prospecting to close with stage-based tracking and deal value management.",
  },
  {
    icon: Building2,
    title: "Organization Tracking",
    description:
      "Maintain detailed company profiles with industry, size, website, and linked leads.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tenant & RBAC",
    description:
      "Isolated workspaces per tenant with role-based access — user, admin, and super admin.",
  },
  {
    icon: Phone,
    title: "Call Logs",
    description:
      "Log incoming and outgoing calls with status, duration, and notes for complete history.",
  },
  {
    icon: MessageSquare,
    title: "Comments & Activity",
    description:
      "Attach comments to leads and keep a full audit trail of every customer interaction.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Real-time metrics on leads, deals, conversion rates, and campaign performance.",
  },
  {
    icon: Zap,
    title: "Bulk Operations",
    description:
      "Create or update hundreds of leads, deals, and organizations in a single transactional request.",
  },
  {
    icon: Globe,
    title: "Offline Support",
    description:
      "Queue actions when offline and auto-sync when your connection is restored.",
  },
];

const stats = [
  { label: "Entities Managed", value: "Leads & Deals" },
  { label: "Access Control", value: "Role-Based" },
  { label: "Architecture", value: "Multi-Tenant" },
  { label: "Data Ops", value: "Bulk + Transactional" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* ── Navbar ── */}
      <nav
        className="fixed top-0 w-full z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? "color-mix(in srgb, var(--card) 90%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--border)"
            : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="/crm.png"
              alt="Campaign Flux"
              className="h-7"
            />
            <span
              className="font-semibold text-lg"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Campaign Flux
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/Vakacharla-Lokesh/CRM"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-colors hover:opacity-70"
              style={{ color: "var(--muted-foreground)" }}
              aria-label="GitHub"
            >
              <Github size={20} />
            </a>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              style={{ borderColor: "var(--border)" }}
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-40 pb-28 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge
            className="mb-6 px-4 py-1.5 text-sm font-medium rounded-full"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
              border: "none",
            }}
          >
            CRM built for modern sales teams
          </Badge>

          <h1
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
          >
            Manage your{" "}
            <span style={{ color: "var(--primary)" }}>entire pipeline</span>
            <br />
            in one place
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            Campaign Flux brings together lead tracking, deal management,
            organization profiles, call logs, and real-time analytics — all
            under a secure multi-tenant architecture.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="h-12 px-8 text-base gap-2"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Start for free <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-12 px-8 text-base"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Sign in <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section
        className="py-12 px-6"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div
                className="text-2xl font-bold mb-1"
                style={{
                  color: "var(--primary)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {s.value}
              </div>
              <div
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator style={{ backgroundColor: "var(--border)" }} />

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                fontFamily: "var(--font-sans)",
                letterSpacing: "-0.02em",
              }}
            >
              Everything your sales team needs
            </h2>
            <p
              className="text-lg"
              style={{ color: "var(--muted-foreground)" }}
            >
              Purpose-built features — no bloat, no fluff.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group transition-all duration-200 hover:shadow-md border"
                  style={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "var(--radius-lg)",
                  }}
                >
                  <CardHeader className="pb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 group-hover:opacity-90"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <Icon
                        size={20}
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <CardTitle
                      className="text-base font-semibold"
                      style={{ color: "var(--card-foreground)" }}
                    >
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Separator style={{ backgroundColor: "var(--border)" }} />

      {/* ── CTA ── */}
      <section
        className="py-28 px-6 text-center"
        style={{ backgroundColor: "var(--card)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
          >
            Ready to take control of your pipeline?
          </h2>
          <p
            className="text-lg mb-10"
            style={{ color: "var(--muted-foreground)" }}
          >
            Join Campaign Flux today and start converting more leads into deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/signup")}
              className="h-12 px-10 text-base gap-2"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Create your account <ArrowRight size={18} />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/login")}
              className="h-12 px-10 text-base"
              style={{
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-10 px-6"
        style={{
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--background)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/crm.png"
              alt="Campaign Flux"
              className="h-5"
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Campaign Flux
            </span>
          </div>
          <p
            className="text-sm"
            style={{ color: "var(--muted-foreground)" }}
          >
            Built with MongoDB Atlas · React · Node.js
          </p>
          <a
            href="https://github.com/Vakacharla-Lokesh/CRM"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Github size={15} /> View on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
