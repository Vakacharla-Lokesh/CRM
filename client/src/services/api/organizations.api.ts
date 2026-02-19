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
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    get<OrganizationListResponse>("/organizations", params),

  get: (id: string) => get<Organization>(`/organizations/${id}`),

  create: (data: CreateOrganizationDTO) =>
    post<Organization>("/organizations", data),

  update: (id: string, data: UpdateOrganizationDTO) =>
    put<Organization>(`/organizations/${id}`, data),

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
