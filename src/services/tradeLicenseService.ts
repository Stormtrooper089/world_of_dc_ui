import api from "./api";
import {
  ApiResponse,
  TradeLicense,
  TradeLicenseAccount,
  TradeLicenseApplication,
  TradeLicenseDashboard,
} from "../types";

export const tradeLicenseService = {
  async getMyAccount(): Promise<TradeLicenseAccount> {
    const response = await api.get<ApiResponse<TradeLicenseAccount>>(
      "/trade-license/account"
    );
    return response.data.data;
  },

  async linkLicense(licenseNumber: string): Promise<TradeLicense> {
    const response = await api.post<ApiResponse<TradeLicense>>(
      "/trade-license/link",
      { licenseNumber }
    );
    return response.data.data;
  },

  async submitApplication(payload: {
    licenseNumber?: string;
    applicationType: string;
    businessName: string;
    tradeType: string;
    businessAddress: string;
    wardNumber?: number;
    locality?: string;
    remarks?: string;
  }): Promise<TradeLicenseApplication> {
    const response = await api.post<ApiResponse<TradeLicenseApplication>>(
      "/trade-license/application",
      payload
    );
    return response.data.data;
  },

  async getOfficerDashboard(): Promise<TradeLicenseDashboard> {
    const response = await api.get<ApiResponse<TradeLicenseDashboard>>(
      "/officer/trade-license/dashboard"
    );
    return response.data.data;
  },
};
