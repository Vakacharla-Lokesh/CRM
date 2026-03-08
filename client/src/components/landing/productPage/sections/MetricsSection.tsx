import { metrics } from "../constants/metrics";

export default function MetricsSection() {
  return (
    <section
      className="py-12 px-6"
      style={{
        backgroundColor: "var(--card)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {metrics.map((m) => (
          <div key={m.label}>
            <div
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--primary)" }}
            >
              {m.value}
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
