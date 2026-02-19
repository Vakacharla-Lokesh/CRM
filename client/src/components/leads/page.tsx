import type { Lead } from "@/types";
import { columns } from "./lead-columns";
import { DataTable } from "../common/data-table";

async function getData(): Promise<Lead[]> {
  return [
    {
      _id: "728ed52f",
      leadId: "728ed52f",
      leadFirstName: "John",
      leadLastName: "Doe",
      leadEmail: "john.doe@example.com",
      leadScore: 85,
      leadStatus: "New",
      leadSource: "API",
      tenantId: "",
      userId: "",
      organizationId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable
        columns={columns}
        data={data}
      />
    </div>
  );
}
