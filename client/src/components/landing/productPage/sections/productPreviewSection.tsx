import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { tabs, previewTabContent } from "@/types/constants/product";
import type { TabId } from "@/types/constants/product/preview";
import LeadsPreview from "../previews/leadsPreview";
import DealsPreview from "../previews/dealsPreview";
import AnalyticsPreview from "../previews/analyticsPreview";
import WorkflowsPreview from "../previews/workflowsPreview";

const previewComponents: Record<TabId, React.ReactNode> = {
  leads: <LeadsPreview />,
  deals: <DealsPreview />,
  analytics: <AnalyticsPreview />,
  workflows: <WorkflowsPreview />,
};

export default function ProductPreviewSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("leads");
  const tab = previewTabContent[activeTab];

  return (
    <section
      id="preview"
      className="py-24 px-6"
      style={{
        backgroundColor: "var(--card)",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ letterSpacing: "-0.02em" }}
          >
            A closer look inside
          </h2>
          <p
            className="text-lg"
            style={{ color: "var(--muted-foreground)" }}
          >
            Explore the core modules that power your pipeline.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex justify-center mb-10">
          <div
            className="flex gap-1 p-1 rounded-xl"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    backgroundColor: isActive
                      ? "var(--primary)"
                      : "transparent",
                    color: isActive
                      ? "var(--primary-foreground)"
                      : "var(--muted-foreground)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="flex flex-col justify-center">
            <h3
              className="text-2xl font-bold mb-3"
              style={{ letterSpacing: "-0.02em" }}
            >
              {tab.headline}
            </h3>
            <p
              className="text-base mb-6 leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              {tab.sub}
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {tab.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-3 text-sm"
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    <Check
                      size={11}
                      color="var(--primary-foreground)"
                    />
                  </div>
                  <span style={{ color: "var(--foreground)" }}>{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <Button
                data-track-cta={`Explore ${activeTab}`}
                onClick={() => navigate("/signup")}
                className="gap-2"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Explore {tabs.find((t) => t.id === activeTab)?.label}{" "}
                <ArrowRight size={15} />
              </Button>
              <Button
                variant="outline"
                data-track-cta={`Learn more ${activeTab}`}
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                Learn more
              </Button>
            </div>
          </div>

          {/* Mock UI frame */}
          <div
            className="rounded-2xl p-5 overflow-hidden"
            style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              minHeight: "320px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-4">
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#ef4444",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#f59e0b",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "11px",
                  color: "#475569",
                }}
              >
                Campaign Flux — {tabs.find((t) => t.id === activeTab)?.label}
              </span>
            </div>
            {previewComponents[activeTab]}
          </div>
        </div>
      </div>
    </section>
  );
}
