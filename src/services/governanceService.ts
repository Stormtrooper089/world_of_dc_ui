import api from "./api";
import { ApiResponse, GovernanceDashboard } from "../types";

export const governanceService = {
  async getDashboard(days = 30): Promise<GovernanceDashboard> {
    const response = await api.get<ApiResponse<GovernanceDashboard>>(
      "/governance/dashboard",
      { params: { days } }
    );
    return response.data.data;
  },
};
