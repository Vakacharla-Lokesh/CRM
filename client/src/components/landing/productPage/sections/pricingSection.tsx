import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { plans } from "@/types/constants/product";

export default function PricingSection() {
  const navigate = useNavigate();

  return (
    <section
      id="pricing"
      className="py-24 px-6"
      style={{
        backgroundColor: "var(--card)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Simple, honest pricing
          </h2>
          <p
            className="text-lg"
            style={{ color: "var(--muted-foreground)" }}
          >
            No hidden fees. No seat minimums. Cancel anytime.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan: (typeof plans)[0]) => (
            <Card
              key={plan.name}
              className="border relative flex flex-col"
              style={{
                backgroundColor: plan.highlight
                  ? "var(--primary)"
                  : "var(--background)",
                borderColor: plan.highlight
                  ? "var(--primary)"
                  : "var(--border)",
                borderRadius: "var(--radius-lg)",
                transform: plan.highlight ? "scale(1.03)" : "none",
                boxShadow: plan.highlight
                  ? "0 20px 40px -10px rgba(0,0,0,0.3)"
                  : "none",
              }}
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: "var(--foreground)",
                    color: "var(--background)",
                  }}
                >
                  {plan.badge}
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle
                  className="text-lg font-bold"
                  style={{
                    color: plan.highlight
                      ? "var(--primary-foreground)"
                      : "var(--foreground)",
                  }}
                >
                  {plan.name}
                </CardTitle>
                <div className="flex items-end gap-1 mt-2">
                  <span
                    className="text-4xl font-extrabold"
                    style={{
                      color: plan.highlight
                        ? "var(--primary-foreground)"
                        : "var(--foreground)",
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className="text-sm mb-1"
                      style={{
                        color: plan.highlight
                          ? "rgba(255,255,255,0.7)"
                          : "var(--muted-foreground)",
                      }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className="text-sm mt-1"
                  style={{
                    color: plan.highlight
                      ? "rgba(255,255,255,0.75)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {plan.tagline}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 flex-1">
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check
                        size={14}
                        style={{
                          color: plan.highlight
                            ? "rgba(255,255,255,0.9)"
                            : "var(--primary)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          color: plan.highlight
                            ? "rgba(255,255,255,0.85)"
                            : "var(--foreground)",
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full mt-auto"
                  variant={
                    plan.highlight ? "secondary" : plan.ctaVariant
                  }
                  data-track-cta={`Pricing ${plan.name}`}
                  onClick={() =>
                    navigate(
                      plan.name === "Enterprise" ? "/login" : "/signup"
                    )
                  }
                  style={
                    plan.highlight
                      ? {
                          backgroundColor: "rgba(255,255,255,0.15)",
                          color: "var(--primary-foreground)",
                          border: "1px solid rgba(255,255,255,0.25)",
                        }
                      : {}
                  }
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <p
          className="text-center text-sm mt-8"
          style={{ color: "var(--muted-foreground)" }}
        >
          All plans include a 14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
}
