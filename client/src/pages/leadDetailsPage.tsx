// hooks and basic imports
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// components imports
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditLeadTab from "@/components/leads/tabs/editLeadTab";
import CommentsTab from "@/components/leads/tabs/commentsTab";
import CallsTab from "@/components/leads/tabs/callsTab";
import AttachmentsTab from "@/components/leads/tabs/attachmentsTab";
import { LeadActivityTimeline } from "@/components/leads/tabs/activityTab";
import { ConfirmDialog } from "@/components/common/confirmDialog";
import { toast } from "sonner";

// other imports
import { ArrowLeft, ArrowRight } from "lucide-react";
import { leadService } from "@/services";
import type { Lead } from "@/types";
import { getPipelineStage } from "@/types/pipeline";

// notification imports
import { useNotifications } from "@/hooks";
import { usePipelineData } from "@/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// tab definitions
const tabs = [
  { value: "edit", label: "Edit Lead" },
  { value: "comments", label: "Comments" },
  { value: "calls", label: "Calls" },
  { value: "attachments", label: "Attachments" },
  { value: "activity", label: "Activity" },
] as const;

function LeadDetailsPage() {
  // param handlers
  const { id } = useParams<{ id: string }>();

  // navigation handler
  const navigate = useNavigate();

  // local state
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [isConverting, setIsConverting] = useState(false);

  // convert to deal dialog state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // notifications
  const { notifyEvent } = useNotifications();

  // fetch lead details on component mount
  useEffect(() => {
    const fetchLead = async () => {
      if (!id) {
        setError("Lead ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await leadService.getLeadById(id);
        setLead(response);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lead");
        console.error("Error fetching lead:", err);
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  // handlers
  const handleGoBack = () => {
    navigate("/leads");
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLead(updatedLead);
  };

  const handleConvertToDeal = () => {
    if (!lead) return;
    setConvertDialogOpen(true);
  };

  const { pipelines } = usePipelineData();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Resolve the pipeline this lead belongs to
  const leadPipeline = lead
    ? pipelines.find((p) => p._id === lead.pipelineId)
    : undefined;

  const currentStage = lead
    ? getPipelineStage(leadPipeline, lead.status)
    : undefined;

  const handleStageChange = async (newStatus: string) => {
    if (!lead || newStatus === lead.status) return;
    try {
      setIsUpdatingStatus(true);
      const response = await leadService.updateLead(lead._id, {
        status: newStatus,
      });
      setLead(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmConvert = async () => {
    if (!lead) return;

    try {
      setIsConverting(true);

      const response = await leadService.convertLead(lead._id);

      setLead(response.lead);

      navigate("/deals");

      toast.success("Lead converted to deal successfully!");
      notifyEvent({
        type: "lead_converted",
        title: "Lead Converted",
        message: `Lead ${lead.firstName} ${lead.lastName || ""} has been converted to a deal successfully.`,
        entityId: lead._id,
        entityType: "lead",
      });
      setIsConverting(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to convert lead to deal";
      toast.error(message);
      console.error("Error converting lead to deal:", err);
      setIsConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading lead details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
            Failed to load lead
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {error || "Lead not found"}
          </p>
          <Button
            onClick={handleGoBack}
            variant="outline"
          >
            Go Back to Leads
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {/* Pipeline stage indicator */}
          {lead && leadPipeline && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {leadPipeline.name}
              </span>
              <span className="text-gray-300 dark:text-gray-600">/</span>

              {lead.status === "Converted" ? (
                // Converted is terminal — show as a static badge
                <span
                  className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: currentStage?.color ?? "#10b981" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
                  {lead.status}
                </span>
              ) : (
                // Non-converted: show an inline stage changer
                <Select
                  value={lead.status}
                  onValueChange={handleStageChange}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="h-7 border-0 shadow-none bg-transparent p-0 gap-1.5 text-xs font-semibold focus:ring-0 [&>svg]:w-3 [&>svg]:h-3">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: currentStage?.color ?? "#6b7280",
                        }}
                      />
                      <SelectValue />
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {leadPipeline.statuses
                      .filter((s) => s.label !== "Converted")
                      .map((stage) => (
                        <SelectItem
                          key={stage.label}
                          value={stage.label}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: stage.color }}
                            />
                            {stage.label}
                          </span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              {isUpdatingStatus && (
                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          )}
        </div>

        {/* Convert to Deal Button */}
        {lead.status !== "Converted" && (
          <Button
            onClick={handleConvertToDeal}
            disabled={isConverting}
            className="gap-2"
            size="lg"
          >
            {isConverting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Converting...
              </>
            ) : (
              <>
                Convert to Deal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tabs */}
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
              key={lead.updatedAt.toString()} // force remount when lead updates to reset internal state
              lead={lead}
              onUpdate={handleLeadUpdate}
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

      <ConfirmDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        onConfirm={confirmConvert}
        title="Convert to Deal"
        description={`Are you sure you want to convert "${lead.firstName} ${lead.lastName || ""}" to a deal?`}
        confirmText="Convert"
      />
    </div>
  );
}

export default LeadDetailsPage;
