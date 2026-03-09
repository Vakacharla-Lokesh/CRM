import type { Lead, Pipeline } from "@/types";

interface LeadStageProgressProps {
  lead: Lead;
  leadPipeline: Pipeline | undefined;
  isUpdatingStatus: boolean;
  onStageChange: (
    leadId: string,
    newStatus: string,
    currentStatus: string,
  ) => Promise<void>;
}

export function LeadStageProgress({
  lead,
  leadPipeline,
  isUpdatingStatus,
  onStageChange,
}: LeadStageProgressProps) {
  if (!lead || !leadPipeline) return null;

  const allStages = leadPipeline.statuses
    .filter((s) => s.label !== "Converted")
    .sort((a, b) => a.order - b.order);

  const currentIndex = allStages.findIndex(
    (s) => s.label.toLowerCase() === lead.status.toLowerCase(),
  );

  const isConverted = lead.status === "Converted";
  const isDead =
    currentIndex !== -1 &&
    allStages[currentIndex].label.toLowerCase() === "dead";

  const visibleStages = isDead
    ? allStages.slice(0, currentIndex + 1)
    : allStages;

  const isLastStage = !isDead && currentIndex === visibleStages.length - 1;

  const handleMarkComplete = async () => {
    if (isLastStage || isDead || isConverted) return;
    const next = allStages[currentIndex + 1];
    if (next) await onStageChange(lead._id, next.label, lead.status);
  };

  return (
    <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5 shadow-sm">
      <div className="flex items-stretch flex-1 min-w-0 overflow-hidden rounded-md">
        {isConverted
          ? allStages.map((stage, idx) => (
              <div
                key={stage.label}
                className="flex-1 flex items-center justify-center h-9 text-xs font-semibold bg-primary/20 text-primary relative"
                style={{
                  clipPath:
                    idx < allStages.length - 1
                      ? "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)"
                      : undefined,
                  paddingLeft: idx === 0 ? "10px" : "18px",
                  paddingRight: idx < allStages.length - 1 ? "18px" : "10px",
                  zIndex: allStages.length - idx,
                  marginRight: idx < allStages.length - 1 ? "-1px" : 0,
                }}
              >
                <span className="mr-1 opacity-70">✓</span>
                {stage.label}
              </div>
            ))
          : visibleStages.map((stage, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isDeadStage = isDead && isCurrent;

              let stageClass =
                "flex-1 flex items-center justify-center h-9 text-xs font-semibold transition-colors duration-150 relative ";

              if (isDeadStage) {
                stageClass +=
                  "bg-destructive text-destructive-foreground cursor-default";
              } else if (isCompleted) {
                stageClass +=
                  "bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer";
              } else if (isCurrent) {
                stageClass +=
                  "bg-primary text-primary-foreground cursor-default";
              } else {
                stageClass +=
                  "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer";
              }

              const isLast = idx === visibleStages.length - 1;

              return (
                <button
                  key={stage.label}
                  onClick={() => {
                    if (!isDeadStage && !isUpdatingStatus) {
                      void onStageChange(lead._id, stage.label, lead.status);
                    }
                  }}
                  disabled={isUpdatingStatus || isDeadStage || isCurrent}
                  title={
                    isDeadStage
                      ? "Lead is dead"
                      : isCurrent
                        ? `Current: ${stage.label}`
                        : `Jump to ${stage.label}`
                  }
                  className={stageClass}
                  style={{
                    clipPath: !isLast
                      ? "polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)"
                      : undefined,
                    paddingLeft: idx === 0 ? "10px" : "18px",
                    paddingRight: !isLast ? "18px" : "10px",
                    zIndex: visibleStages.length - idx,
                    marginRight: !isLast ? "-1px" : 0,
                  }}
                >
                  {isCompleted && <span className="mr-1 opacity-70">✓</span>}
                  {stage.label}
                  {isUpdatingStatus && isCurrent && (
                    <span className="ml-1.5 inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
                  )}
                </button>
              );
            })}
      </div>

      {/* Right action */}
      {isConverted && (
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
          Converted ✓
        </span>
      )}

      {isDead && (
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-destructive/15 text-destructive text-xs font-semibold">
          Dead ✗
        </span>
      )}

      {!isConverted && !isDead && !isLastStage && (
        <button
          onClick={() => void handleMarkComplete()}
          disabled={isUpdatingStatus}
          className="shrink-0 flex items-center gap-1.5 px-3 h-9 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isUpdatingStatus ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>✓</span>
          )}
          Mark as Complete
        </button>
      )}
    </div>
  );
}
