export interface PipelineStage {
  label: string;
  color: string;
  order: number;
}

export interface Pipeline {
  _id: string;
  pipelineId?: string;
  userId: string;
  tenantId?: string;
  name: string;
  isDefault: boolean;
  statuses: PipelineStage[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePipelineDTO {
  name: string;
  statuses: PipelineStage[];
}

export interface UpdatePipelineDTO {
  name?: string;
  statuses?: PipelineStage[];
}

export function getPipelineStage(
  pipeline: Pipeline | null | undefined,
  statusLabel: string,
): PipelineStage | undefined {
  return pipeline?.statuses.find(
    (s) => s.label.toLowerCase() === statusLabel.toLowerCase(),
  );
}

export const STAGE_COLORS = [
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#10b981", label: "Green" },
  { hex: "#f59e0b", label: "Yellow" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#8b5cf6", label: "Purple" },
  { hex: "#f97316", label: "Orange" },
  { hex: "#06b6d4", label: "Cyan" },
  { hex: "#ec4899", label: "Pink" },
  { hex: "#6b7280", label: "Gray" },
  { hex: "#1f2937", label: "Dark" },
];

export interface PipelineModalProps {
  isOpen: boolean;
  pipeline?: Pipeline | null; // null/undefined = create mode
  onClose: () => void;
  onSave: (data: CreatePipelineDTO | UpdatePipelineDTO) => Promise<void>;
}

export interface DraftStage extends PipelineStage {
  _localId: string;
}