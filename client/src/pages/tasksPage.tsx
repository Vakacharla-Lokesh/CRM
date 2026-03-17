import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useTaskData } from "@/hooks/useTaskData";
import type { Task, CreateTaskDTO } from "@/services/api/tasks.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/tasks/taskCard";
import { TaskModal } from "@/components/modals/taskModal";
import { COLUMNS } from "@/types/constants/tasks";

export default function TasksPage() {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useTaskData();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const openCreate = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleSave = async (dto: CreateTaskDTO) => {
    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask._id,
          dto,
          lastKnownUpdatedAt: editingTask.updatedAt
            ? new Date(editingTask.updatedAt)
            : undefined,
        });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync(dto);
        toast.success("Task created");
      }
      setModalOpen(false);
    } catch {
      toast.error("Failed to save task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t._id === active.id);
    if (!task) return;

    const newStatus = over.id as Task["status"];
    if (task.status === newStatus) return;

    updateTaskStatus.mutate(
      {
        id: active.id as string,
        status: newStatus,
        lastKnownUpdatedAt: task.updatedAt
          ? new Date(task.updatedAt)
          : undefined,
      },
      { onError: () => toast.error("Failed to move task") },
    );
  }, [tasks, updateTaskStatus]);

  const tasksByStatus = useMemo(
    () => (status: Task["status"]) => tasks.filter((t) => t.status === status),
    [tasks],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track tasks across your team
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Plus size={16} />
          New Task
        </Button>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
          onDragStart={(event) => setActiveId(event.active.id as string)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col) => {
              const colTasks = tasksByStatus(col.id);
              return (
                <DropZone
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  icon={col.icon}
                  columnColor={col.columnColor}
                  tasks={colTasks}
                  activeId={activeId}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className="rounded-xl border p-3 bg-white dark:bg-gray-900 shadow-lg opacity-75 cursor-grabbing">
                <p className="text-sm font-medium">
                  {tasks.find((t) => t._id === activeId)?.title}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        isSaving={createTask.isPending || updateTask.isPending}
      />
    </div>
  );
}

// DropZone component using useDroppable
function DropZone({
  id,
  label,
  icon: Icon,
  columnColor,
  tasks,
  activeId,
  onEdit,
  onDelete,
}: {
  id: string;
  label: string;
  icon?: React.ElementType;
  columnColor: string;
  tasks: Task[];
  activeId: string | null;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      className={`rounded-2xl p-3 ${columnColor}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {label}
          </span>
        </div>
        <Badge
          variant="secondary"
          className="text-xs"
        >
          {tasks.length}
        </Badge>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`space-y-2 min-h-30 rounded-xl transition-colors ${
          isOver
            ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed"
            : ""
        }`}
      >
        {tasks.map((task, index) => (
          <TaskCard
            key={task._id}
            task={task}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}

        {/* Empty state */}
        {tasks.length === 0 && !activeId && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
}
