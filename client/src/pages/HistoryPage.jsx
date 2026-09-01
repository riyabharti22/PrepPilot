import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus, Sparkles, BarChart3 } from "lucide-react";
import { EmptyState, LoadingBlock, ErrorBanner } from "../components/Feedback.jsx";
import { api } from "../services/api.js";

export default function HistoryPage() {
  const [interviews, setInterviews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { interviews } = await api.listInterviews();
        setInterviews(interviews);
      } catch (err) {
        setError(err.message || "Could not load your interview history.");
        setInterviews([]);
      }
    })();
  }, []);

  const completed = (interviews || []).filter((i) => i.status === "completed");

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="mb-10">
        <span className="label-pill">Your progress</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy-900">Interview History</h1>
        <p className="mt-2 text-navy-700/65">
          Every mock interview you've completed on this device, in order.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {interviews === null ? (
        <LoadingBlock message="Loading your history…" />
      ) : completed.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No interviews yet"
          description="Complete your first mock interview to start building your progress history."
          action={
            <Link to="/setup" className="btn-primary mt-2">
              Start Mock Interview
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {completed.map((interview, idx) => {
            const prev = completed[idx + 1];
            const delta = prev && interview.overallScore != null && prev.overallScore != null
              ? interview.overallScore - prev.overallScore
              : null;

            return (
              <Link
                to={`/results/${interview.id}`}
                key={interview.id}
                className="card flex items-center justify-between p-5 transition-shadow hover:shadow-glow"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display text-base font-semibold text-navy-900">
                      {interview.role}
                    </p>
                    {interview.isPracticeSession && (
                      <span className="label-pill">Practice · {interview.focusTopic}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-navy-700/55">
                    {interview.interviewType} Interview · {new Date(interview.completedAt || interview.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {delta !== null && (
                    <DeltaBadge delta={delta} />
                  )}
                  <span className="font-display text-2xl font-bold text-navy-900">
                    {interview.overallScore ?? "—"}
                    <span className="text-sm font-normal text-navy-700/40">/100</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AnalyticsPreview />
    </div>
  );
}

function DeltaBadge({ delta }) {
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-600">
        <TrendingUp size={12} /> +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-500">
        <TrendingDown size={12} /> {delta}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 rounded-full bg-navy-700/10 px-2.5 py-1 text-xs font-semibold text-navy-700/60">
      <Minus size={12} /> 0
    </span>
  );
}

function AnalyticsPreview() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api
      .getAnalyticsSummary()
      .then((res) => setSummary(res.summary))
      .catch(() => setSummary(null));
  }, []);

  if (!summary) return null;

  const stats = [
    { label: "Interviews started", value: summary.interviewsStarted },
    { label: "Interviews completed", value: summary.interviewsCompleted },
    { label: "Unique users", value: summary.uniqueUsers },
    { label: "Avg. score", value: summary.averageScore ?? "—" },
  ];

  return (
    <div className="mt-14 border-t border-navy-700/10 pt-10">
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
        <BarChart3 size={18} className="text-lavender-600" />
        Product traction (live)
      </h2>
      <p className="mt-1 text-sm text-navy-700/55">
        Real, unfabricated usage metrics collected from actual sessions.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="font-display text-2xl font-bold text-navy-900">{s.value}</p>
            <p className="mt-1 text-xs text-navy-700/50">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
