import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { Mail, LayoutTemplate, BarChart3 } from "lucide-react";

import TemplateGallery from "@/components/campaign/templateGallery";
import ComposeForm from "@/components/campaign/composeForm";
import CampaignHistory from "@/components/campaign/campaignHistory";

export default function CampaignPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Send tracked email campaigns to your leads
        </p>
      </div>

      <Tabs defaultValue="compose">
        <TabsList>
          <TabsTrigger
            value="compose"
            className="gap-1.5"
          >
            <Mail size={13} /> Compose
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="gap-1.5"
          >
            <BarChart3 size={13} /> History
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="gap-1.5"
          >
            <LayoutTemplate size={13} /> Templates
          </TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="compose">
            <ComposeForm />
          </TabsContent>
          <TabsContent value="history">
            <CampaignHistory />
          </TabsContent>
          <TabsContent value="templates">
            <TemplateGallery />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
