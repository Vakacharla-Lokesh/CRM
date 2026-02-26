import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import workflowService from "@/services/workflowService";
import type { Workflow } from "@/types/workflows";

interface WorkflowLogsPanelProps {
  workflow: Workflow | null;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  success:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  queued:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  retry:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

const WorkflowLogsPanel = ({ workflow, onClose }: WorkflowLogsPanelProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["workflow-logs", workflow?._id],
    queryFn: () => workflowService.getWorkflowLogs(workflow!._id),
    enabled: !!workflow,
  });

  return (
    <Dialog
      open={!!workflow}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Execution Logs</DialogTitle>
          <DialogDescription>
            {workflow?.name} — last {data?.count ?? "…"} executions
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading logs…</p>
          )}

          {!isLoading && data?.logs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No executions yet for this workflow.
            </p>
          )}

          {data?.logs.map((log) => (
            <div
              key={log._id}
              className="border rounded-lg p-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(log.triggeredAt).toLocaleString()}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[log.status] ?? ""}`}
                >
                  {log.status}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-xs capitalize"
                >
                  {log.entityType}
                </Badge>
                {log.retryCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs"
                  >
                    Retry {log.retryCount}/{log.maxRetries}
                  </Badge>
                )}
              </div>

              {log.results.length > 0 && (
                <ul className="text-xs space-y-1 mt-1">
                  {log.results.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-1.5"
                    >
                      <span
                        className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                          r.status === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <span className="text-muted-foreground">
                        <span className="font-medium capitalize">
                          {r.actionType}
                        </span>
                        {" — "}
                        {r.message ?? r.error ?? r.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowLogsPanel;
