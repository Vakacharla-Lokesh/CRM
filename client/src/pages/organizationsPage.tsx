import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/organizations/organization-columns";
import type { CreateOrganizationDTO, Organization } from "@/types";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { OrganizationModal } from "@/components/modals";
import organizationService from "@/services/organizationService";

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await organizationService.getAllOrganizations();
        setOrganizations(res);
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch organizations",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  const handleAddOrganization = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
  };

  const handleSaveOrganization = async (
    organizationData: CreateOrganizationDTO,
  ) => {
    const newOrganization =
      await organizationService.createOrganization(organizationData);

    setOrganizations((prev) => [newOrganization, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your organizations
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <Button className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-35 disabled:bg-muted-foreground disabled:text-muted-foreground">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={handleAddOrganization}
            className="px-4 py-2 font-medium rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <span>+</span> Add Organization
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading organizations...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load organizations
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {error}
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={organizations}
          name="Organizations"
        ></DataTable>
      )}

      <OrganizationModal
        isOpen={isModalOpen}
        organization={selectedOrganization}
        onClose={handleCloseModal}
        onSave={handleSaveOrganization}
      />
    </div>
  );
};

export default OrganizationsPage;
