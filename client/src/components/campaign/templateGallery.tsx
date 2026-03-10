import {
  useCampaignTemplates,
  useCreateTemplate,
  useDeleteTemplate,
  useIncrementTemplateUsage,
  useUpdateTemplate,
} from "@/hooks/useCampaigns";
import { useState } from "react";
import type { CampaignTemplate } from "@/services/campaignService";
import {
  STARTER_TEMPLATES,
  type TemplateFormState,
} from "@/types/constants/campaign";
import { Button } from "../ui/button";
import {
  FileText,
  LayoutTemplate,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { Input } from "../ui/input";
import TemplateCard from "./templateCard";
import { lazy, Suspense } from "react";
import { ConfirmDialog } from "../common/confirmDialog";
const TemplateModal = lazy(() => import("../modals/campaignTemplateModal"));

function TemplateGallery({
  onSelect,
}: {
  onSelect?: (subject: string, body: string) => void;
}) {
  const { data: templates = [], isLoading } = useCampaignTemplates();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateTemplate();
  const { mutate: deleteTemplate } = useDeleteTemplate();
  const { mutate: incrementUsage } = useIncrementTemplateUsage();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<CampaignTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampaignTemplate | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const allCategories = [
    "All",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const filterFn = (t: CampaignTemplate) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    return matchSearch && matchCat;
  };

  const filterStarter = (t: (typeof STARTER_TEMPLATES)[number]) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    return matchSearch && matchCat;
  };

  const handleUse = (subject: string, body: string, id?: string) => {
    if (id) incrementUsage(id);
    onSelect?.(subject, body);
  };

  const handleCreate = (form: TemplateFormState) => {
    createTemplate(form, { onSuccess: () => setShowCreate(false) });
  };

  const handleUpdate = (form: TemplateFormState) => {
    if (!editTarget) return;
    updateTemplate(
      { id: editTarget._id, data: form },
      { onSuccess: () => setEditTarget(null) },
    );
  };

  const filteredSaved = templates.filter(filterFn);
  const filteredStarters = STARTER_TEMPLATES.filter(filterStarter);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <LayoutTemplate
              size={16}
              className="text-muted-foreground"
            />
            Template Gallery
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Click any template to pre-fill the compose form
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowCreate(true)}
        >
          <Plus
            size={14}
            className="mr-1.5"
          />
          New Template
        </Button>
      </div>

      {/* Search + category filters */}
      <div className="space-y-2">
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
        <div className="flex gap-1.5 flex-wrap">
          {allCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* My saved templates */}
      {isLoading ? (
        <div className="flex items-center justify-center h-24">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : filteredSaved.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <FileText size={11} />
            My Templates ({filteredSaved.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSaved.map((t) => (
              <TemplateCard
                key={t._id}
                template={t}
                onUse={() => handleUse(t.subject, t.body, t._id)}
                onEdit={() => setEditTarget(t)}
                onDelete={() => setDeleteTarget(t)}
              />
            ))}
          </div>
        </div>
      ) : (
        !isLoading &&
        templates.length === 0 && (
          <div className="border rounded-xl py-10 text-center">
            <LayoutTemplate
              size={28}
              className="mx-auto text-muted-foreground/30 mb-2"
            />
            <p className="text-sm font-medium text-muted-foreground">
              No saved templates yet
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
              Create reusable templates to speed up your campaigns
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreate(true)}
            >
              <Plus
                size={14}
                className="mr-1.5"
              />
              Create your first template
            </Button>
          </div>
        )
      )}

      {/* Starter templates */}
      {filteredStarters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
            <Sparkles size={11} />
            Starter Templates
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredStarters.map((t, i) => (
              <TemplateCard
                key={i}
                template={{ ...t, usageCount: 0 }}
                isStarter
                onUse={() => handleUse(t.subject, t.body)}
              />
            ))}
          </div>
        </div>
      )}

      {filteredSaved.length === 0 &&
        filteredStarters.length === 0 &&
        !isLoading && (
          <div className="border rounded-xl py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No templates match your search
            </p>
          </div>
        )}

      <Suspense fallback={null}>
        <TemplateModal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onSave={handleCreate}
          isSaving={isCreating}
        />
      </Suspense>

      {/* Edit modal */}
      <Suspense fallback={null}>
        {editTarget && (
          <TemplateModal
            open={!!editTarget}
            onClose={() => setEditTarget(null)}
            initial={{
              name: editTarget.name,
              description: editTarget.description,
              category: editTarget.category,
              subject: editTarget.subject,
              body: editTarget.body,
            }}
            onSave={handleUpdate}
            isSaving={isUpdating}
          />
        )}
      </Suspense>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This template will be permanently removed. Campaigns already sent using this template are not affected."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTemplate(deleteTarget._id);
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}

export default TemplateGallery;
