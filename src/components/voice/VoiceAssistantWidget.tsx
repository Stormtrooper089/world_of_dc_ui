import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  X,
  MessageCircle,
  Volume2,
  FileText,
  ListChecks,
  Info,
  CheckCircle2,
  User,
  Bot,
} from "lucide-react";
import { voiceAssistantService } from "../../services/voiceAssistantService";
import { useAuth } from "../../contexts/AuthContext";
import { startCloudRecording, CloudRecording } from "../../utils/audioRecording";

/**
 * Floating voice-assistant widget for the citizen portal.
 *
 * Identity awareness: when a citizen is logged in, useAuth() already has
 * their name/mobile number from the login response, and the axios
 * interceptor in services/api.ts already attaches their JWT to every request
 * this widget makes — so the backend (VoiceAssistantController) derives the
 * SAME verified identity server-side and never needs this component to send
 * a mobile number at all. This component only *displays* that identity (the
 * "Logged in as ..." badge, the personalized greeting) — it never sends the
 * mobile number itself, since trusting a client-supplied value would be a
 * spoofing risk. See VoiceAssistantService's Identity handling on the
 * backend for where the real trust boundary is.
 *
 * Phase 1: for English, speech-to-text and text-to-speech run entirely in the
 * browser via the Web Speech API — zero backend cost, no cloud STT/TTS keys
 * needed. That's kept as-is here since it already works well for English.
 *
 * Phase 2 (this file, now): for Hindi/Assamese/Bengali, the browser's Web
 * Speech API is unreliable-to-nonexistent (Chrome desktop is decent for
 * Hindi; Assamese is essentially unsupported everywhere, and TTS voices for
 * these languages are rarely installed at all). So non-English languages
 * record raw microphone audio (see utils/audioRecording.ts, which WAV-encodes
 * it client-side) and send it to the backend's Bhashini-backed
 * /speech-to-text and /text-to-speech endpoints instead. If the backend
 * isn't configured with Bhashini credentials yet, or a cloud call fails, this
 * falls back to typed input / browser speechSynthesis (silently, for TTS —
 * see `speak` below) rather than breaking the widget. A text fallback box is
 * always shown regardless of language or path.
 */

interface ConversationTurn {
  role: "citizen" | "assistant";
  text: string;
  actionTaken?: string | null;
  complaintNumber?: string | null;
}

interface QuickAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  phrase: string;
}

type Language = "en" | "hi" | "as" | "bn";

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "as", label: "অসমীয়া" },
  { code: "bn", label: "বাংলা" },
];

function createSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `voice-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const speechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

const cloudRecordingSupported =
  typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

export default function VoiceAssistantWidget() {
  const { user, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [language, setLanguage] = useState<Language>("en");

  const greeting = useMemo(() => {
    if (isAuthenticated && user?.name) {
      const firstName = user.name.split(" ")[0];
      return `Hi ${firstName}! I already have your details on file, so I can file a complaint or check on one without asking for your mobile number again. What would you like to do?`;
    }
    return "Namaskar! I can help you file a complaint, check a complaint's status, or find a district service. Log in first if you'd like me to skip asking for your mobile number.";
  }, [isAuthenticated, user]);

  const [turns, setTurns] = useState<ConversationTurn[]>([{ role: "assistant", text: greeting }]);

  const sessionIdRef = useRef(createSessionId());
  const recognitionRef = useRef<any>(null);
  const cloudRecordingRef = useRef<CloudRecording | null>(null);
  // True when stopListening() was called while startCloudRecording()'s
  // getUserMedia prompt was still pending — otherwise a fast tap-tap would
  // leave the mic stream running with nothing left holding a reference to it.
  const pendingCloudStopRef = useRef(false);

  // Quick-reply chips — the point is to make the three main things this
  // assistant can do obvious and one-tap, instead of citizens having to
  // guess how to phrase a request.
  const quickActions: QuickAction[] = useMemo(
    () => [
      {
        key: "file",
        label: "File a complaint",
        icon: <FileText className="h-3.5 w-3.5" />,
        phrase: "I want to file a new complaint.",
      },
      {
        key: "status",
        label: isAuthenticated ? "My complaints" : "Check status",
        icon: <ListChecks className="h-3.5 w-3.5" />,
        phrase: isAuthenticated ? "Show me my recent complaints." : "I want to check a complaint's status.",
      },
      {
        key: "services",
        label: "District services",
        icon: <Info className="h-3.5 w-3.5" />,
        phrase: "What district services are available?",
      },
    ],
    [isAuthenticated]
  );

  const speak = useCallback(
    async (text: string) => {
      try {
        const { audioBase64 } = await voiceAssistantService.textToSpeech(text, language);
        await new Audio(`data:audio/wav;base64,${audioBase64}`).play();
        return;
      } catch (err) {
        // Cloud TTS not configured (yet) or failed — fall back below. Logged
        // only, not shown to the citizen, same as the backend's own
        // placeholder-mode logging for the chat LLM.
        // eslint-disable-next-line no-console
        console.error("Cloud text-to-speech failed, falling back to browser speech synthesis:", err);
      }
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

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

  // English uses the existing free/instant browser recognizer. Other
  // languages record raw audio for the backend's Bhashini STT endpoint
  // instead, since browser recognition doesn't reliably support them.
  const useCloudSpeechForLanguage = language !== "en";

  const startListening = useCallback(() => {
    if (!useCloudSpeechForLanguage) {
      if (!speechSupported) return;
      const SpeechRecognitionCtor =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = "en-IN";
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
      return;
    }

    if (!cloudRecordingSupported) return;
    pendingCloudStopRef.current = false;
    setListening(true);
    startCloudRecording()
      .then((recording) => {
        if (pendingCloudStopRef.current) {
          pendingCloudStopRef.current = false;
          recording.cancel();
          return;
        }
        cloudRecordingRef.current = recording;
      })
      .catch((err) => {
        setListening(false);
        // eslint-disable-next-line no-console
        console.error("Couldn't start microphone capture:", err);
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Couldn't access the microphone. Please check permissions, or type your message below.",
          },
        ]);
      });
  }, [useCloudSpeechForLanguage, sendTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const recording = cloudRecordingRef.current;
    cloudRecordingRef.current = null;
    setListening(false);
    if (!recording) {
      // startCloudRecording() hasn't resolved yet — tell it to cancel itself
      // once the mic stream does come through, instead of leaving it open.
      pendingCloudStopRef.current = true;
      return;
    }

    setBusy(true);
    recording
      .stop()
      .then((audioBase64) => voiceAssistantService.speechToText(audioBase64, language))
      .then(({ transcript }) => {
        setBusy(false);
        if (transcript.trim()) {
          sendTranscript(transcript);
        }
      })
      .catch((err) => {
        setBusy(false);
        // eslint-disable-next-line no-console
        console.error("Cloud speech-to-text failed:", err);
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Sorry, I couldn't understand that. Please try again, or type your message below.",
          },
        ]);
      });
  }, [language, sendTranscript]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      cloudRecordingRef.current?.cancel();
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
    <div className="fixed bottom-6 right-6 z-50 w-80 max-h-[30rem] flex flex-col rounded-xl border border-blue-100 bg-white shadow-2xl">
      <div className="flex items-center justify-between rounded-t-xl bg-blue-600 px-4 py-3 text-white">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Voice Assistant</span>
          </div>
          <div className="mt-0.5 text-[11px] text-blue-100">
            {isAuthenticated
              ? `Logged in as ${user?.name ?? "citizen"}${user?.mobileNumber ? ` · ${user.mobileNumber}` : ""}`
              : "Not logged in — log in to skip re-stating your mobile number"}
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close voice assistant">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-1.5 border-b border-gray-100 px-3 py-2">
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            onClick={() => setLanguage(option.code)}
            disabled={listening || busy}
            className={`flex-1 rounded-full px-2 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
              language === option.code
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {turns.map((turn, index) => (
          <div key={index} className={`flex items-end gap-2 ${turn.role === "citizen" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                turn.role === "citizen" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"
              }`}
            >
              {turn.role === "citizen" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
            </div>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                turn.role === "citizen" ? "bg-blue-50 text-blue-900" : "bg-gray-100 text-gray-800"
              }`}
            >
              {turn.text}
              {turn.complaintNumber && (
                <div className="mt-1.5 flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-200">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complaint #{turn.complaintNumber}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="ml-8 text-xs text-gray-400 px-3">Thinking…</div>}
      </div>

      {/* Quick-action chips: always visible, so choosing what to do never requires
          guessing how to phrase a request — tap instead of typing/speaking. */}
      <div className="flex gap-1.5 overflow-x-auto border-t border-gray-100 px-3 pt-2">
        {quickActions.map((action) => (
          <button
            key={action.key}
            onClick={() => sendTranscript(action.phrase)}
            disabled={busy}
            className="flex flex-shrink-0 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-2">
        {(useCloudSpeechForLanguage ? cloudRecordingSupported : speechSupported) ? (
          <button
            onClick={listening ? stopListening : startListening}
            disabled={busy}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-colors ${
              listening ? "bg-red-100 text-red-700" : "bg-blue-600 text-white hover:bg-blue-700"
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
