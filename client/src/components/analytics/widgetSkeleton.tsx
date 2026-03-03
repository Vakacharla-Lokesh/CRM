export function WidgetSkeleton() {
  return (
    <div
      className="rounded-xl border overflow-hidden animate-pulse"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        minHeight: "260px",
      }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="h-4 w-32 rounded"
          style={{ backgroundColor: "var(--muted)" }}
        />
        <div
          className="h-3 w-20 rounded mt-2"
          style={{ backgroundColor: "var(--muted)" }}
        />
      </div>
      <div className="p-4">
        <div
          className="h-44 rounded-lg"
          style={{ backgroundColor: "var(--muted)" }}
        />
      </div>
    </div>
  );
}

export default WidgetSkeleton;
