import { API_BASE_URL } from "../services/api/core";

export const resolveBulkRoute = (
  entity: string,
  operationType: string,
): string => {
  const entityMap: Record<string, string> = {
    leads: "leads",
    deals: "deals",
    organizations: "organizations",
    calls: "calls",
    comments: "comments",
    users: "users",
    attachments: "attachments",
  };

  const operationMap: Record<string, string> = {
    create: "create",
    update: "update",
    delete: "delete",
  };

  const mappedEntity = entityMap[entity];
  const mappedOperation = operationMap[operationType];

  if (!mappedEntity || !mappedOperation) {
    throw new Error(
      `Route mapping failed for entity: ${entity}, operation: ${operationType}`,
    );
  }

  // Matching exactly the backend routes defined in server/src/server.js and server/routes/bulkRoutes.js
  // backend prefixes /api/bulk, so routes are /api/bulk/leads/create, etc.
  return `${API_BASE_URL}/bulk/${mappedEntity}/${mappedOperation}`;
};
