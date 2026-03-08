import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  const navigate = useNavigate();

  return (
    <section
      id="cta"
      className="py-28 px-6 text-center"
      style={{
        backgroundColor: "var(--card)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h2
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ letterSpacing: "-0.02em" }}
        >
          Ready to close more deals?
        </h2>
        <p
          className="text-lg mb-10"
          style={{ color: "var(--muted-foreground)" }}
        >
          Join teams already using Campaign Flux to capture and convert leads on
          autopilot.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            data-track-cta="Create account CTA"
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
            data-track-cta="Talk to sales CTA"
            onClick={() => navigate("/login")}
            className="h-12 px-10 text-base"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            Talk to sales
          </Button>
        </div>
        <p
          className="text-xs mt-6"
          style={{ color: "var(--muted-foreground)" }}
        >
          No credit card required · 14-day free trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}
