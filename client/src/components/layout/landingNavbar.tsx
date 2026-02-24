import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ThemeControls } from "../common/themeToggle";
import { Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

function LandingNavbar() {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
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
          <ThemeControls />
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
  );
}

export default LandingNavbar;
