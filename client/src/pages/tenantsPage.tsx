import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/tenants/tenant-columns";
import type { Tenant, CreateTenantDto } from "@/types/tenant";
import tenantService from "@/services/tenantService";
import { Button } from "@/components/ui/button";
import { TenantModal } from "@/components/modals";
import { Plus } from "lucide-react";

const TenantsPage = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    async function fetchTenants() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await tenantService.getAllTenants();
        setTenants(res);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch tenants",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenants();
  }, []);

  const handleCreateTenant = async (tenantData: CreateTenantDto) => {
    try {
      if (selectedTenant) {
        // Update existing tenant
        const updated = await tenantService.updateTenant(
          selectedTenant._id,
          tenantData,
        );
        setTenants((prev) =>
          prev.map((tenant) =>
            tenant._id === selectedTenant._id ? updated : tenant,
          ),
        );
      } else {
        // Create new tenant
        const newTenant = await tenantService.createTenant(tenantData);
        setTenants((prev) => [...prev, newTenant]);
      }
      setIsModalOpen(false);
      setSelectedTenant(null);
    } catch (error) {
      console.error("Error saving tenant:", error);
      throw error;
    }
  };

  const handleOpenModal = () => {
    setSelectedTenant(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tenants
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage tenant organizations
          </p>
        </div>
        <Button onClick={handleOpenModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading tenants...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              Failed to load tenants
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
          data={tenants}
          name="Tenants"
        ></DataTable>
      )}

      <TenantModal
        isOpen={isModalOpen}
        tenant={selectedTenant}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTenant(null);
        }}
        onSave={handleCreateTenant}
      />
    </div>
  );
};

export default TenantsPage;
