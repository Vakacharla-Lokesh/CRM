import { workflowSteps } from "@/types/constants/product";

export default function WorkflowsPreview() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#94a3b8",
          marginBottom: "4px",
        }}
      >
        Auto-assign high-intent leads
      </div>
      {workflowSteps.map((s, i) => (
        <div key={s.label}>
          <div
            style={{
              background: "#1e293b",
              borderRadius: "8px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: `1px solid ${s.color}33`,
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: s.color + "22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
              }}
            >
              {s.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: s.color,
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: "10px", color: "#64748b" }}>{s.desc}</div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                fontSize: "10px",
                color: "#22c55e",
                fontWeight: 600,
              }}
            >
              Active
            </div>
          </div>
          {i < workflowSteps.length - 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2px 0",
              }}
            >
              <div
                style={{
                  width: "1px",
                  height: "10px",
                  background: "#334155",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
