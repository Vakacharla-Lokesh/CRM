import { integrations } from "@/types/constants/product";

export default function IntegrationsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p
          className="text-sm mb-8 font-medium"
          style={{ color: "var(--muted-foreground)" }}
        >
          INTEGRATES WITH YOUR EXISTING STACK
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {integrations.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
                style={{
                  border: "1px solid var(--border)",
                  color: "var(--muted-foreground)",
                }}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{s.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
