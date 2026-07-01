import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Square,
  RotateCcw,
  Check,
  SkipForward,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { mockInterviewService } from "../../services/mockInterviewService";

export function QuestionScreen({
  question,
  currentIndex,
  totalQuestions,
  onAnswerCompleted,
  onSkip,
}) {
  const [step, setStep] = useState("idle"); // idle, recording, transcribing, editing
  const [recordTime, setRecordTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleStartRecording = async () => {
    setError("");
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        uploadAndTranscribe(audioBlob);
      };

      setRecordTime(0);
      mediaRecorderRef.current.start();
      setStep("recording");

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access failed:", err);
      setError(
        "Could not access your microphone. Please grant permission and try again.",
      );
      setStep("idle");
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setStep("transcribing");
      setLoadingText("Transcribing your audio...");
    }
  };

  const uploadAndTranscribe = async (audioBlob) => {
    try {
      const res = await mockInterviewService.transcribeAudio(audioBlob);
      setTranscript(res.transcript || "");
      setStep("editing");
    } catch (err) {
      console.error(err);
      setError(
        "Speech-to-text transcription failed. Please type/edit your answer manually below.",
      );
      setTranscript("");
      setStep("editing");
    }
  };

  const handleSubmitTranscript = () => {
    if (!transcript.trim()) {
      setError("Please provide an answer (or record again) before submitting.");
      return;
    }
    setError("");

    // Pass the transcript and duration to the parent orchestrator
    onAnswerCompleted({
      question_id: question.id,
      question_text: question.question,
      transcript: transcript,
      answer_duration: recordTime,
    });

    // Reset component state for the next question
    setStep("idle");
    setTranscript("");
    setRecordTime(0);
    setError("");
  };

  const handleSkipQuestion = () => {
    onSkip();
    setStep("idle");
    setTranscript("");
    setRecordTime(0);
    setError("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
            {question.category}
          </span>
          <h3 className="text-sm font-bold text-foreground mt-1.5">
            Question {currentIndex + 1} of {totalQuestions}
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-semibold">
          {Math.round(((currentIndex + 1) / totalQuestions) * 100)}% Completed
        </span>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase">
            Active Question
          </span>
          <p className="text-base font-semibold text-foreground leading-relaxed">
            {question.question}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-semibold flex items-center gap-2 animate-in fade-in-0 duration-200">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recording Steps */}
      {step === "idle" && (
        <div className="bg-muted/30 border border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <button
            onClick={handleStartRecording}
            className="w-16 h-16 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Mic size={24} />
          </button>
          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-foreground">
              Click to Start Recording
            </p>
            <p className="text-[10px] text-muted-foreground">
              Answer verbally using your microphone.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSkipQuestion}
              className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              Skip Question <SkipForward size={12} />
            </button>
          </div>
        </div>
      )}

      {step === "recording" && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            {/* Pulsing ring animation */}
            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
            <button
              onClick={handleStopRecording}
              className="relative w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transition-all cursor-pointer"
            >
              <Square size={20} className="fill-white" />
            </button>
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 justify-center">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Recording Answer...
            </p>
            <p className="text-2xl font-mono font-bold text-foreground">
              {formatTime(recordTime)}
            </p>
          </div>
        </div>
      )}

      {step === "transcribing" && (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={36} className="text-primary animate-spin" />
          <p className="text-xs font-bold text-foreground">{loadingText}</p>
        </div>
      )}

      {step === "editing" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Your Spoken Answer
            </label>
            <p className="text-[10px] text-muted-foreground">
              Review and correct any spelling/transcription errors below before
              submitting.
            </p>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="w-full min-h-[120px] p-4 bg-card border border-border rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground outline-none resize-y"
              placeholder="Your answer will appear here..."
            />
          </div>

          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleStartRecording}
              className="h-9 px-4 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Record Again
            </button>
            <button
              onClick={handleSubmitTranscript}
              className="h-9 px-4 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check size={13} /> Submit Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
