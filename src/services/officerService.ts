import api from "./api";
import { ApiResponse, EmployeeCategory, Officer } from "../types";

export const officerService = {
  async getAllOfficers(searchQuery?: string, category?: EmployeeCategory): Promise<Officer[]> {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (category) params.set("category", category);
    const query = params.toString();
    const url = query ? `/officer/list?${query}` : "/officer/list";
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
