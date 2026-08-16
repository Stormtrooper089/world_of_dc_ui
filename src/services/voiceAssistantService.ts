import api from "./api";
import { ApiResponse } from "../types";

export interface VoiceChatResponse {
  sessionId: string;
  replyText: string;
  actionTaken?: "COMPLAINT_CREATED" | "COMPLAINT_STATUS" | "SERVICE_INFO" | "WASTE_PICKUP_REQUESTED" | null;
  complaintNumber?: string | null;
  trackingNumber?: string | null;
}

export interface SpeechToTextResponse {
  transcript: string;
}

export interface TextToSpeechResponse {
  audioBase64: string;
  audioFormat: string;
}

// Bhashini's pipeline-config call (cache miss) plus the inference call can
// take longer than the default 10s axios timeout, so these two get their own.
const VOICE_CLOUD_TIMEOUT_MS = 20000;

// Mirrors complaintService.ts's style. Reachable whether or not the citizen
// is logged in (same as trackComplaint()) — but if they ARE logged in, the
// axios interceptor in ./api.ts automatically attaches the Authorization
// bearer token to this request just like any other call, and the backend
// uses that (not anything in this request body) to know who's asking. See
// VoiceAssistantController/VoiceAssistantService for how that identity is
// used to skip asking for a mobile number the citizen already gave at login.
export const voiceAssistantService = {
  // latitude/longitude come from the widget's navigator.geolocation call (same
  // trust level as the coords the regular web complaint forms already send) —
  // harmless to include on every turn, the backend only uses them if this turn
  // ends up actually filing a complaint.
  async sendTurn(
    sessionId: string,
    transcript: string,
    latitude?: number | null,
    longitude?: number | null
  ): Promise<VoiceChatResponse> {
    const response = await api.post<ApiResponse<VoiceChatResponse>>(
      "/citizen/voice-assistant/chat",
      { sessionId, transcript, latitude: latitude ?? undefined, longitude: longitude ?? undefined }
    );
    return response.data.data;
  },

  // audioBase64 must already be 16kHz mono PCM WAV — see utils/audioRecording.ts.
  async speechToText(audioBase64: string, language: string): Promise<SpeechToTextResponse> {
    const response = await api.post<ApiResponse<SpeechToTextResponse>>(
      "/citizen/voice-assistant/speech-to-text",
      { audioBase64, language },
      { timeout: VOICE_CLOUD_TIMEOUT_MS }
    );
    return response.data.data;
  },

  async textToSpeech(text: string, language: string): Promise<TextToSpeechResponse> {
    const response = await api.post<ApiResponse<TextToSpeechResponse>>(
      "/citizen/voice-assistant/text-to-speech",
      { text, language },
      { timeout: VOICE_CLOUD_TIMEOUT_MS }
    );
    return response.data.data;
  },
};
