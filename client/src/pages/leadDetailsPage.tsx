import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { leadService } from "@/services";
import type { Lead } from "@/types";
import EditLeadTab from "@/components/leads/tabs/editLeadTab";
import CommentsTab from "@/components/leads/tabs/commentsTab";
import CallsTab from "@/components/leads/tabs/callsTab";
import AttachmentsTab from "@/components/leads/tabs/attachmentsTab";

/**
 * LeadDetailsPage Component
 * Route: /leads/:id
 * Purpose: Display detailed information about a lead with tabbed interface
 * Features:
 * - Edit lead information
 * - Add and manage comments
 * - Log and view calls
 * - Upload and manage attachments
 */
function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("edit");

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load lead");
        console.error("Error fetching lead:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const handleGoBack = () => {
    navigate("/leads");
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLead(updatedLead);
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {lead.leadFirstName} {lead.leadLastName || ""}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {lead.leadEmail}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start border-b border-gray-200 dark:border-gray-700 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="edit"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Edit Lead
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Comments
            </TabsTrigger>
            <TabsTrigger
              value="calls"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Calls
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600"
            >
              Attachments
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent
            value="edit"
            className="p-6"
          >
            <EditLeadTab
              lead={lead}
              onUpdate={handleLeadUpdate}
            />
          </TabsContent>

          <TabsContent
            value="comments"
            className="p-6"
          >
            <CommentsTab leadId={lead._id} />
          </TabsContent>

          <TabsContent
            value="calls"
            className="p-6"
          >
            <CallsTab leadId={lead._id} />
          </TabsContent>

          <TabsContent
            value="attachments"
            className="p-6"
          >
            <AttachmentsTab leadId={lead._id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default LeadDetailsPage;
