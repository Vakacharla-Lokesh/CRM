import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { type AnalyticsGridProps } from "@/types/constants/analytics/analyticsChartTypes";
import WidgetCard from "./widgetCard";

function AnalyticsGrid({ widgets, onEdit, onDelete, onReorder }: AnalyticsGridProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = Array.from(widgets);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    onReorder(reordered);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="analytics-widgets" direction="horizontal">
        {(provided) => (
          <div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {widgets.map((widget, index) => (
              <Draggable key={widget._id ?? index} draggableId={String(widget._id ?? index)} index={index}>
                {(dragProvided, snapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    className={snapshot.isDragging ? "opacity-80 shadow-xl" : ""}
                  >
                    <div className="relative group">
                      <div
                        {...dragProvided.dragHandleProps}
                        className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <WidgetCard
                        widget={widget}
                        onEdit={() => onEdit(widget)}
                        onDelete={() => onDelete(widget._id!)}
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export { WidgetSkeleton } from "./widgetSkeleton";
export default AnalyticsGrid;
