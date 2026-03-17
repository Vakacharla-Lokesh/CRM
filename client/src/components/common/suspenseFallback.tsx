const Sk = {
  box: (cls: string) => (
    <div className={`bg-muted animate-pulse rounded-md ${cls}`} />
  ),
};

export const PageLoadingFallback = () => (
  <div className="p-6 space-y-6 w-full">
    {/* Page title */}
    <div className="space-y-2">
      {Sk.box("h-7 w-48")}
      {Sk.box("h-4 w-72 opacity-60")}
    </div>

    {/* Stat cards row */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-xl p-4 space-y-3">
          {Sk.box("h-4 w-20")}
          {Sk.box("h-8 w-16")}
        </div>
      ))}
    </div>

    {/* Toolbar row */}
    <div className="flex items-center justify-between gap-3">
      {Sk.box("h-9 w-64")}
      <div className="flex gap-2">
        {Sk.box("h-9 w-24")}
        {Sk.box("h-9 w-24")}
      </div>
    </div>

    {/* Table */}
    <div className="border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b bg-muted/30">
        {[120, 160, 100, 140, 80].map((w, i) => (
          <div key={i} className={`bg-muted animate-pulse rounded h-4`} style={{ width: w }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-0">
          {[120, 160, 100, 140, 80].map((w, j) => (
            <div
              key={j}
              className="bg-muted animate-pulse rounded h-4"
              style={{ width: w, opacity: 1 - i * 0.08 }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);