import api from "./api";
import {
  ApiResponse,
  DistrictService,
  DistrictServiceDashboard,
} from "../types";

export const districtServiceRegistryService = {
  async list(params?: {
    query?: string;
    department?: string;
    category?: string;
  }): Promise<DistrictService[]> {
    const response = await api.get<ApiResponse<DistrictService[]>>(
      "/service-registry",
      { params }
    );
    return response.data.data;
  },

  async officerList(): Promise<DistrictService[]> {
    const response = await api.get<ApiResponse<DistrictService[]>>(
      "/officer/service-registry"
    );
    return response.data.data;
  },

  async dashboard(): Promise<DistrictServiceDashboard> {
    const response = await api.get<ApiResponse<DistrictServiceDashboard>>(
      "/officer/service-registry/dashboard"
    );
    return response.data.data;
  },
};
