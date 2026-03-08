import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function ProductHero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="pt-40 pb-24 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        <Badge
          className="mb-6 px-4 py-1.5 text-sm font-medium rounded-full"
          style={{
            backgroundColor: "var(--accent)",
            color: "var(--accent-foreground)",
            border: "none",
          }}
        >
          ✦ Now with real-time behavioural lead scoring
        </Badge>
        <h1
          className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          style={{ letterSpacing: "-0.03em" }}
        >
          The CRM that closes
          <br />
          <span style={{ color: "var(--primary)" }}>while you're offline</span>
        </h1>
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--muted-foreground)" }}
        >
          Campaign Flux watches your visitors, scores their intent in real time,
          and routes qualified leads to the right rep — automatically, round the
          clock.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button
            size="lg"
            data-track-cta="Start free hero"
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
            data-track-cta="See how it works"
            className="h-12 px-8 text-base gap-2"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
            onClick={() =>
              document
                .getElementById("preview")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            See how it works <ChevronRight size={18} />
          </Button>
        </div>
        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          No credit card required · Free 14-day trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}
