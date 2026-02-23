import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "@/components/leads/leadColumns";
import { leadsAPI, organizationsAPI } from "@/services/api";
import type { Lead, Organization } from "@/types";
import { DataTable } from "@/components/common/dataTable";
import { useLeadData } from "@/hooks/useLeadData";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const OrganizationLeadsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteLead } = useLeadData();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [leadsData, orgData] = await Promise.all([
          leadsAPI.getByOrganization(id),
          organizationsAPI.get(id),
        ]);
        setLeads(leadsData.leads);
        setOrganization(orgData);
        setLoading(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err?.message || "Failed to load data");
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleEditLead = (id: string) => {
    navigate(`/leads/${id}`);
  };

  const handleDeleteLead = (id: string) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (leadToDelete) {
      try {
        await deleteLead(leadToDelete);
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/organizations")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {organization
              ? `${organization.organizationName} — Leads`
              : "Organization Leads"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            All leads associated with this organization
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading leads...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load leads
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 w-fit">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Leads
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {leads.length}
            </p>
          </div>

          <DataTable
            columns={columns({
              onEdit: handleEditLead,
              onDelete: handleDeleteLead,
            })}
            data={leads}
            name="Leads"
            searchColumn="leadFirstName"
          />
        </>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default OrganizationLeadsPage;
