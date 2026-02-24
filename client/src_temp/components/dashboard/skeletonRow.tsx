export function SkeletonRows({
  count,
  taller,
}: {
  count: number;
  taller?: boolean;
}) {
  return (
    <div className={`space-y-${taller ? "6" : "4"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skeleton-row-${i}`}
          className="animate-pulse space-y-2"
        >
          {taller && (
            <div
              className="h-4 w-1/3 rounded"
              style={{ backgroundColor: "var(--muted)" }}
            />
          )}
          <div
            className="h-4 rounded"
            style={{ backgroundColor: "var(--muted)" }}
          />
          <div
            className="h-2 rounded"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--muted) 60%, transparent)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
