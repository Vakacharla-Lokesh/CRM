import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { SelectItem } from "@/components/ui/select";
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
  ENTITIES,
  METRICS,
  GROUP_BY_OPTIONS,
  DEFAULT_POSITION,
} from "@/types/constants/analytics/analyticsChartTypes";

import {
  ChartTypePicker,
  ConfigRow,
  IconBarSmall,
  IconDatabase,
  IconLayers,
  IconSigma,
  IconT,
  IconTrendUp,
  IconUpDown,
  PillSelect,
  ReadonlyValue,
  RowDivider,
  SectionLabel,
} from "./analyticHelpers";

// ─── Main modal ───────────────────────────────────────────────────────────────

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

  // Derived display-only values for Y Axis read-only rows
  const currentMetricLabel =
    METRICS.find((m) => m.value === metric)?.label ?? metric;
  const currentGroupByLabel =
    GROUP_BY_OPTIONS[entity]?.find((o) => o.value === groupBy)?.label ??
    groupBy;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-sm p-0 overflow-hidden gap-0"
        style={{ backgroundColor: "var(--background)" }}
      >
        {/* Header */}
        <DialogHeader
          className="px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <DialogTitle className="text-base font-bold tracking-tight">
            {initialWidget?.title ? "Edit Widget" : "Add Widget"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 pb-2 overflow-y-auto max-h-[72vh]">
          {/* Chart type icon picker */}
          <ChartTypePicker
            value={type}
            onChange={setType}
          />

          {/* ── DATA ────────────────────────────────────── */}
          <SectionLabel label="Data" />

          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            {/* Title */}
            <div className="flex items-center justify-between gap-4 py-2.5 px-3">
              <div className="flex items-center gap-3 shrink-0">
                <span style={{ color: "var(--muted-foreground)" }}>
                  <IconT />
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Title
                </span>
              </div>
              <Input
                id="widget-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leads by Status"
                className="border-0 bg-transparent shadow-none h-auto p-0 text-right text-sm focus-visible:ring-0 focus-visible:ring-offset-0 max-w-[180px]"
                style={{ color: "var(--foreground)" }}
              />
            </div>

            <RowDivider />

            {/* Source */}
            <ConfigRow
              icon={<IconDatabase />}
              label="Source"
            >
              <PillSelect
                id="widget-entity"
                value={entity}
                onValueChange={(v) => handleEntityChange(v as WidgetEntity)}
              >
                {ENTITIES.map((e) => (
                  <SelectItem
                    key={e.value}
                    value={e.value}
                  >
                    {e.label}
                  </SelectItem>
                ))}
              </PillSelect>
            </ConfigRow>

            <RowDivider />

            {/* Metric */}
            <ConfigRow
              icon={<IconSigma />}
              label="Metric"
            >
              <PillSelect
                id="widget-metric"
                value={metric}
                onValueChange={(v) => setMetric(v as WidgetMetric)}
              >
                {METRICS.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value}
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </PillSelect>
            </ConfigRow>
          </div>

          {/* ── X AXIS ──────────────────────────────────── */}
          <SectionLabel label="X Axis" />

          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            <ConfigRow
              icon={<IconBarSmall />}
              label="Group by"
            >
              <PillSelect
                id="widget-groupby"
                value={groupBy}
                onValueChange={(v) => setGroupBy(v as GroupByField)}
              >
                {GROUP_BY_OPTIONS[entity].map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </PillSelect>
            </ConfigRow>
          </div>

          {/* ── Y AXIS ──────────────────────────────────── */}
          <SectionLabel label="Y Axis" />

          <div
            className="rounded-xl overflow-hidden mb-4"
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
            }}
          >
            {/* Data on display — read-only, mirrors metric */}
            <ConfigRow
              icon={<IconTrendUp />}
              label="Data on display"
            >
              <ReadonlyValue value={currentMetricLabel} />
            </ConfigRow>

            <RowDivider />

            {/* Sort by — static read-only */}
            <ConfigRow
              icon={<IconUpDown />}
              label="Sort by"
            >
              <ReadonlyValue value="Value desc" />
            </ConfigRow>

            <RowDivider />

            {/* Group by — read-only, mirrors X axis groupBy */}
            <ConfigRow
              icon={<IconLayers />}
              label="Group by"
            >
              <ReadonlyValue value={currentGroupByLabel} />
            </ConfigRow>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter
          className="px-4 py-3 gap-2 flex flex-row"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-full"
          >
            Cancel
          </Button>
          <Button
            id="widget-save-btn"
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 rounded-full"
          >
            {initialWidget?.title ? "Update Widget" : "Add Widget"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChartConfigModal;
