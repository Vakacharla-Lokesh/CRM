/* eslint-disable react-refresh/only-export-components */
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WidgetType } from "@/services/api/userAnalytics.api";

import { CHART_TYPES } from "@/types/constants/analytics/analyticsChartTypes";

export function IconBar() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4.5 h-4.5"
    >
      <rect
        x="2"
        y="10"
        width="3.5"
        height="8"
        rx="0.8"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="7"
        y="6"
        width="3.5"
        height="12"
        rx="0.8"
        fill="currentColor"
        opacity="0.75"
      />
      <rect
        x="12"
        y="3"
        width="3.5"
        height="15"
        rx="0.8"
        fill="currentColor"
      />
    </svg>
  );
}

export function IconLine() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4.5 h-4.5"
    >
      <polyline
        points="2,15 6,9 10,12 14,5 18,7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconArea() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4.5 h-4.5"
    >
      <path
        d="M2,15 L6,9 L10,12 L14,5 L18,7 L18,17 L2,17 Z"
        fill="currentColor"
        opacity="0.25"
      />
      <polyline
        points="2,15 6,9 10,12 14,5 18,7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPie() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4.5 h-4.5"
    >
      <path
        d="M10,10 L10,2 A8,8 0 0,1 17.66,14 Z"
        fill="currentColor"
      />
      <path
        d="M10,10 L17.66,14 A8,8 0 1,1 10,2 Z"
        fill="currentColor"
        opacity="0.35"
      />
    </svg>
  );
}

export function IconNumber() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4.5 h-4.5"
    >
      <line
        x1="4"
        y1="7"
        x2="16"
        y2="7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="13"
        x2="16"
        y2="13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="4"
        x2="6"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <line
        x1="13.5"
        y1="4"
        x2="12"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconTable() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4.5 h-4.5"
    >
      <rect
        x="2"
        y="2"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <line
        x1="2"
        y1="7.5"
        x2="18"
        y2="7.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="9"
        y1="7.5"
        x2="9"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export const CHART_TYPE_ICONS: Record<string, React.ReactNode> = {
  bar: <IconBar />,
  line: <IconLine />,
  area: <IconArea />,
  pie: <IconPie />,
  number: <IconNumber />,
  table: <IconTable />,
};

export function IconT() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M3 5h14M10 5v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconDatabase() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <ellipse
        cx="10"
        cy="5.5"
        rx="7"
        ry="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 5.5v9c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5v-9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 10c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function IconSigma() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M14 4H6l5 6-5 6h8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBarSmall() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <rect
        x="3"
        y="11"
        width="3"
        height="7"
        rx="0.6"
        fill="currentColor"
        opacity="0.5"
      />
      <rect
        x="8"
        y="7"
        width="3"
        height="11"
        rx="0.6"
        fill="currentColor"
        opacity="0.75"
      />
      <rect
        x="13"
        y="4"
        width="3"
        height="14"
        rx="0.6"
        fill="currentColor"
      />
      <line
        x1="2"
        y1="18.5"
        x2="18"
        y2="18.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconTrendUp() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <polyline
        points="2,14 7,8 11,11 16,5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="13,5 16,5 16,8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUpDown() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M7 4l-3 3 3 3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 7h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M13 16l3-3-3-3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13H6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconLayers() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="w-4 h-4"
    >
      <path
        d="M2 10l8-5 8 5-8 5-8-5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M2 14l8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
    </svg>
  );
}

// ─── UI primitives ────────────────────────────────────────────────────────────

export function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="text-[11px] font-bold tracking-widest uppercase px-1 pt-4 pb-2"
      style={{ color: "var(--muted-foreground)" }}
    >
      {label}
    </p>
  );
}

export function RowDivider() {
  return (
    <div
      className="h-px mx-3"
      style={{ backgroundColor: "var(--border)" }}
    />
  );
}

export function ConfigRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-3">
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="shrink-0"
          style={{ color: "var(--muted-foreground)" }}
        >
          {icon}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center shrink-0">{children}</div>
    </div>
  );
}

// Pill-shaped select matching the screenshot
export function PillSelect({
  id,
  value,
  onValueChange,
  children,
}: {
  id?: string;
  value: string;
  onValueChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        id={id}
        className="h-8 px-3 rounded-full text-sm border-0 focus:ring-0 focus:ring-offset-0 gap-1"
        style={{
          backgroundColor: "var(--muted)",
          color: "var(--foreground)",
          minWidth: "120px",
          maxWidth: "160px",
        }}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export function ReadonlyValue({ value }: { value: string }) {
  return (
    <span
      className="text-sm"
      style={{ color: "var(--muted-foreground)" }}
    >
      {value}
    </span>
  );
}

// ─── Chart type icon picker ───────────────────────────────────────────────────

export function ChartTypePicker({
  value,
  onChange,
}: {
  value: WidgetType;
  onChange: (v: WidgetType) => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-1.5 py-1.5 rounded-xl mt-3"
      style={{ backgroundColor: "var(--muted)" }}
    >
      {CHART_TYPES.map((t) => {
        const isActive = value === t.value;
        return (
          <button
            key={t.value}
            title={t.label}
            type="button"
            onClick={() => onChange(t.value as WidgetType)}
            className="flex items-center justify-center rounded-lg transition-all duration-150"
            style={{
              width: 44,
              height: 38,
              backgroundColor: isActive ? "var(--background)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
              boxShadow: isActive
                ? "0 1px 4px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)"
                : "none",
            }}
          >
            {CHART_TYPE_ICONS[t.value]}
          </button>
        );
      })}
    </div>
  );
}
