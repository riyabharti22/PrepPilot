import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Mic, Square, Send, LogOut, Volume2, Loader2, Keyboard } from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import { ErrorBanner } from "../components/Feedback.jsx";
import { useVoice } from "../hooks/useVoice.js";
import { api } from "../services/api.js";

export default function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [question, setQuestion] = useState(location.state?.firstQuestion || null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(location.state?.totalQuestions || 7);
  const [mode, setMode] = useState(location.state?.mode || "demo");

  const [phase, setPhase] = useState("intro"); // intro | asking | answering | evaluating | feedback
  const [typedAnswer, setTypedAnswer] = useState("");
  const [useTyping, setUseTyping] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [loadingInterview, setLoadingInterview] = useState(!location.state?.firstQuestion);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const {
    sttSupported,
    ttsSupported,
    isListening,
    isSpeaking,
    transcript,
    micError,
    startListening,
    stopListening,
    speak,
    resetTranscript,
  } = useVoice();

  const timerRef = useRef(null);
  const hasSpokenRef = useRef(false);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Load interview if we landed here directly (e.g. refresh) without router state
  useEffect(() => {
    if (question) return;
    let cancelled = false;
    (async () => {
      try {
        const { interview } = await api.getInterview(id);
        if (cancelled) return;
        if (interview.status !== "in_progress") {
          navigate(`/results/${id}`, { replace: true });
          return;
        }
        const current = interview.questions[interview.questions.length - 1];
        setQuestion(current);
        setQuestionNumber(interview.questions.length);
        setTotalQuestions(interview.isPracticeSession ? 3 : 7);
        setMode(interview.mode);
      } catch (err) {
        setError(err.message || "Couldn't load this interview.");
      } finally {
        setLoadingInterview(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Speak the question aloud whenever a new question arrives
  useEffect(() => {
    if (!question) return;
    hasSpokenRef.current = false;
    setPhase("asking");
    resetTranscript();
    setTypedAnswer("");

    if (ttsSupported) {
      speak(question.question, {
        onEnd: () => {
          hasSpokenRef.current = true;
          setPhase("answering");
        },
      });
    } else {
      setPhase("answering");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.question]);

  const avatarState = (() => {
    if (phase === "evaluating") return "processing";
    if (isSpeaking) return "speaking";
    if (isListening) return "listening";
    if (phase === "asking") return "thinking";
    return "idle";
  })();

  const currentAnswer = useTyping ? typedAnswer : transcript;

  const handleSubmit = useCallback(async () => {
    if (!currentAnswer || currentAnswer.trim().length === 0) {
      setError("Please give an answer before submitting - speak or type your response.");
      return;
    }
    if (isListening) stopListening();

    setPhase("evaluating");
    setError(null);
    try {
      const result = await api.submitAnswer(id, currentAnswer.trim());
      setLastEvaluation(result.evaluation);
      setPhase("feedback");

      setTimeout(() => {
        if (result.isComplete) {
          navigate(`/results/${id}`);
        } else {
          setQuestion(result.nextQuestion);
          setQuestionNumber(result.questionNumber + 1 > result.totalQuestions ? result.totalQuestions : result.questionNumber + 1);
          setLastEvaluation(null);
        }
      }, 2600);
    } catch (err) {
      setError(err.message || "Something went wrong while evaluating your answer. Please try again.");
      setPhase("answering");
    }
  }, [currentAnswer, id, isListening, navigate, stopListening]);

  async function handleExit() {
    try {
      await api.abandonInterview(id);
    } catch {
      // non-blocking
    }
    navigate("/");
  }

  if (loadingInterview) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 size={28} className="animate-spin text-lavender-500" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <ErrorBanner message={error || "This interview could not be found."} />
        <button onClick={() => navigate("/setup")} className="btn-primary mt-6">
          Start a new interview
        </button>
      </div>
    );
  }

  const progressDots = Array.from({ length: totalQuestions }, (_, i) => i < questionNumber);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="min-h-[calc(100vh-73px)] bg-mist-50">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-display text-sm font-bold text-navy-900">PrepPilot</p>
            <p className="text-xs text-navy-700/50">
              Question {questionNumber}/{totalQuestions} · {mm}:{ss}
              {mode === "demo" && <span className="ml-2 rounded-full bg-lavender-200/60 px-2 py-0.5 text-lavender-700">Demo mode</span>}
            </p>
          </div>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-navy-700/60 hover:text-rose-500"
          >
            <LogOut size={16} />
            Exit
          </button>
        </div>

        {/* Avatar */}
        <div className="mb-8 flex flex-col items-center">
          <Avatar state={avatarState} size="md" />
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}
        {micError && phase === "answering" && (
          <div className="mb-6">
            <ErrorBanner message={micError} />
          </div>
        )}

        {/* Question card */}
        <div className="card p-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-lavender-600">
            {question.topic || "Question"}
          </p>
          <p className="font-display text-lg font-semibold leading-snug text-navy-900">
            {question.question}
          </p>

          {phase === "feedback" && lastEvaluation ? (
            <FeedbackCard evaluation={lastEvaluation} />
          ) : (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-navy-700">Your answer</span>
                <button
                  onClick={() => setUseTyping((v) => !v)}
                  className="flex items-center gap-1 text-xs font-medium text-navy-700/50 hover:text-lavender-600"
                >
                  <Keyboard size={13} />
                  {useTyping ? "Switch to voice" : "Type instead"}
                </button>
              </div>

              {useTyping ? (
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  rows={5}
                  placeholder="Type your answer here…"
                  disabled={phase === "evaluating"}
                  className="w-full resize-none rounded-xl border border-navy-700/15 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-lavender-400"
                />
              ) : (
                <div className="min-h-[110px] rounded-xl border border-navy-700/15 bg-white px-4 py-3 text-sm text-navy-700">
                  {transcript ? (
                    <span className="text-navy-900">{transcript}</span>
                  ) : (
                    <span className="text-navy-700/35">
                      {isListening ? "Listening… start speaking" : "Your transcript will appear here."}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {!useTyping && sttSupported && (
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={phase === "evaluating" || isSpeaking}
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 font-semibold transition-all disabled:opacity-50 ${
                      isListening
                        ? "bg-rose-500 text-white hover:bg-rose-600"
                        : "bg-navy-950 text-white hover:bg-navy-900"
                    }`}
                  >
                    {isListening ? <Square size={16} /> : <Mic size={16} />}
                    {isListening ? "Stop" : "Answer with Voice"}
                  </button>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={phase === "evaluating" || !currentAnswer || isSpeaking}
                  className="btn-primary"
                >
                  {phase === "evaluating" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Evaluating your answer…
                    </>
                  ) : (
                    <>
                      Submit Answer
                      <Send size={16} />
                    </>
                  )}
                </button>

                {isSpeaking && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-navy-700/50">
                    <Volume2 size={15} className="animate-pulseSoft" />
                    AI is asking the question…
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {progressDots.map((filled, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                filled ? "bg-lavender-500" : "bg-navy-700/15"
              }`}
            />
          ))}
        </div>
      </div>

      {showExitConfirm && (
        <ExitModal onCancel={() => setShowExitConfirm(false)} onConfirm={handleExit} />
      )}
    </div>
  );
}

function FeedbackCard({ evaluation }) {
  const score = evaluation.overallScore;
  const color = score >= 75 ? "text-emerald-600" : score >= 50 ? "text-lavender-600" : "text-rose-500";
  return (
    <div className="mt-6 animate-fadeUp rounded-xl bg-mist-100 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-navy-900">Answer scored</span>
        <span className={`font-display text-2xl font-bold ${color}`}>{score}</span>
      </div>
      <p className="mt-2 text-sm text-navy-700/75">{evaluation.feedback}</p>
      <p className="mt-3 text-xs font-medium text-navy-700/50">Moving to the next question…</p>
    </div>
  );
}

function ExitModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-dark">
        <h3 className="font-display text-lg font-semibold text-navy-900">Exit this interview?</h3>
        <p className="mt-2 text-sm text-navy-700/65">
          Your progress on this session won't be scored. You can start a new one anytime.
        </p>
        <div className="mt-6 flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 !py-2.5">
            Keep going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-rose-500 py-2.5 font-semibold text-white hover:bg-rose-600"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
