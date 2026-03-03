// CHART CONFIGURATION TYPES AND CONSTANTS

import type {
  GroupByField,
  Widget,
  WidgetDataPoint,
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
    { value: "status", label: "Lead Status" },
    { value: "source", label: "Lead Source" },
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

// ANALYTICS GRID LABELS

export interface AnalyticsGridProps {
  widgets: Widget[];
  onEdit: (widget: Widget) => void;
  onDelete: (widgetId: string) => void;
}

export const CHART_TYPE_LABEL: Record<string, string> = {
  bar: "Bar",
  line: "Line",
  area: "Area",
  pie: "Pie",
  number: "Number",
  table: "Table",
};

export const ENTITY_LABEL: Record<string, string> = {
  leads: "Leads",
  deals: "Deals",
  organizations: "Organizations",
};

// CHART RENDERER COMPONENT TYPES
export interface ChartRendererProps {
  type: WidgetType;
  data: WidgetDataPoint[];
  metric: string;
}

export const CHART_COLORS = [
  "var(--primary)",
  "hsl(200, 70%, 55%)",
  "hsl(145, 55%, 50%)",
  "hsl(35, 80%, 60%)",
  "hsl(270, 55%, 60%)",
  "hsl(355, 70%, 55%)",
];
