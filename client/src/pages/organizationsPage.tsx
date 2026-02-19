import { useEffect, useState } from "react";
import { DataTable } from "../components/common/data-table";
import { columns } from "../components/organizations/organization-columns";
import type { CreateOrganizationDTO, Organization } from "@/types";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";
import { OrganizationModal } from "@/components/modals";

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockOrganizations: Organization[] = Array.from(
        { length: 25 },
        (_, i) => ({
          _id: `org-${i + 1}`,
          organizationName: `Company ${i + 1}`,
          organizationWebsite: `https://company${i + 1}.com`,
          organizationSize: [
            "1-10",
            "11-50",
            "51-200",
            "201-500",
            "501-1000",
            "1000+",
          ][i % 6] as Organization["organizationSize"],
          organizationIndustry: ["Software", "Textile", "Foods", "Others"][
            i % 4
          ] as string,
          tenantId: `tenant-1`,
          userId: `user-${i + 1}`,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ),
          updatedAt: new Date(),
        }),
      );
      setOrganizations(mockOrganizations);
    }, 500);

    return () => clearTimeout(timer);
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
    // TODO: Replace with actual API call
    console.log("Saving organization:", organizationData);

    // Mock creating a new organization
    const newOrganization: Organization = {
      _id: `org-${organizations.length + 1}`,
      organizationName: organizationData.organizationName,
      organizationWebsite: organizationData.organizationWebsite,
      organizationSize: organizationData.organizationSize,
      organizationIndustry: organizationData.organizationIndustry,
      tenantId: organizationData.tenantId,
      userId: "current-user-id",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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

      <DataTable
        columns={columns}
        data={organizations}
      ></DataTable>

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
