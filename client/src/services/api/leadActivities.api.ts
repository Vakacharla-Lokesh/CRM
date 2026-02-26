import { get } from "./core";
import type { LeadActivity, LeadActivityListResponse } from "../../types";

export const leadActivitiesAPI = {
  getByLead: async (leadId: string): Promise<LeadActivity[]> => {
    const response = await get<LeadActivityListResponse>(
      `/leads/${leadId}/activities`,
    );
    return response.activities;
  },
};
