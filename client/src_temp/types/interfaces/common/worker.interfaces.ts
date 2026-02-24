export interface WorkerState {
  isRunning: boolean;
  progress: number;
  processedItems: number;
  totalItems: number;
  startTime: number | null;
  estimatedTime: number | null;
}