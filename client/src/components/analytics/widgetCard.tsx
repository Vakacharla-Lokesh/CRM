import ChartRenderer from "./chartRenderer";
import type { Widget } from "@/services/api/index";
import {
  CHART_TYPE_LABEL,
  ENTITY_LABEL,
} from "@/types/constants/analytics/analyticsChartTypes";
import { Pencil, Trash2 } from "lucide-react";

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

export default WidgetCard;
