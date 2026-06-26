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

  async approveApplication(
    applicationNumber: string,
    payload: { payableAmount?: number; remarks?: string }
  ): Promise<TradeLicenseApplication> {
    const response = await api.put<ApiResponse<TradeLicenseApplication>>(
      `/officer/trade-license/applications/${applicationNumber}/approve`,
      payload
    );
    return response.data.data;
  },

  async rejectApplication(
    applicationNumber: string,
    payload: { rejectionReason?: string; remarks?: string }
  ): Promise<TradeLicenseApplication> {
    const response = await api.put<ApiResponse<TradeLicenseApplication>>(
      `/officer/trade-license/applications/${applicationNumber}/reject`,
      payload
    );
    return response.data.data;
  },

  async payApplication(applicationNumber: string): Promise<TradeLicenseApplication> {
    const response = await api.post<ApiResponse<TradeLicenseApplication>>(
      `/trade-license/applications/${applicationNumber}/pay`,
      { paymentMode: "UPYOG_SANDBOX" }
    );
    return response.data.data;
  },

  async submitFeedback(
    applicationNumber: string,
    payload: { rating: number; feedback?: string }
  ): Promise<TradeLicenseApplication> {
    const response = await api.post<ApiResponse<TradeLicenseApplication>>(
      `/trade-license/applications/${applicationNumber}/feedback`,
      payload
    );
    return response.data.data;
  },
};
