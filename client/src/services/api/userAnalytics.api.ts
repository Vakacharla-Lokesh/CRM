import { get, put } from "./core";

export type WidgetType = "bar" | "line" | "pie" | "area" | "number" | "table";

export type WidgetEntity = "leads" | "deals" | "organizations";

export type WidgetMetric = "count" | "sum" | "avg";

export type GroupByField =
  | "leadStatus"
  | "leadSource"
  | "dealStatus"
  | "organizationIndustry"
  | "createdAt";

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetDataPoint {
  label: string;
  value: number;
}

export interface Widget {
  _id?: string;
  type: WidgetType;
  entity: WidgetEntity;
  title: string;
  filters?: Record<string, string>;
  groupBy: GroupByField;
  metric: WidgetMetric;
  position: WidgetPosition;
  data?: WidgetDataPoint[];
  createdAt?: string;
}

export interface UserAnalyticsDashboardResponse {
  layout: Widget[];
}

export const userAnalyticsAPI = {
  /** GET /user-analytics — fetch layout with computed data */
  getDashboard: () => get<UserAnalyticsDashboardResponse>("/user-analytics"),

  /** PUT /user-analytics — save layout */
  saveDashboard: (layout: Omit<Widget, "data">[]) =>
    put<UserAnalyticsDashboardResponse>("/user-analytics", { layout }),
};
