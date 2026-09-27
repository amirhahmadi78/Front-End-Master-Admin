import { useEffect, useRef, useState } from "react";

interface VoiceRecorderButtonProps {
  onRecorded: (file: File) => Promise<void> | void;
  disabled?: boolean;
}

export default function VoiceRecorderButton({
  onRecorded,
  disabled = false,
}: VoiceRecorderButtonProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0); // new state for timer

  // ---------- timer effect (added without touching core logic) ----------
  useEffect(() => {
    let interval = null;
    if (isRecording) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // ---------- core logic (untouched) ----------
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const startRecording = async () => {
    if (disabled || isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });

        const ext = mimeType.includes("mp4")
          ? "m4a"
          : mimeType.includes("mp3")
          ? "mp3"
          : mimeType.includes("ogg")
          ? "ogg"
          : "webm";

        const file = new File([blob], `voice-${Date.now()}.${ext}`, {
          type: mimeType,
        });

        await onRecorded(file);
        chunksRef.current = [];
        cleanupStream();
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      cleanupStream();
      setIsRecording(false);
    }
  };

  const handleClick = async () => {
    if (disabled) return;
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  // ---------- cleanups (untouched) ----------
  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      } catch { /* empty */ }
      cleanupStream();
    };
  }, []);

  // ---------- helpers ----------
  const formatTime = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // ---------- render ----------
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative group flex items-center justify-center gap-3 
        px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300
        shadow-md hover:shadow-lg active:scale-[0.97]
        ${disabled ? "cursor-not-allowed opacity-50" : ""}
        ${
          isRecording
            ? "bg-linear-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 shadow-rose-200/50"
            : "bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200/50"
        }
      `}
    >
      {/* recording indicator (pulsing dot + waves) */}
      {isRecording && (
        <span className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-50" />
          </span>
          {/* animated sound waves (pure css) */}
          <span className="flex items-center gap-0.5 h-5">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="block w-0.75 bg-white/80 rounded-full animate-wave"
                style={{
                  height: `${4  * 12}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </span>
        </span>
      )}

      {/* icon */}
      {isRecording ? (
        <span className="text-base">⏹</span>
      ) : (
        <span className="text-base">🎙️</span>
      )}

      {/* label & timer */}
      <span className="flex items-center gap-2">
        <span>{isRecording ? "توقف ضبط" : "شروع ضبط وویس"}</span>
        {isRecording && (
          <span className="font-mono text-sm bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {formatTime(elapsed)}
          </span>
        )}
      </span>
    </button>
  );
}