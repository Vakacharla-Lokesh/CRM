import { type AnalyticsGridProps } from "@/types/constants/analytics/analyticsChartTypes";
import WidgetCard from "./widgetCard";

function AnalyticsGrid({ widgets, onEdit, onDelete }: AnalyticsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {widgets.map((widget, index) => (
        <WidgetCard
          key={widget._id ?? index}
          widget={widget}
          onEdit={() => onEdit(widget)}
          onDelete={() => onDelete(widget._id!)}
        />
      ))}
    </div>
  );
}

export { WidgetSkeleton } from "./widgetSkeleton";
export default AnalyticsGrid;
