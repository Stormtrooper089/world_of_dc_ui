import api from "./api";
import { ApiResponse } from "../types";

export interface VoiceChatResponse {
  sessionId: string;
  replyText: string;
  actionTaken?: "COMPLAINT_CREATED" | "COMPLAINT_STATUS" | "SERVICE_INFO" | null;
  complaintNumber?: string | null;
}

// Mirrors complaintService.ts's style. Reachable whether or not the citizen
// is logged in (same as trackComplaint()) — but if they ARE logged in, the
// axios interceptor in ./api.ts automatically attaches the Authorization
// bearer token to this request just like any other call, and the backend
// uses that (not anything in this request body) to know who's asking. See
// VoiceAssistantController/VoiceAssistantService for how that identity is
// used to skip asking for a mobile number the citizen already gave at login.
export const voiceAssistantService = {
  async sendTurn(sessionId: string, transcript: string): Promise<VoiceChatResponse> {
    const response = await api.post<ApiResponse<VoiceChatResponse>>(
      "/citizen/voice-assistant/chat",
      { sessionId, transcript }
    );
    return response.data.data;
  },
};
