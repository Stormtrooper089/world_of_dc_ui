import api from "./api";
import {
  ApiResponse,
  MySmcAccount,
  PropertyTaxAccount,
  PropertyTaxDashboard,
  PropertyTaxReceipt,
} from "../types";

export const propertyTaxService = {
  async getMyAccount(): Promise<MySmcAccount> {
    const response = await api.get<ApiResponse<MySmcAccount>>(
      "/property-tax/account"
    );
    return response.data.data;
  },

  async linkProperty(holdingNumber: string): Promise<PropertyTaxAccount> {
    const response = await api.post<ApiResponse<PropertyTaxAccount>>(
      "/property-tax/link",
      { holdingNumber }
    );
    return response.data.data;
  },

  async payPropertyTax(
    holdingNumber: string,
    paymentMode = "ONLINE_SIMULATION"
  ): Promise<PropertyTaxReceipt> {
    const response = await api.post<ApiResponse<PropertyTaxReceipt>>(
      "/property-tax/pay",
      { holdingNumber, paymentMode }
    );
    return response.data.data;
  },

  async getOfficerDashboard(): Promise<PropertyTaxDashboard> {
    const response = await api.get<ApiResponse<PropertyTaxDashboard>>(
      "/officer/property-tax/dashboard"
    );
    return response.data.data;
  },
};
