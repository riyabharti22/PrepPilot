import React from "react";

export default function ScoreRing({ score = 0, size = 140, label = "Overall Score" }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75 ? "#34D399" : clamped >= 50 ? "#8B7CF6" : "#F87171";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E3F3"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold text-navy-900">{clamped}</span>
          <span className="text-xs font-medium text-navy-700/60">/ 100</span>
        </div>
      </div>
      <span className="mt-3 text-sm font-semibold text-navy-700">{label}</span>
    </div>
  );
}

export function MetricBar({ label, value }) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const color = clamped >= 75 ? "bg-emerald-400" : clamped >= 50 ? "bg-lavender-500" : "bg-rose-400";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-navy-700">{label}</span>
        <span className="font-semibold text-navy-900">{clamped}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-navy-700/10">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}