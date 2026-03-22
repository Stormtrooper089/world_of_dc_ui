import api from "./api";
import { ApiResponse } from "../types";

export interface MaterialItem {
  name: string;
  received: boolean;
}

export interface PollingPartyMember {
  role: string;
  name?: string;
  mobile?: string;
}

export interface MaterialsData {
  items: MaterialItem[];
  submitted: boolean;
}

export interface VehicleIdMapping {
  vehicleId: string;
  vehicleNo: string;
}

export interface VehicleLocation {
  vehicleId?: string;
  vehicleNo?: string;
  parkingAddress?: string;
  statusComment?: string;
  location?: { x: number; y: number };
}

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
  members?: PollingPartyMember[];
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

  async getMaterials(psName: string): Promise<MaterialsData> {
    const response = await api.get<ApiResponse<MaterialsData[]>>(
      "/polling-parties/materials",
      { params: { psName } }
    );
    const arr = response.data?.data;
    if (!arr || arr.length === 0) return { items: [], submitted: false };
    return arr[0];
  },

  async submitMaterials(
    psName: string,
    items: MaterialItem[]
  ): Promise<void> {
    await api.put("/polling-parties/materials", { items }, { params: { psName } });
  },

  async getVehicleIdMappings(): Promise<VehicleIdMapping[]> {
    const response = await api.get<ApiResponse<VehicleIdMapping[]>>(
      "/vehicles/vehicle-id-mappings"
    );
    return response.data?.data ?? [];
  },

  async getVehicleLocation(vehicleId: string): Promise<VehicleLocation> {
    const response = await api.get<ApiResponse<VehicleLocation>>(
      "/vehicles/location",
      { params: { vehicleId } }
    );
    return response.data?.data ?? {};
  },

  async updateVehicleLocation(
    vehicleId: string,
    payload: { parkingAddress: string; statusComment: string; location?: { x: number; y: number } }
  ): Promise<void> {
    await api.put("/vehicles/location", payload, { params: { vehicleId } });
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
