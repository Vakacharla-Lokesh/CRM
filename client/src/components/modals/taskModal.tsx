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
import type { CreateTaskDTO, Task } from "@/services/api/tasks.api";
import { useState } from "react";
import { EMPTY_FORM } from "@/types/interfaces/form-interfaces/task.form.interfaces";
import { toast } from "sonner";
import { COLUMNS, PRIORITY_BADGE } from "@/types/constants/tasks";
import { Button } from "../ui/button";

export function TaskModal({
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
