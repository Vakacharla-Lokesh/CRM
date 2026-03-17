import { BarChart2 } from "lucide-react";

interface AnalyticsEmptyStateProps {
  onAddWidget: () => void;
}

function AnalyticsEmptyState({ onAddWidget }: AnalyticsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--primary) 10%, transparent)",
        }}
      >
        <BarChart2
          className="w-10 h-10"
          style={{ color: "var(--primary)" }}
        />
      </div>
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: "var(--foreground)" }}
      >
        No widgets yet
      </h2>
      <p
        className="text-sm mb-6 max-w-sm"
        style={{ color: "var(--muted-foreground)" }}
      >
        Build your personalized analytics workspace. Add charts, configure
        metrics, and track what matters to you.
      </p>
      <button
        id="analytics-add-first-widget"
        onClick={onAddWidget}
        className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
        style={{
          backgroundColor: "var(--primary)",
          color: "var(--primary-foreground)",
        }}
      >
        + Add your first widget
      </button>
    </div>
  );
}

export default AnalyticsEmptyState;
