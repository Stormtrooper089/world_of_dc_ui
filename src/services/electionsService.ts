import api from "./api";
import { ApiResponse } from "../types";

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
};

export { MAX_MEMBER_RESULTS };
