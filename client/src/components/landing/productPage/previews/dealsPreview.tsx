import { dealsMockData } from "@/types/constants/product";

export default function DealsPreview() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "8px",
      }}
    >
      {dealsMockData.map((col) => (
        <div
          key={col.title}
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "2px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: col.color,
              }}
            />
            <span
              style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8" }}
            >
              {col.title}
            </span>
          </div>
          {col.deals.map((d) => (
            <div
              key={d.name}
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "6px",
                padding: "8px",
                borderLeft: `3px solid ${col.color}`,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: "3px",
                }}
              >
                {d.name}
              </div>
              <div
                style={{ fontSize: "12px", fontWeight: 700, color: col.color }}
              >
                {d.value}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
