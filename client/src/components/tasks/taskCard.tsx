import { Draggable } from "@hello-pangea/dnd";
import {
  Calendar,
  User,
  Link2,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import type { Task } from "@/services/api/tasks.api";
import { PRIORITY_BADGE } from "@/types/constants/tasks";

export function TaskCard({
  task,
  index,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const priority = PRIORITY_BADGE[task.priority];
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "done";

  return (
    <Draggable
      draggableId={task._id}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-xl border p-3 bg-white dark:bg-gray-900 shadow-sm transition-shadow cursor-grab active:cursor-grabbing group ${
            snapshot.isDragging
              ? "shadow-lg rotate-1 ring-2 ring-primary/30"
              : "hover:shadow-md"
          }`}
        >
          {/* Title + actions */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-snug text-gray-900 dark:text-white flex-1">
              {task.title}
            </p>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Description snippet */}
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Priority badge */}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${priority.className}`}
            >
              {priority.label}
            </span>

            {/* Relation */}
            {task.relationType && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Link2 size={10} />
                {task.relationType}
              </span>
            )}

            {/* Due date */}
            {task.dueDate && (
              <span
                className={`flex items-center gap-1 text-[10px] ${
                  isOverdue
                    ? "text-red-500 font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {isOverdue && <AlertCircle size={10} />}
                <Calendar size={10} />
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Assignee */}
          {task.assignedTo && (
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <User
                  size={10}
                  className="text-primary"
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {task.assignedTo.firstName} {task.assignedTo.lastName}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
