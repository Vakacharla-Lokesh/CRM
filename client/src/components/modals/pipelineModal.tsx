/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
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

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openColorPicker, setOpenColorPicker] = useState<string | null>(null);
  const paletteRef = useRef<HTMLDivElement | null>(null);

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

  const reorder = (list: DraftStage[], from: number, to: number) => {
    const result = [...list];
    const [moved] = result.splice(from, 1);
    result.splice(to, 0, moved);

    const convertedIdx = result.findIndex(isConverted);

    if (convertedIdx !== result.length - 1) {
      const [conv] = result.splice(convertedIdx, 1);
      result.push(conv);
    }

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

  useEffect(() => {
    if (!openColorPicker) return;

    function onDocClick(e: MouseEvent) {
      const el = paletteRef.current as HTMLDivElement | null;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setOpenColorPicker(null);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openColorPicker]);

  const validate = () => {
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
        statuses: stages.map(({ _localId, ...rest }) => rest),
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to save pipeline",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Pipeline" : "Create Pipeline"}
          </DialogTitle>
          <DialogDescription>
            Define the pipeline name and stages used to track lead progress.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Pipeline Name */}
          <div className="space-y-2">
            <Label htmlFor="pipeline-name">
              Pipeline Name <span className="text-red-500">*</span>
            </Label>

            <Input
              id="pipeline-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              placeholder="Sales Pipeline"
              className={nameError ? "border-red-500" : ""}
            />

            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>

          {/* Stages */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stages</Label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStage}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Stage
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              The <strong>Converted</strong> stage is required and always stays
              last in the pipeline.
            </p>

            {stagesError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {stagesError}
              </p>
            )}

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
                      "flex items-center gap-3 p-3 rounded-md border transition",
                      locked
                        ? "bg-muted border-border opacity-80"
                        : "bg-background border-border cursor-grab",
                      isDragging ? "opacity-40" : "",
                      isOver && !locked ? "border-primary" : "",
                    ].join(" ")}
                  >
                    {/* Drag Handle */}
                    <div
                      className={
                        locked ? "opacity-20" : "text-muted-foreground"
                      }
                    >
                      {locked ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <GripVertical className="w-4 h-4" />
                      )}
                    </div>

                    {/* Color */}
                    <div className="relative">

                      <div
                        className="w-6 h-6 rounded-full border cursor-pointer"
                        style={{ backgroundColor: stage.color }}
                        onClick={(e) => {
                          if (locked) return;
                          e.stopPropagation();
                          setOpenColorPicker(stage._localId);
                        }}
                      />

                      {!locked && openColorPicker === stage._localId && (
                        <div
                          ref={paletteRef}
                          className="absolute top-8 left-0 flex-wrap gap-1 bg-popover border rounded p-2 shadow-md w-40 z-50"
                        >
                          {STAGE_COLORS.map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => {
                                updateStageColor(stage._localId, c.hex);
                                setOpenColorPicker(null);
                              }}
                              className="w-5 h-5 rounded-full border m-0.5"
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    {locked ? (
                      <span className="flex-1 text-sm font-medium">
                        {stage.label}
                      </span>
                    ) : (
                      <Input
                        value={stage.label}
                        onChange={(e) =>
                          updateStageLabel(stage._localId, e.target.value)
                        }
                        placeholder="Stage name"
                        className="flex-1 border-0 shadow-none focus-visible:ring-0 p-0 px-5 bg-transparent"
                      />
                    )}

                    {/* Remove */}
                    {locked ? (
                      <span className="text-xs text-muted-foreground italic">
                        required
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeStage(stage._localId)}
                        className="text-muted-foreground hover:text-red-500"
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

          <ModalFooter
            onCancel={onClose}
            isSubmitting={isSubmitting}
            submitLabel={isEditMode ? "Save Changes" : "Create Pipeline"}
            loadingLabel="Saving..."
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default PipelineModal;
