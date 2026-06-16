import api from "./api";
import { ApiResponse, GovernanceDashboard } from "../types";

export const governanceService = {
  async getDashboard(pendingAgeDays?: number): Promise<GovernanceDashboard> {
    const response = await api.get<ApiResponse<GovernanceDashboard>>(
      "/governance/dashboard",
      { params: pendingAgeDays ? { pendingAgeDays } : undefined }
    );
    return response.data.data;
  },
};
