import type {
  GroupByField,
  Widget,
  WidgetEntity,
  WidgetMetric,
  WidgetType,
} from "@/services/api/";

export interface ChartConfigModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (widget: Omit<Widget, "_id" | "data" | "createdAt">) => void;
  initialWidget?: Partial<Widget>;
}

export const CHART_TYPES: { value: WidgetType; label: string }[] = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "area", label: "Area Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "number", label: "Number Card" },
  { value: "table", label: "Table" },
];

export const ENTITIES: { value: WidgetEntity; label: string }[] = [
  { value: "leads", label: "Leads" },
  { value: "deals", label: "Deals" },
  { value: "organizations", label: "Organizations" },
];

export const METRICS: { value: WidgetMetric; label: string }[] = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
];

export const GROUP_BY_OPTIONS: Record<
  WidgetEntity,
  { value: GroupByField; label: string }[]
> = {
  leads: [
    { value: "leadStatus", label: "Lead Status" },
    { value: "leadSource", label: "Lead Source" },
    { value: "createdAt", label: "Created Month" },
  ],
  deals: [
    { value: "dealStatus", label: "Deal Status" },
    { value: "createdAt", label: "Created Month" },
  ],
  organizations: [
    { value: "organizationIndustry", label: "Industry" },
    { value: "createdAt", label: "Created Month" },
  ],
};

export const DEFAULT_POSITION = { x: 0, y: Infinity, w: 6, h: 3 };
