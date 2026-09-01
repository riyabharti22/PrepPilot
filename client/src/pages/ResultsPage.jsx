import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, AlertCircle, Target, RotateCcw, History, Loader2 } from "lucide-react";
import ScoreRing, { MetricBar } from "../components/ScoreRing.jsx";
import { ErrorBanner, LoadingBlock } from "../components/Feedback.jsx";
import { api } from "../services/api.js";

export default function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practicingTopic, setPracticingTopic] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { interview } = await api.getInterview(id);
        if (cancelled) return;
        setInterview(interview);
        api.logEvent("results_viewed", id);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your results.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handlePractice(topic) {
    setPracticingTopic(topic);
    setError(null);
    try {
      const result = await api.startWeakAreaPractice(id, topic);
      navigate(`/interview/${result.interviewId}`, {
        state: {
          firstQuestion: result.question,
          totalQuestions: result.totalQuestions,
          mode: result.mode,
        },
      });
    } catch (err) {
      setError(err.message || "Could not start the practice session. Please try again.");
      setPracticingTopic(null);
    }
  }

  if (loading) return <LoadingBlock message="Loading your results…" />;
  if (error && !interview) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <ErrorBanner message={error} />
        <Link to="/setup" className="btn-primary mt-6 inline-flex">
          Start a new interview
        </Link>
      </div>
    );
  }
  if (!interview) return null;

  const { overallScore, metrics, strengths, weaknesses, practiceTopics, role, interviewType, isPracticeSession, focusTopic } = interview;

  return (
    <div className="bg-mist-50">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="text-center">
          <span className="label-pill">
            {isPracticeSession ? `Practice session · ${focusTopic}` : "Interview complete"}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-navy-900">
            {role} · {interviewType} Interview
          </h1>
          <p className="mt-2 text-navy-700/60">Here's how you did and what to work on next.</p>
        </div>

        {error && (
          <div className="mt-6">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        <div className="mt-10 flex flex-col items-center card p-8">
          <ScoreRing score={overallScore ?? 0} size={160} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card space-y-4 p-6">
            <h3 className="font-display text-sm font-semibold text-navy-900">Performance breakdown</h3>
            <MetricBar label="Technical Knowledge" value={metrics?.technical} />
            <MetricBar label="Communication" value={metrics?.communication} />
            <MetricBar label="Relevance" value={metrics?.relevance} />
            <MetricBar label="Confidence" value={metrics?.confidence} />
            <MetricBar label="Clarity" value={metrics?.clarity} />
          </div>

          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={16} />
                What you did well
              </h3>
              {strengths?.length ? (
                <ul className="space-y-2 text-sm text-navy-700">
                  {strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-emerald-500">✓</span> {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-navy-700/50">Not enough data yet.</p>
              )}
            </div>

            <div className="card p-6">
              <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-amber-700">
                <AlertCircle size={16} />
                Needs improvement
              </h3>
              {weaknesses?.length ? (
                <ul className="space-y-2 text-sm text-navy-700">
                  {weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-amber-500">⚠</span> {w}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-navy-700/50">Not enough data yet.</p>
              )}
            </div>
          </div>
        </div>

        {practiceTopics?.length > 0 && (
          <div className="card mt-8 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold text-navy-900">
              <Target size={16} className="text-lavender-600" />
              Topics to practice
            </h3>
            <div className="flex flex-wrap gap-3">
              {practiceTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handlePractice(topic)}
                  disabled={practicingTopic !== null}
                  className="flex items-center gap-2 rounded-xl border border-navy-700/15 bg-white px-4 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:border-lavender-400 hover:text-lavender-600 disabled:opacity-50"
                >
                  {practicingTopic === topic ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Target size={14} />
                  )}
                  Practice {topic}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/setup" className="btn-primary">
            <RotateCcw size={16} />
            Start Another Interview
          </Link>
          <Link to="/history" className="btn-secondary">
            <History size={16} />
            View Interview History
          </Link>
        </div>
      </div>
    </div>
  );
}
