import api from "./api";
import { ApiResponse } from "../types";
import {
  WasteCategory,
  WastePickupDashboard,
  WastePickupRequest,
  WastePickupStatus,
  WasteQuantityEstimate,
  WasteUrgency,
} from "../types/wastePickupTypes";

export interface WastePickupFilters {
  wardNumber?: number;
  status?: WastePickupStatus;
  urgency?: WasteUrgency;
  category?: WasteCategory;
  slaBreached?: boolean;
  officerId?: string;
  locality?: string;
  fromDate?: string;
  toDate?: string;
}

export const wastePickupService = {
  async createRequest(formData: FormData): Promise<WastePickupRequest> {
    const response = await api.post<ApiResponse<WastePickupRequest>>(
      "/waste-pickup/request",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },

  async track(trackingId: string): Promise<WastePickupRequest> {
    const response = await api.get<ApiResponse<WastePickupRequest>>(
      `/waste-pickup/track/${trackingId}`
    );
    return response.data.data;
  },

  async trackByMobile(mobileNumber: string): Promise<WastePickupRequest[]> {
    const response = await api.get<ApiResponse<WastePickupRequest[]>>(
      "/waste-pickup/track",
      { params: { mobileNumber } }
    );
    return response.data.data;
  },

  async list(filters: WastePickupFilters = {}): Promise<WastePickupRequest[]> {
    const response = await api.get<ApiResponse<WastePickupRequest[]>>(
      "/officer/waste-pickup",
      { params: filters }
    );
    return response.data.data;
  },

  async dashboard(filters: WastePickupFilters = {}): Promise<WastePickupDashboard> {
    const response = await api.get<ApiResponse<WastePickupDashboard>>(
      "/dashboard/waste-pickup",
      { params: filters }
    );
    return response.data.data;
  },

  async verify(id: string, payload: Record<string, any>): Promise<WastePickupRequest> {
    const response = await api.put<ApiResponse<WastePickupRequest>>(
      `/officer/waste-pickup/${id}/verify`,
      payload
    );
    return response.data.data;
  },

  async assign(id: string, payload: Record<string, any>): Promise<WastePickupRequest> {
    const response = await api.put<ApiResponse<WastePickupRequest>>(
      `/officer/waste-pickup/${id}/assign`,
      payload
    );
    return response.data.data;
  },

  async schedule(id: string, payload: Record<string, any>): Promise<WastePickupRequest> {
    const response = await api.put<ApiResponse<WastePickupRequest>>(
      `/officer/waste-pickup/${id}/schedule`,
      payload
    );
    return response.data.data;
  },

  async updateStatus(id: string, payload: { status: WastePickupStatus; remarks?: string; latitude?: number; longitude?: number }): Promise<WastePickupRequest> {
    const response = await api.put<ApiResponse<WastePickupRequest>>(
      `/officer/waste-pickup/${id}/status`,
      payload
    );
    return response.data.data;
  },

  async close(
    id: string,
    payload: {
      closureRemarks: string;
      closureLatitude: number;
      closureLongitude: number;
      actualWasteQuantity?: WasteQuantityEstimate;
      siteFullyCleaned?: boolean;
      assignedVehicleNumber?: string;
      sanitationTeamName?: string;
      afterPhotos: File[];
    }
  ): Promise<WastePickupRequest> {
    const formData = new FormData();
    formData.append("closureRemarks", payload.closureRemarks);
    formData.append("closureLatitude", String(payload.closureLatitude));
    formData.append("closureLongitude", String(payload.closureLongitude));
    if (payload.actualWasteQuantity) formData.append("actualWasteQuantity", payload.actualWasteQuantity);
    if (payload.siteFullyCleaned !== undefined) formData.append("siteFullyCleaned", String(payload.siteFullyCleaned));
    if (payload.assignedVehicleNumber) formData.append("assignedVehicleNumber", payload.assignedVehicleNumber);
    if (payload.sanitationTeamName) formData.append("sanitationTeamName", payload.sanitationTeamName);
    payload.afterPhotos.forEach((file) => formData.append("afterPhotos", file));

    const response = await api.put<ApiResponse<WastePickupRequest>>(
      `/officer/waste-pickup/${id}/close`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data.data;
  },
};
