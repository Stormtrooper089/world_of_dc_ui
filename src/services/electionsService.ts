import api from "./api";
import { ApiResponse } from "../types";

export interface VehicleDetails {
  id: string;
  acNo?: string;
  psNo?: string;
  psName?: string;
  vehicleNo?: string;
  driverName?: string;
  driverMobile?: string;
  vehicleType?: string;
  capacity?: number;
  route?: string;
  remarks?: string;
  location?: { x: number; y: number };
  parkingAddress?: string;
  statusComment?: string;
  uploadTime?: number;
}

export interface PollingParty {
  id: string;
  acNo?: string;
  psNo?: string;
  psName?: string;
  partyNo?: string;
  presidingOfficer?: string;
  pollingOfficer1?: string;
  pollingOfficer2?: string;
  pollingOfficer3?: string;
  reserveOfficer?: string;
  mobile?: string;
  uploadTime?: number;
}

export interface PollingPartySearchParams {
  psName?: string;
  partyNo?: string;
  mobile?: string;
}

export interface PollingPartyOptions {
  pollingStations: string[];
  partyNames: string[];
}

const MAX_MEMBER_RESULTS = 6;

export const electionsService = {
  async getPollingPartyOptions(): Promise<PollingPartyOptions> {
    const response = await api.get<ApiResponse<PollingPartyOptions>>(
      "/polling-parties/options"
    );

    return (
      response.data?.data || {
        pollingStations: [],
        partyNames: [],
      }
    );
  },

  async searchPollingParties(
    params: PollingPartySearchParams
  ): Promise<PollingParty[]> {
    const response = await api.get<ApiResponse<PollingParty[]>>(
      "/polling-parties/search",
      {
        params,
      }
    );

    const data = response.data?.data ?? [];
    return data.slice(0, MAX_MEMBER_RESULTS);
  },

  async getAllVehicleNos(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(
      "/vehicles/all-vehicle-nos"
    );
    return response.data?.data ?? [];
  },

  async searchVehicles(params: {
    psName?: string;
    vehicleNo?: string;
  }): Promise<VehicleDetails[]> {
    const response = await api.get<ApiResponse<VehicleDetails[]>>(
      "/vehicles",
      { params }
    );
    const data = response.data?.data;
    if (!data) return [];
    return Array.isArray(data) ? data : [data];
  },
};

export { MAX_MEMBER_RESULTS };
