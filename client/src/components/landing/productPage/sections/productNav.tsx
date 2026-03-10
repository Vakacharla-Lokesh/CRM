import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function ProductNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-8 py-4"
      style={{
        backgroundColor: "var(--background)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <img src="/crm.png" alt="Campaign Flux" className="h-5" />
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Campaign Flux
        </span>
      </div>
      <div
        className="hidden md:flex items-center gap-6 text-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        <a href="#features" className="hover:opacity-70 transition-opacity">
          Features
        </a>
        <a href="#preview" className="hover:opacity-70 transition-opacity">
          Product
        </a>
        <a href="#pricing" className="hover:opacity-70 transition-opacity">
          Pricing
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate("/login")}
          style={{ color: "var(--foreground)" }}
        >
          Sign in
        </Button>
        <Button
          size="sm"
          data-track-cta="Get started nav"
          onClick={() => navigate("/signup")}
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          Get started <ChevronRight size={14} />
        </Button>
      </div>
    </nav>
  );
}
