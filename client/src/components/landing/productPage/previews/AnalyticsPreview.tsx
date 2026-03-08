import { analyticsKpis, analyticsBars, analyticsDays } from "../constants/preview";

export default function AnalyticsPreview() {
  const maxValue = Math.max(...analyticsBars);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {analyticsKpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              padding: "12px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                marginBottom: "6px",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {kpi.value}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: "#22c55e",
                  fontWeight: 600,
                }}
              >
                {kpi.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ background: "#1e293b", borderRadius: "8px", padding: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: "120px",
            gap: "4px",
          }}
        >
          {analyticsBars.map((value, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${(value / maxValue) * 100}px`,
                  background: "linear-gradient(to top, #6366f1, #8b5cf6)",
                  borderRadius: "4px 4px 0 0",
                  minHeight: "4px",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: "#94a3b8",
                  marginTop: "6px",
                  fontWeight: 600,
                }}
              >
                {analyticsDays[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
