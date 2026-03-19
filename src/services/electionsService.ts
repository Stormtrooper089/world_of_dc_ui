import api from "./api";
import { ApiResponse } from "../types";

export interface TeamMember {
  id: string;
  name: string;
  team: string;
  station: string;
  phoneNumber: string;
}

export interface TeamMemberSearchParams {
  station?: string;
  name?: string;
  phoneNumber?: string;
  team?: string;
  limit?: number;
}

const MAX_MEMBER_RESULTS = 6;

export const electionsService = {
  async searchTeamMembers(
    params: TeamMemberSearchParams
  ): Promise<TeamMember[]> {
    const response = await api.get<ApiResponse<TeamMember[]>>(
      "/elections/team-members/search",
      {
        params: {
          ...params,
          limit: Math.min(params.limit ?? MAX_MEMBER_RESULTS, MAX_MEMBER_RESULTS),
        },
      }
    );

    const data = response.data?.data ?? [];
    return data.slice(0, MAX_MEMBER_RESULTS);
  },
};

export { MAX_MEMBER_RESULTS };
