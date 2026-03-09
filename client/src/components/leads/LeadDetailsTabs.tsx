import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditLeadTab from "@/components/leads/tabs/editLeadTab";
import CommentsTab from "@/components/leads/tabs/commentsTab";
import CallsTab from "@/components/leads/tabs/callsTab";
import AttachmentsTab from "@/components/leads/tabs/attachmentsTab";
import { LeadActivityTimeline } from "@/components/leads/tabs/activityTab";
import type { Lead } from "@/types";

const tabs = [
  { value: "edit", label: "Edit Lead" },
  { value: "comments", label: "Comments" },
  { value: "calls", label: "Calls" },
  { value: "attachments", label: "Attachments" },
  { value: "activity", label: "Activity" },
] as const;

interface LeadDetailsTabsProps {
  lead: Lead;
  onLeadUpdate: (updatedLead: Lead) => void;
}

export function LeadDetailsTabs({ lead, onLeadUpdate }: LeadDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div className="rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full justify-start border-b border-border rounded-lg p-0 h-12">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-lg border-b-2 border-transparent 
                            text-muted-foreground
                            hover:text-primary
                            hover:border-primary/40
                            data-[state=active]:border-primary 
                            data-[state=active]:text-primary
                            px-6 h-full transition-colors"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        <TabsContent
          value="edit"
          className="p-6 mt-0"
        >
          <EditLeadTab
            key={lead.updatedAt.toString()}
            lead={lead}
            onUpdate={onLeadUpdate}
          />
        </TabsContent>

        <TabsContent
          value="comments"
          className="p-6 mt-0"
        >
          <CommentsTab leadId={lead._id} />
        </TabsContent>

        <TabsContent
          value="calls"
          className="p-6 mt-0"
        >
          <CallsTab leadId={lead._id} />
        </TabsContent>

        <TabsContent
          value="attachments"
          className="p-6 mt-0"
        >
          <AttachmentsTab leadId={lead._id} />
        </TabsContent>

        <TabsContent
          value="activity"
          className="p-6 mt-0"
        >
          <LeadActivityTimeline
            leadId={lead._id}
            enabled={activeTab === "activity"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
