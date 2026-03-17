/* eslint-disable react-hooks/set-state-in-effect */
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
import { useState, useEffect } from "react";
import { EMPTY_FORM } from "@/types/interfaces/form-interfaces/task.form.interfaces";
import { toast } from "sonner";
import { COLUMNS, PRIORITY_BADGE } from "@/types/constants/tasks";
import { Button } from "../ui/button";
import {
  CheckSquare2,
  Link2,
  FileText,
  Settings2,
  BadgeAlert,
} from "lucide-react";

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
  const [form, setForm] = useState<CreateTaskDTO>(EMPTY_FORM);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        relationType: task.relationType ?? null,
        relationId: task.relationId ?? null,
        assignedTo: task.assignedTo?._id ?? null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [task]);

  const set = <K extends keyof CreateTaskDTO>(
    key: K,
    value: CreateTaskDTO[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    onSave(form);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <CheckSquare2 className="h-5 w-5 text-primary" />
            </div>

            <div>
              <DialogTitle className="text-xl">
                {task ? "Edit Task" : "Create Task"}
              </DialogTitle>

              <p className="text-sm text-muted-foreground mt-1">
                {task
                  ? "Update task details"
                  : "Create a task and assign it to your team"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Title */}
          <div className="space-y-2">
            <Label className="font-medium">
              Title <span className="text-destructive">*</span>
            </Label>

            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Follow up with client"
              className="h-11"
            />

            {form.title.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {form.title.length}/200
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium">
              <FileText className="h-4 w-4" />
              Description
            </Label>

            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add optional details..."
              rows={4}
              className="resize-none"
            />

            {form.description && (
              <p className="text-xs text-muted-foreground">
                {form.description.length}/2000
              </p>
            )}
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <Settings2 className="h-4 w-4" />
                Status
              </Label>

              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as Task["status"])}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {COLUMNS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {c.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-medium">
                <BadgeAlert className="h-4 w-4" />
                Priority
              </Label>

              <Select
                value={form.priority}
                onValueChange={(v) => set("priority", v as Task["priority"])}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {Object.entries(PRIORITY_BADGE).map(([k, v]) => {
                    const Icon = v.icon;
                    return (
                      <SelectItem
                        key={k}
                        value={k}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {v.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Relation Section */}
          <div className="border rounded-lg p-5 space-y-4 bg-muted/30">
            <Label className="flex items-center gap-2 font-medium">
              <Link2 className="h-4 w-4" />
              Link to Entity
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relation Type */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Entity Type
                </Label>

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

              {/* Relation Entity */}
              {form.relationType && (
                <div className="space-y-2">
                  <RelationCombobox
                    relationType={form.relationType}
                    value={form.relationId ?? null}
                    onChange={(v) => set("relationId", v)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="border-t pt-4 flex justify-end gap-2">
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
