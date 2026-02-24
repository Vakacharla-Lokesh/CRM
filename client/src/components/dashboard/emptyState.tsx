export function EmptyState({
  icon,
  message,
  sub,
}: {
  icon: React.ReactNode;
  message: string;
  sub: string;
}) {
  return (
    <div
      className="py-12 flex items-center justify-center rounded-lg border-2 border-dashed"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="text-center"
        style={{ color: "var(--muted-foreground)" }}
      >
        <div className="mx-auto mb-3 w-12 h-12 flex items-center justify-center opacity-40">
          {icon}
        </div>
        <p className="font-medium text-sm">{message}</p>
        <p className="text-xs mt-1 opacity-70">{sub}</p>
      </div>
    </div>
  );
}
