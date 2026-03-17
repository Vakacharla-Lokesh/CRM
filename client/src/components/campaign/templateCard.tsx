import type { CampaignTemplate } from "@/services/campaignService";
import { CATEGORY_STYLE } from "@/types/constants/campaign";
import { ChevronRight, Edit2, Trash2 } from "lucide-react";

function TemplateCard({
  template,
  onUse,
  onEdit,
  onDelete,
  isStarter,
}: {
  template: Pick<
    CampaignTemplate,
    "name" | "description" | "subject" | "category"
  > & { usageCount?: number };
  onUse: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isStarter?: boolean;
}) {
  return (
    <div className="group relative border rounded-xl bg-card hover:border-primary/40 hover:shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={onUse}
        className="w-full text-left p-4 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
      >
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${
            CATEGORY_STYLE[template.category]
          }`}
        >
          {template.category}
        </span>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{template.name}</p>
            {template.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {template.description}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground/60 mt-1 truncate font-mono">
              {template.subject}
            </p>
          </div>
          <ChevronRight
            size={14}
            className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-0.5"
          />
        </div>
      </button>

      {!isStarter && (
        <div className="flex items-center gap-1 px-4 pb-3 border-t">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit template"
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete template"
          >
            <Trash2 size={12} />
          </button>
          {(template.usageCount ?? 0) > 0 && (
            <span className="text-[10px] text-muted-foreground ml-auto">
              Used {template.usageCount}×
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default TemplateCard;
