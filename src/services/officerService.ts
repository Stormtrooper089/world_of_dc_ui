import api from "./api";
import { ApiResponse, Officer } from "../types";

export const officerService = {
  async getAllOfficers(searchQuery?: string): Promise<Officer[]> {
    const params = searchQuery
      ? new URLSearchParams({ search: searchQuery })
      : undefined;
    const url = params ? `/officer/list?${params.toString()}` : "/officer/list";
    const response = await api.get<ApiResponse<any[]>>(url);
    // Map backend response (Jackson serializes isActive/isApproved as 'active'/'approved')
    // to frontend type (expecting 'isActive'/'isApproved')
    return response.data.data.map((officer: any) => ({
      ...officer,
      isActive:
        officer.active !== undefined ? officer.active : officer.isActive,
      isApproved:
        officer.approved !== undefined ? officer.approved : officer.isApproved,
    }));
  },
};
