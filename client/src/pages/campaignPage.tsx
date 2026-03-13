import { Mail, BarChart3, LayoutTemplate } from "lucide-react";
import { useState } from "react";
import ComposeForm from "@/components/campaign/composeForm";
import CampaignHistory from "@/components/campaign/campaignHistory";
import TemplateGallery from "@/components/campaign/templateGallery";

export default function CampaignPage() {
  const [activeTab, setActiveTab] = useState<
    "compose" | "history" | "templates"
  >("compose");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [leadIds, setLeadIds] = useState<string[]>([]);
  const [formKey, setFormKey] = useState(0);

  const tabs = [
    {
      id: "compose" as const,
      label: "Compose",
      icon: Mail,
    },
    {
      id: "history" as const,
      label: "History",
      icon: BarChart3,
    },
    {
      id: "templates" as const,
      label: "Templates",
      icon: LayoutTemplate,
    },
  ];

  const handleTemplateSelect = (
    templateSubject: string,
    templateBody: string,
  ) => {
    setSubject(templateSubject);
    setBody(templateBody);
    setActiveTab("compose");
  };

  const resetForm = () => {
    setSubject("");
    setBody("");
    setLeadIds([]);
    setFormKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage email campaigns with full tracking
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 flex gap-1 border-t border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative border-b-2 ${
                  activeTab === tab.id
                    ? "text-foreground border-b-primary"
                    : "text-muted-foreground border-b-transparent hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {activeTab === "compose" && (
              <ComposeForm
                key={formKey}
                subject={subject}
                setSubject={setSubject}
                body={body}
                setBody={setBody}
                leadIds={leadIds}
                setLeadIds={setLeadIds}
                onSuccess={resetForm}
              />
            )}
            {activeTab === "history" && <CampaignHistory />}
            {activeTab === "templates" && (
              <TemplateGallery onSelect={handleTemplateSelect} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
