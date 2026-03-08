/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, X, Lock, Plus, AlertCircle } from "lucide-react";
import {
  STAGE_COLORS,
  type DraftStage,
  type PipelineModalProps,
  type PipelineStage,
} from "@/types/pipeline";
import { ModalFooter, ErrorAlert } from "./shared";

function makeLocalId() {
  return Math.random().toString(36).slice(2);
}

function toDraftStages(statuses: PipelineStage[]): DraftStage[] {
  return statuses.map((s) => ({ ...s, _localId: makeLocalId() }));
}

const DEFAULT_NEW_STAGES: DraftStage[] = [
  { label: "New", color: "#3b82f6", order: 0, _localId: makeLocalId() },
  { label: "Follow-Up", color: "#f59e0b", order: 1, _localId: makeLocalId() },
  { label: "Converted", color: "#10b981", order: 2, _localId: makeLocalId() },
];

export function PipelineModal({
  isOpen,
  pipeline,
  onClose,
  onSave,
}: PipelineModalProps) {
  const isEditMode = Boolean(pipeline);

  const [name, setName] = useState("");
  const [stages, setStages] = useState<DraftStage[]>(DEFAULT_NEW_STAGES);
  const [nameError, setNameError] = useState("");
  const [stagesError, setStagesError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Reset form when modal opens/closes or pipeline changes
  useEffect(() => {
    if (isOpen) {
      if (pipeline) {
        setName(pipeline.name);
        setStages(toDraftStages(pipeline.statuses));
      } else {
        setName("");
        setStages(
          DEFAULT_NEW_STAGES.map((s) => ({ ...s, _localId: makeLocalId() })),
        );
      }
      setNameError("");
      setStagesError("");
      setSubmitError("");
    }
  }, [isOpen, pipeline]);

  const isConverted = (stage: DraftStage) =>
    stage.label.toLowerCase() === "converted";

  const reorder = (
    list: DraftStage[],
    from: number,
    to: number,
  ): DraftStage[] => {
    const convertedIdx = list.findIndex(isConverted);
    const result = [...list];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);

    const newConvertedIdx = result.findIndex(isConverted);
    if (newConvertedIdx !== result.length - 1) {
      const [conv] = result.splice(newConvertedIdx, 1);
      result.push(conv);
    }

    if (convertedIdx === from) return list;

    return result.map((s, i) => ({ ...s, order: i }));
  };

  const addStage = () => {
    const convertedIdx = stages.findIndex(isConverted);
    const insertAt = convertedIdx >= 0 ? convertedIdx : stages.length;
    const newStage: DraftStage = {
      label: "",
      color: "#6b7280",
      order: insertAt,
      _localId: makeLocalId(),
    };
    const updated = [
      ...stages.slice(0, insertAt),
      newStage,
      ...stages.slice(insertAt),
    ].map((s, i) => ({ ...s, order: i }));
    setStages(updated);
    setStagesError("");
  };

  const removeStage = (localId: string) => {
    setStages((prev) =>
      prev
        .filter((s) => s._localId !== localId)
        .map((s, i) => ({ ...s, order: i })),
    );
  };

  const updateStageLabel = (localId: string, value: string) => {
    setStages((prev) =>
      prev.map((s) => (s._localId === localId ? { ...s, label: value } : s)),
    );
    setStagesError("");
  };

  const updateStageColor = (localId: string, color: string) => {
    setStages((prev) =>
      prev.map((s) => (s._localId === localId ? { ...s, color } : s)),
    );
  };

  const handleDragStart = (index: number) => {
    if (isConverted(stages[index])) return;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (isConverted(stages[index])) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || isConverted(stages[toIndex])) return;
    setStages(reorder(stages, dragIndex, toIndex));
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const validate = (): boolean => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Pipeline name is required");
      valid = false;
    } else {
      setNameError("");
    }

    if (stages.length < 2) {
      setStagesError("A pipeline must have at least 2 stages");
      valid = false;
    } else if (stages.some((s) => !s.label.trim())) {
      setStagesError("All stages must have a label");
      valid = false;
    } else {
      const labels = stages.map((s) => s.label.trim().toLowerCase());
      const unique = new Set(labels);
      if (labels.length !== unique.size) {
        setStagesError("Stage labels must be unique");
        valid = false;
      } else {
        setStagesError("");
      }
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        name: name.trim(),
        statuses: stages.map(({ _localId: _l, ...rest }) => rest),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save pipeline";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {isEditMode ? "Edit Pipeline" : "Create Pipeline"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update the pipeline name and stages."
                : "Define a pipeline and its stages for tracking leads."}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-6">
            {/* Pipeline Name */}
            <div className="space-y-2">
              <Label
                htmlFor="pipeline-name"
                className="text-sm font-semibold"
              >
                Pipeline Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pipeline-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                placeholder="e.g. Sales Pipeline, Enterprise Deals"
                className={nameError ? "border-red-500" : ""}
              />
              {nameError && <p className="text-sm text-red-500">{nameError}</p>}
            </div>

            {/* Stages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Stages</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addStage}
                  className="gap-1 h-8 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add Stage
                </Button>
              </div>

              {/* Info banner about Converted */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  The <strong>Converted</strong> stage is mandatory and always
                  appears last. It marks when a lead becomes a deal.
                </p>
              </div>

              {stagesError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {stagesError}
                </p>
              )}

              {/* Stage list */}
              <div className="space-y-2">
                {stages.map((stage, index) => {
                  const locked = isConverted(stage);
                  const isDragging = dragIndex === index;
                  const isOver = dragOverIndex === index;

                  return (
                    <div
                      key={stage._localId}
                      draggable={!locked}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={[
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        locked
                          ? "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 opacity-80"
                          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing",
                        isDragging ? "opacity-40 scale-[0.98]" : "",
                        isOver && !locked
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Drag handle */}
                      <div
                        className={
                          locked
                            ? "opacity-20 cursor-not-allowed"
                            : "text-gray-400 hover:text-gray-600"
                        }
                      >
                        {locked ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <GripVertical className="w-4 h-4" />
                        )}
                      </div>

                      {/* Color swatch + picker */}
                      <div className="relative group shrink-0">
                        <div
                          className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer ring-1 ring-gray-200 dark:ring-gray-600"
                          style={{ backgroundColor: stage.color }}
                        />
                        {!locked && (
                          <div className="absolute z-10 hidden group-hover:flex top-9 left-0 flex-wrap gap-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg w-44">
                            {STAGE_COLORS.map((c) => (
                              <button
                                key={c.hex}
                                type="button"
                                title={c.label}
                                onClick={() =>
                                  updateStageColor(stage._localId, c.hex)
                                }
                                className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-700 shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: c.hex }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stage label input */}
                      {locked ? (
                        <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          {stage.label}
                        </span>
                      ) : (
                        <Input
                          value={stage.label}
                          onChange={(e) =>
                            updateStageLabel(stage._localId, e.target.value)
                          }
                          placeholder="Stage name"
                          className="flex-1 h-8 text-sm border-0 shadow-none focus-visible:ring-0 p-0 bg-transparent"
                        />
                      )}

                      {/* Lock badge or remove button */}
                      {locked ? (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                          required
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removeStage(stage._localId)}
                          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove stage"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {submitError && <ErrorAlert message={submitError} />}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-4 border-t">
            <ModalFooter
              onCancel={onClose}
              isSubmitting={isSubmitting}
              submitLabel={isEditMode ? "Save Changes" : "Create Pipeline"}
              loadingLabel="Saving..."
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PipelineModal;
