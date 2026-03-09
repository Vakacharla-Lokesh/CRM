import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Custom hooks
import { useLeadDetails } from "@/hooks/leads/useLeadDetails";
import { useLeadStageManagement } from "@/hooks/leads/useLeadStageManagement";
import { usePipelineData } from "@/hooks";

// Components
import { LeadStageProgress } from "@/components/leads/LeadStageProgress";
import { LeadDetailsTabs } from "@/components/leads/LeadDetailsTabs";
import { ConvertLeadDialog } from "@/components/leads/ConvertLeadDialog";

function LeadDetailsPage() {
  // Route params and navigation
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Data fetching and management
  const { lead, loading, error, updateLead } = useLeadDetails(id);
  const { pipelines } = usePipelineData();
  const {
    isUpdatingStatus,
    isConverting,
    handleStageChange,
    handleConvertToDeal,
  } = useLeadStageManagement(updateLead);

  // Local UI state
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);

  // Get the pipeline for this lead
  const leadPipeline = lead
    ? pipelines.find((p) => p._id === lead.pipelineId)
    : undefined;

  // Handlers
  const handleGoBack = () => {
    navigate("/leads");
  };

  const handleConvertClick = () => {
    if (!lead) return;
    setConvertDialogOpen(true);
  };

  const confirmConvert = async () => {
    if (!lead) return;

    try {
      const response = await handleConvertToDeal(lead);
      updateLead(response.lead);
      navigate("/deals");
      toast.success("Lead converted to deal successfully!");
      setConvertDialogOpen(false);
    } catch {
      console.error("Error converting lead to deal");
    }
  };

  const handleConfirmConvert = () => {
    void confirmConvert();
  };

  // Loading state
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

  // Error state
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
      {/* Header row: Back + Convert button */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {lead.status !== "Converted" && (
          <Button
            onClick={handleConvertClick}
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

      {/* Stage progress indicator */}
      {leadPipeline && (
        <LeadStageProgress
          lead={lead}
          leadPipeline={leadPipeline}
          isUpdatingStatus={isUpdatingStatus}
          onStageChange={handleStageChange}
        />
      )}

      {/* Tabs section */}
      <LeadDetailsTabs
        lead={lead}
        onLeadUpdate={updateLead}
      />

      {/* Convert dialog */}
      <ConvertLeadDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        onConfirm={handleConfirmConvert}
        lead={lead}
      />
    </div>
  );
}

export default LeadDetailsPage;
