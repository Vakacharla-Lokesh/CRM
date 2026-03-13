import {
  LayoutTemplate,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { CATEGORIES } from "@/types/constants/campaign";
import { useState } from "react";
import type { TemplateCategory } from "@/services/campaignService";
import { ThemedMDEditor } from "../ui/mdEditor";

interface TemplateFormState {
  name: string;
  description: string;
  category: TemplateCategory;
  subject: string;
  body: string;
}

const EMPTY_FORM: TemplateFormState = {
  name: "",
  description: "",
  category: "Custom",
  subject: "",
  body: "",
};

function TemplateModal({
  open,
  onClose,
  initial,
  onSave,
  isSaving,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<TemplateFormState>;
  onSave: (data: TemplateFormState) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<TemplateFormState>(() => ({
    ...EMPTY_FORM,
    ...initial,
  }));

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) setForm({ ...EMPTY_FORM, ...initial });
    else onClose();
  };

  const set =
    (field: keyof TemplateFormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const isValid = form.name.trim() && form.subject.trim() && form.body.trim();
  const isEditing = !!initial?.name;

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate size={18} />
            {isEditing ? "Edit Template" : "Create Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your campaign template"
              : "Create a new template for future campaigns"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name and Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Template Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g., Welcome to this Campaign"
                value={form.name}
                onChange={set("name")}
                disabled={isSaving}
              />
              {form.name && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2
                    size={12}
                    className="text-green-600"
                  />
                  Name entered
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    category: value as TemplateCategory,
                  }))
                }
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="What is this template for? e.g., 'Initial contact for new leads'"
              value={form.description}
              onChange={set("description")}
              rows={2}
              className="resize-none"
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              {form.description.length}/150 characters
            </p>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Subject Line <span className="text-destructive">*</span>
              </label>
              {form.subject && (
                <span className="text-xs text-muted-foreground">
                  {form.subject.length} characters
                </span>
              )}
            </div>
            <Input
              placeholder="e.g., Quick question about your campaign"
              value={form.subject}
              onChange={set("subject")}
              disabled={isSaving}
            />
          </div>

          {/* Email Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Email Body <span className="text-destructive">*</span>
              </label>
              {form.body && (
                <span className="text-xs text-muted-foreground">
                  {form.body.length} characters
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Write in Markdown format. Links will automatically be tracked.
            </p>
            <ThemedMDEditor
              value={form.body}
              onChange={(val) => setForm((f) => ({ ...f, body: val ?? "" }))}
              height={280}
              preview="edit"
              visibleDragbar={false}
              disabled={isSaving}
            />
          </div>

          {/* Validation Status */}
          {form.name || form.subject || form.body ? (
            <div className="bg-blue-50 border border-blue-200/50 rounded-lg p-3 flex gap-2">
              {isValid ? (
                <>
                  <CheckCircle2
                    size={16}
                    className="text-green-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-foreground">
                    <p className="font-medium">Ready to save</p>
                    <p className="text-xs text-muted-foreground">
                      All required fields are filled
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle
                    size={16}
                    className="text-amber-600 shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-foreground">
                    <p className="font-medium">Complete required fields</p>
                    <p className="text-xs text-muted-foreground">
                      Template name, subject, and body are required
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : null}
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
            onClick={() => onSave(form)}
            disabled={!isValid || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2
                  size={14}
                  className="animate-spin mr-2"
                />
                Saving...
              </>
            ) : (
              <>
                <LayoutTemplate
                  size={14}
                  className="mr-2"
                />
                Save Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateModal;
