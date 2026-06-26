import api from "./api";
import {
  ApiResponse,
  AuctionAuditTrail,
  AuctionBid,
  AuctionDashboard,
  AuctionListing,
} from "../types";

export interface AuctionListingPayload {
  title: string;
  description?: string;
  category?: string;
  resourceType?: string;
  department?: string;
  wardNumber?: number;
  wardName?: string;
  zone?: string;
  locality?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  basePrice: number;
  reservePrice?: number;
  bidIncrement: number;
  emdAmount?: number;
  startAt?: string;
  endAt?: string;
  inspectionAt?: string;
  eligibilityCriteria?: string;
  termsAndConditions?: string;
}

export const auctionService = {
  async list(params?: { status?: string; category?: string; wardNumber?: number }): Promise<AuctionListing[]> {
    const response = await api.get<ApiResponse<AuctionListing[]>>("/auctions", { params });
    return response.data.data;
  },

  async detail(auctionId: string): Promise<AuctionListing> {
    const response = await api.get<ApiResponse<AuctionListing>>(`/auctions/${auctionId}`);
    return response.data.data;
  },

  async bidSummary(auctionId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/auctions/${auctionId}/bids/summary`);
    return response.data.data;
  },

  async placeBid(auctionId: string, payload: {
    bidderType: string;
    businessName?: string;
    gstNumber?: string;
    tradeLicenseNumber?: string;
    bidAmount: number;
    termsAccepted: boolean;
  }): Promise<AuctionBid> {
    const response = await api.post<ApiResponse<AuctionBid>>(`/auctions/${auctionId}/bid`, payload);
    return response.data.data;
  },

  async myBids(): Promise<AuctionBid[]> {
    const response = await api.get<ApiResponse<AuctionBid[]>>("/auctions/my-bids");
    return response.data.data;
  },

  async officerDashboard(): Promise<AuctionDashboard> {
    const response = await api.get<ApiResponse<AuctionDashboard>>("/officer/auctions/dashboard");
    return response.data.data;
  },

  async officerAuctions(): Promise<AuctionListing[]> {
    const response = await api.get<ApiResponse<AuctionListing[]>>("/officer/auctions");
    return response.data.data;
  },

  async officerDetail(auctionId: string): Promise<{ auction: AuctionListing; bids: AuctionBid[]; auditTrail: AuctionAuditTrail[] }> {
    const response = await api.get<ApiResponse<{ auction: AuctionListing; bids: AuctionBid[]; auditTrail: AuctionAuditTrail[] }>>(`/officer/auctions/${auctionId}`);
    return response.data.data;
  },

  async create(payload: AuctionListingPayload): Promise<AuctionListing> {
    const response = await api.post<ApiResponse<AuctionListing>>("/officer/auctions", payload);
    return response.data.data;
  },

  async publish(auctionId: string): Promise<AuctionListing> {
    const response = await api.post<ApiResponse<AuctionListing>>(`/officer/auctions/${auctionId}/publish`, {});
    return response.data.data;
  },

  async cancel(auctionId: string, reason: string): Promise<AuctionListing> {
    const response = await api.post<ApiResponse<AuctionListing>>(`/officer/auctions/${auctionId}/cancel`, { reason });
    return response.data.data;
  },

  async award(auctionId: string, bidId?: string): Promise<AuctionListing> {
    const response = await api.post<ApiResponse<AuctionListing>>(`/officer/auctions/${auctionId}/award`, { bidId });
    return response.data.data;
  },
};
