import ChartRenderer from "./ChartRenderer";
import { Pencil, Trash2 } from "lucide-react";
import type { Widget } from "@/services/api/";
import {
  type AnalyticsGridProps,
  CHART_TYPE_LABEL,
  ENTITY_LABEL,
} from "@/types/constants/analytics/analyticsChartTypes";

function WidgetCard({
  widget,
  onEdit,
  onDelete,
}: {
  widget: Widget;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="rounded-xl border flex flex-col overflow-hidden transition-shadow hover:shadow-md"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
        minHeight: "260px",
      }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="min-w-0">
          <h3
            className="text-sm font-semibold truncate"
            style={{ color: "var(--foreground)" }}
          >
            {widget.title}
          </h3>
          <span
            className="text-xs mt-0.5"
            style={{ color: "var(--muted-foreground)" }}
          >
            {ENTITY_LABEL[widget.entity]} · {CHART_TYPE_LABEL[widget.type]} ·{" "}
            {widget.metric}
          </span>
        </div>
        <div className="flex items-center gap-1 ml-3 shrink-0">
          <button
            id={`analytics-edit-${widget._id}`}
            onClick={onEdit}
            className="p-1.5 rounded-md transition-colors hover:bg-muted"
            aria-label="Edit widget"
          >
            <Pencil
              className="w-3.5 h-3.5"
              style={{ color: "var(--muted-foreground)" }}
            />
          </button>
          <button
            id={`analytics-delete-${widget._id}`}
            onClick={onDelete}
            className="p-1.5 rounded-md transition-colors hover:bg-muted"
            aria-label="Delete widget"
          >
            <Trash2
              className="w-3.5 h-3.5"
              style={{ color: "var(--destructive)" }}
            />
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div
        className="flex-1 px-4 py-4"
        style={{ minHeight: "200px" }}
      >
        <ChartRenderer
          type={widget.type}
          data={widget.data ?? []}
          metric={widget.metric}
        />
      </div>
    </div>
  );
}

function WidgetSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden animate-pulse"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        minHeight: "260px",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="h-4 w-32 rounded"
          style={{ backgroundColor: "var(--muted)" }}
        />
        <div
          className="h-3 w-20 rounded mt-2"
          style={{ backgroundColor: "var(--muted)" }}
        />
      </div>
      <div className="p-4">
        <div
          className="h-44 rounded-lg"
          style={{ backgroundColor: "var(--muted)" }}
        />
      </div>
    </div>
  );
}

function AnalyticsGrid({ widgets, onEdit, onDelete }: AnalyticsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {widgets.map((widget) => (
        <WidgetCard
          key={widget._id}
          widget={widget}
          onEdit={() => onEdit(widget)}
          onDelete={() => onDelete(widget._id!)}
        />
      ))}
    </div>
  );
}

export { WidgetSkeleton };
export default AnalyticsGrid;
