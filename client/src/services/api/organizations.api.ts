import { get, post, put, delete_ } from "./core";
import type {
  Organization,
  OrganizationListResponse,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  PointOfContact,
  LeadListResponse,
} from "../../types";

export const organizationsAPI = {
  list: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await get<{
      count: number;
      organizations: Organization[];
    }>("/organizations", params);
    return {
      organizations: response.organizations,
      total: response.count,
      page: params?.page || 1,
      limit: params?.limit || response.count,
    } as OrganizationListResponse;
  },

  get: async (id: string) => {
    const response = await get<{ organization: Organization }>(
      `/organizations/${id}`,
    );
    return response.organization;
  },

  create: async (data: CreateOrganizationDTO) => {
    const response = await post<{
      message: string;
      organization: Organization;
    }>("/organizations", data);
    return response.organization;
  },

  update: async (id: string, data: UpdateOrganizationDTO, lastKnownUpdatedAt?: Date) => {
    const response = await put<{ message: string; organization: Organization }>(
      `/organizations/${id}`,
      {
        ...data,
        ...(lastKnownUpdatedAt && { lastKnownUpdatedAt }),
      },
    );
    return response.organization;
  },

  delete: (id: string) => delete_<void>(`/organizations/${id}`),

  getLeads: (id: string, params?: { page?: number; limit?: number }) =>
    get<LeadListResponse>(`/organizations/${id}/leads`, params),

  addPointOfContact: (id: string, contact: PointOfContact) =>
    post(`/organizations/${id}/contacts`, contact),

  updatePointOfContact: (
    id: string,
    contactId: string,
    contact: Partial<PointOfContact>,
  ) => put(`/organizations/${id}/contacts/${contactId}`, contact),

  deletePointOfContact: (id: string, contactId: string) =>
    delete_(`/organizations/${id}/contacts/${contactId}`),
};
