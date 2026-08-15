import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, X, MessageCircle, Volume2 } from "lucide-react";
import { voiceAssistantService } from "../../services/voiceAssistantService";

/**
 * Floating voice-assistant widget for the citizen portal.
 *
 * Phase 1 (this file): speech-to-text and text-to-speech run entirely in the
 * browser via the Web Speech API — zero backend cost, works today, no cloud
 * STT/TTS keys needed. Known limitation: browser support for Hindi/Assamese/
 * Bengali recognition is inconsistent across browsers (Chrome desktop is
 * decent for Hindi; Assamese is essentially unsupported everywhere). A text
 * fallback box is always shown for that reason, and is also what non-Chrome
 * browsers get automatically (see `speechSupported` below).
 *
 * Phase 2 (not in this scaffold): swap startListening()/speak() for calls to
 * a cloud STT/TTS provider that supports Assamese/Bengali/Hindi well (e.g.
 * Sarvam AI, or Google/Azure Speech) — proxied through a new backend endpoint
 * so the provider key never reaches the browser. The rest of this component
 * (conversation state, sendTurn()) doesn't need to change for that swap.
 */

interface ConversationTurn {
  role: "citizen" | "assistant";
  text: string;
  actionTaken?: string | null;
  complaintNumber?: string | null;
}

// Lazily create one session id per page load so multi-turn conversations
// keep context on the backend (see VoiceAssistantService's in-memory map).
function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const speechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export default function VoiceAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [turns, setTurns] = useState<ConversationTurn[]>([
    {
      role: "assistant",
      text: "Namaskar! Tap the mic and tell me your complaint, or ask about a district service.",
    },
  ]);

  const sessionIdRef = useRef(createSessionId());
  const recognitionRef = useRef<any>(null);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  const sendTranscript = useCallback(
    async (transcript: string) => {
      if (!transcript.trim()) return;

      setTurns((prev) => [...prev, { role: "citizen", text: transcript }]);
      setBusy(true);
      try {
        const reply = await voiceAssistantService.sendTurn(sessionIdRef.current, transcript);
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            text: reply.replyText,
            actionTaken: reply.actionTaken,
            complaintNumber: reply.complaintNumber,
          },
        ]);
        speak(reply.replyText);
      } catch (err) {
        const fallback =
          "Sorry, I couldn't reach the assistant just now. Please try again in a moment, or use the complaint form directly.";
        setTurns((prev) => [...prev, { role: "assistant", text: fallback }]);
        speak(fallback);
        // eslint-disable-next-line no-console
        console.error("Voice assistant request failed:", err);
      } finally {
        setBusy(false);
      }
    },
    [speak]
  );

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-IN"; // swap to "hi-IN" for Hindi; see file header for Assamese/Bengali caveat
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      sendTranscript(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [sendTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open voice assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-h-[28rem] flex flex-col rounded-xl border border-blue-100 bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-xl bg-blue-600 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm font-semibold">Voice Assistant</span>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close voice assistant">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {turns.map((turn, index) => (
          <div
            key={index}
            className={`rounded-lg px-3 py-2 text-sm ${
              turn.role === "citizen"
                ? "ml-6 bg-blue-50 text-blue-900"
                : "mr-6 bg-gray-100 text-gray-800"
            }`}
          >
            {turn.text}
            {turn.complaintNumber && (
              <div className="mt-1 text-xs font-semibold text-blue-700">
                Complaint #{turn.complaintNumber}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="mr-6 text-xs text-gray-400 px-3">Thinking…</div>}
      </div>

      <div className="border-t border-gray-100 p-3 space-y-2">
        {speechSupported ? (
          <button
            onClick={listening ? stopListening : startListening}
            disabled={busy}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
              listening
                ? "bg-red-100 text-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {listening ? "Listening… tap to stop" : "Tap to speak"}
          </button>
        ) : (
          <p className="text-xs text-gray-400">
            Voice input isn't supported in this browser — type your question below.
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const text = typedInput;
            setTypedInput("");
            sendTranscript(text);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={typedInput}
            onChange={(e) => setTypedInput(e.target.value)}
            placeholder="Or type here…"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={busy || !typedInput.trim()}
            className="rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
