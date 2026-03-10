import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { highlights } from "@/types/constants/product";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            Built for modern sales teams
          </h2>
          <p
            className="text-lg"
            style={{ color: "var(--muted-foreground)" }}
          >
            Everything you need. Nothing you don't.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((h: (typeof highlights)[0]) => {
            const Icon = h.icon;
            return (
              <Card
                key={h.title}
                className="group border transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <CardHeader className="pb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
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
                    {h.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {h.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
