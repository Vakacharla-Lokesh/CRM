import { LayoutTemplate, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { CATEGORIES } from "@/types/constants/campaign";
import { useState } from "react";
import type { TemplateCategory } from "@/services/campaignService";
import { useTheme } from "@/context/themeContext";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

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
  const { mode } = useTheme();
  const colorMode =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;

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

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate size={16} />
            {initial?.name ? "Edit Template" : "Create New Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Template Name <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. Pricing Announcement"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <select
                value={form.category}
                onChange={set("category")}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CATEGORIES.map((c) => (
                  <option
                    key={c}
                    value={c}
                  >
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Short description of this template's purpose"
              value={form.description}
              onChange={set("description")}
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Subject Line <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Exciting update for {{firstName}} 🎉"
              value={form.subject}
              onChange={set("subject")}
            />
            <p className="text-xs text-muted-foreground">
              Use{" "}
              <code className="bg-muted px-1 rounded text-xs">
                {"{{firstName}}"}
              </code>{" "}
              or{" "}
              <code className="bg-muted px-1 rounded text-xs">
                {"{{company}}"}
              </code>{" "}
              for personalization
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Email Body <span className="text-destructive">*</span>
            </label>
            <p className="text-xs text-muted-foreground">
              Use Markdown to format your email. Any links you insert will
              automatically be wrapped with click tracking.
            </p>
            <div data-color-mode={colorMode}>
              <MDEditor
                value={form.body}
                onChange={(val) =>
                  setForm((f) => ({ ...f, body: val ?? "" }))
                }
                height={320}
                preview="edit"
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
            onClick={() => onSave(form)}
            disabled={!isValid || isSaving}
          >
            {isSaving ? (
              <Loader2
                size={14}
                className="animate-spin mr-2"
              />
            ) : (
              <LayoutTemplate
                size={14}
                className="mr-2"
              />
            )}
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TemplateModal;
