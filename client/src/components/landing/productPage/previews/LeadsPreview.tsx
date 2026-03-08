import { leadsMockData } from "../constants/preview";

const statusColor: Record<string, string> = {
  New: "#22c55e",
  "Follow-Up": "#f59e0b",
  Dead: "#ef4444",
};

export default function LeadsPreview() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: "13px",
            color: "#e2e8f0",
          }}
        >
          All Leads
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            background: "#1e293b",
            padding: "3px 8px",
            borderRadius: "4px",
          }}
        >
          {leadsMockData.length} total
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {leadsMockData.map((l) => (
          <div
            key={l.name}
            style={{
              background: "#1e293b",
              borderRadius: "8px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              border: "1px solid #334155",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {l.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#e2e8f0" }}>
                  {l.name}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>
                  {l.company} · {l.source}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: `conic-gradient(#6366f1 ${l.score * 3.6}deg, #1e293b 0deg)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  color: "#e2e8f0",
                }}
              >
                {l.score}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 7px",
                  borderRadius: "99px",
                  background: statusColor[l.status] + "22",
                  color: statusColor[l.status],
                  fontWeight: 600,
                }}
              >
                {l.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
