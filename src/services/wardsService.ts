import api from "./api";
import { ApiResponse, Ward } from "../types";

const fallbackWards: Ward[] = Array.from({ length: 28 }, (_, index) => {
  const wardNumber = index + 1;
  return {
    wardNumber,
    name: `Ward ${wardNumber}`,
    zone: "Silchar Municipal Corporation",
    active: true,
  };
});

export const wardsService = {
  async getWards(): Promise<Ward[]> {
    try {
      const response = await api.get<ApiResponse<Ward[]> | Ward[]>("/wards");
      const payload = response.data as ApiResponse<Ward[]> | Ward[];
      const rows = Array.isArray(payload) ? payload : payload.data;
      return rows?.length ? rows : fallbackWards;
    } catch {
      return fallbackWards;
    }
  },
};
