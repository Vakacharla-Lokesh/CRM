import { Progress } from "../ui/progress";

export function ProgressRow({
  label,
  value,
  max,
  dimmed,
}: {
  label: string;
  value: number;
  max: number;
  dimmed?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "var(--muted-foreground)" }}>{label}</span>
        <span
          className="font-medium"
          style={{
            color: dimmed ? "var(--muted-foreground)" : "var(--foreground)",
          }}
        >
          {value}
        </span>
      </div>
      <Progress
        value={(value / max) * 100}
        className="h-2"
        style={
          {
            "--progress-background": dimmed
              ? "color-mix(in srgb, var(--primary) 55%, transparent)"
              : "var(--primary)",
          } as React.CSSProperties
        }
      />
    </div>
  );
}
