import api from "./api";
import { ApiResponse } from "../types";

export interface VoiceChatResponse {
  sessionId: string;
  replyText: string;
  actionTaken?: "COMPLAINT_CREATED" | "COMPLAINT_STATUS" | "SERVICE_INFO" | null;
  complaintNumber?: string | null;
}

// Mirrors complaintService.ts's style. This hits a public/anonymous endpoint
// (see VoiceAssistantController on the backend) — no auth header is required,
// same as trackComplaint().
export const voiceAssistantService = {
  async sendTurn(sessionId: string, transcript: string): Promise<VoiceChatResponse> {
    const response = await api.post<ApiResponse<VoiceChatResponse>>(
      "/citizen/voice-assistant/chat",
      { sessionId, transcript }
    );
    return response.data.data;
  },
};
