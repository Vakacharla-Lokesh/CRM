import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  WidgetType,
  WidgetEntity,
  WidgetMetric,
  GroupByField,
} from "@/services/api/";

import type { ChartConfigModalProps } from "@/types/constants/analytics/analyticsChartTypes";

import {
  CHART_TYPES,
  ENTITIES,
  METRICS,
  GROUP_BY_OPTIONS,
  DEFAULT_POSITION,
} from "@/types/constants/analytics/analyticsChartTypes";

function ChartConfigModal({
  open,
  onClose,
  onSave,
  initialWidget,
}: ChartConfigModalProps) {
  const [title, setTitle] = useState(initialWidget?.title ?? "");
  const [type, setType] = useState<WidgetType>(initialWidget?.type ?? "bar");
  const [entity, setEntity] = useState<WidgetEntity>(
    initialWidget?.entity ?? "leads",
  );
  const [metric, setMetric] = useState<WidgetMetric>(
    initialWidget?.metric ?? "count",
  );
  const [groupBy, setGroupBy] = useState<GroupByField>(
    initialWidget?.groupBy ?? "leadStatus",
  );

  const handleEntityChange = (val: WidgetEntity) => {
    setEntity(val);
    // Reset groupBy to first valid option for this entity
    const firstOption = GROUP_BY_OPTIONS[val]?.[0]?.value;
    if (firstOption) setGroupBy(firstOption);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      type,
      entity,
      title: title.trim(),
      filters: {},
      groupBy,
      metric,
      position: initialWidget?.position ?? DEFAULT_POSITION,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialWidget?.title ? "Edit Widget" : "Add Widget"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="widget-title"
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Title
            </label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Leads by Status"
            />
          </div>

          {/* Chart Type */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Chart Type
            </label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as WidgetType)}
            >
              <SelectTrigger id="widget-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((t) => (
                  <SelectItem
                    key={t.value}
                    value={t.value}
                  >
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entity */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Data Source
            </label>
            <Select
              value={entity}
              onValueChange={(v) => handleEntityChange(v as WidgetEntity)}
            >
              <SelectTrigger id="widget-entity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITIES.map((e) => (
                  <SelectItem
                    key={e.value}
                    value={e.value}
                  >
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Group By */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Group By
            </label>
            <Select
              value={groupBy}
              onValueChange={(v) => setGroupBy(v as GroupByField)}
            >
              <SelectTrigger id="widget-groupby">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUP_BY_OPTIONS[entity].map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metric */}
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              Metric
            </label>
            <Select
              value={metric}
              onValueChange={(v) => setMetric(v as WidgetMetric)}
            >
              <SelectTrigger id="widget-metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            id="widget-save-btn"
            onClick={handleSave}
            disabled={!title.trim()}
          >
            {initialWidget?.title ? "Update Widget" : "Add Widget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChartConfigModal;
