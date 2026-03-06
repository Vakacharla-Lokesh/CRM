import { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  Calendar,
  User,
  Link2,
  Trash2,
  Pencil,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useTaskData } from "@/hooks/useTaskData";
import type { Task, CreateTaskDTO } from "@/services/api/tasks.api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RelationCombobox } from "@/components/modals/form-fields/relationComboBox";

// ─── Column config ───────────────────────────────────────────────────
const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "bg-slate-100 dark:bg-slate-800" },
  {
    id: "in_progress",
    label: "In Progress",
    color: "bg-blue-50 dark:bg-blue-950",
  },
  {
    id: "in_review",
    label: "In Review",
    color: "bg-yellow-50 dark:bg-yellow-950",
  },
  { id: "done", label: "Done", color: "bg-green-50 dark:bg-green-950" },
];

const PRIORITY_BADGE: Record<
  Task["priority"],
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  high: {
    label: "High",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

// ─── Task Card ───────────────────────────────────────────────────────
function TaskCard({
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

// ─── Task Modal ──────────────────────────────────────────────────────
const EMPTY_FORM: CreateTaskDTO = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  relationType: null,
  relationId: null,
  dueDate: null,
  assignedTo: null,
};

function TaskModal({
  open,
  task,
  onClose,
  onSave,
  isSaving,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (dto: CreateTaskDTO) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<CreateTaskDTO>(
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
          relationType: task.relationType ?? null,
          relationId: task.relationId ?? null,
          dueDate: task.dueDate ? task.dueDate.slice(0, 10) : null,
          assignedTo: task.assignedTo?._id ?? null,
        }
      : EMPTY_FORM,
  );

  const set = <K extends keyof CreateTaskDTO>(
    key: K,
    value: CreateTaskDTO[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSave({
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "New Task"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1">
            <Label>
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional details…"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as Task["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                    >
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as Task["priority"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_BADGE).map(([k, v]) => (
                    <SelectItem
                      key={k}
                      value={k}
                    >
                      {v.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Relation type */}
            <div className="space-y-1">
              <Label>Relation Type</Label>
              <Select
                value={form.relationType ?? "none"}
                onValueChange={(v) => {
                  set(
                    "relationType",
                    v === "none" ? null : (v as Task["relationType"]),
                  );
                  set("relationId", null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Relation entity picker — only shown when a type is selected */}
            {form.relationType && (
              <RelationCombobox
                relationType={form.relationType}
                value={form.relationId ?? null}
                onChange={(v) => set("relationId", v)}
              />
            )}

            {/* Due date */}
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate ?? ""}
                onChange={(e) => set("dueDate", e.target.value || null)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
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
        await updateTask.mutateAsync({ id: editingTask._id, dto });
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
      { id: draggableId, status: newStatus },
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
