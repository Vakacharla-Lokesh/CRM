import { useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
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

  const onDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as Task["status"];
    const task = tasks.find((t) => t._id === draggableId);
    if (!task || task.status === newStatus) return;

    updateTaskStatus.mutate(
      {
        id: draggableId,
        status: newStatus,
        lastKnownUpdatedAt: task.updatedAt
          ? new Date(task.updatedAt)
          : undefined,
      },
      { onError: () => toast.error("Failed to move task") },
    );
  };

  const tasksByStatus = (status: Task["status"]) =>
    tasks.filter((t) => t.status === status);

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
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            {COLUMNS.map((col) => {
              const colTasks = tasksByStatus(col.id);
              return (
                <div
                  key={col.id}
                  className={`rounded-2xl p-3 ${col.color}`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {col.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {colTasks.length}
                    </Badge>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-30 rounded-xl transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed"
                            : ""
                        }`}
                      >
                        {colTasks.map((task, index) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            index={index}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                        {provided.placeholder}

                        {/* Empty state */}
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                            No tasks
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
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
