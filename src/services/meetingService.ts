import api from "./api";
import { ApiResponse, Meeting, MeetingCreateRequest } from "../types";

export const meetingService = {
  async createMeeting(request: MeetingCreateRequest): Promise<Meeting> {
    const response = await api.post<ApiResponse<Meeting>>(
      "/meetings/create",
      request
    );
    return response.data.data;
  },

  async getMyMeetings(): Promise<Meeting[]> {
    const response = await api.get<ApiResponse<Meeting[]>>(
      "/meetings/my-meetings"
    );
    return response.data.data;
  },

  async getUpcomingMeetings(): Promise<Meeting[]> {
    const response = await api.get<ApiResponse<Meeting[]>>(
      "/meetings/upcoming"
    );
    return response.data.data;
  },

  async getAllMeetings(): Promise<Meeting[]> {
    const response = await api.get<ApiResponse<Meeting[]>>("/meetings/all");
    return response.data.data;
  },

  async getMeetingById(id: string): Promise<Meeting> {
    const response = await api.get<ApiResponse<Meeting>>(`/meetings/${id}`);
    return response.data.data;
  },
};
