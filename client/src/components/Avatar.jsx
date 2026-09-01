import React from "react";

export default function Avatar({ state = "idle", size = "lg" }) {
  const dims = size === "lg" ? 200 : size === "md" ? 150 : 110;

  const ring =
    {
      idle: "border-lavender-300/40",
      thinking: "border-lavender-400/70",
      speaking: "border-lavender-500",
      listening: "border-emerald-400/80",
      processing: "border-lavender-400/70",
    }[state] || "border-lavender-300/40";

  const glow =
    {
      idle: "shadow-[0_0_30px_rgba(139,124,246,0.15)]",
      thinking: "shadow-[0_0_40px_rgba(139,124,246,0.35)]",
      speaking: "shadow-[0_0_50px_rgba(139,124,246,0.5)]",
      listening: "shadow-[0_0_40px_rgba(52,211,153,0.4)]",
      processing: "shadow-[0_0_40px_rgba(139,124,246,0.35)]",
    }[state] || "";

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative rounded-full border-4 border-white ${glow} transition-all duration-500`}
        style={{ width: dims, height: dims }}
      >
        {(state === "speaking" || state === "listening") && (
          <span
            className={`absolute inset-0 rounded-full animate-ping ${
              state === "speaking" ? "bg-lavender-400/10" : "bg-emerald-400/10"
            }`}
          />
        )}
        <div
          className={`relative flex h-full w-full items-center justify-center rounded-full border-2 ${ring} bg-navy-950 transition-colors duration-500`}
        >
          <FaceSVG state={state} dims={dims} />
        </div>
      </div>

      <StateBadge state={state} />
    </div>
  );
}

function FaceSVG({ state, dims }) {
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking" || state === "processing";
  const faceSize = Math.round(dims * 0.55);

  return (
    <svg
      viewBox="0 0 120 120"
      width={faceSize}
      height={faceSize}
      className="animate-float"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="faceGrad" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#B7A9F7" />
          <stop offset="100%" stopColor="#8B7CF6" />
        </radialGradient>
      </defs>

      {/* face */}
      <circle cx="60" cy="60" r="50" fill="url(#faceGrad)" />

      {/* eyes */}
      <g className={!isThinking ? "animate-blink" : ""} style={{ transformOrigin: "60px 55px" }}>
        <circle cx="42" cy="55" r="5" fill="#1A1533" />
        <circle cx="78" cy="55" r="5" fill="#1A1533" />
      </g>

      {/* mouth */}
      {isSpeaking ? (
        <ellipse
          cx="60"
          cy="80"
          rx="9"
          ry="6"
          fill="#1A1533"
          className="animate-mouthTalk"
          style={{ transformOrigin: "60px 80px" }}
        />
      ) : (
        <rect x="48" y="78" width="24" height="6" rx="3" fill="#1A1533" />
      )}

      {/* thinking dots */}
      {isThinking && (
        <g>
          <circle cx="100" cy="20" r="4" fill="#8B7CF6">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="110" cy="10" r="4" fill="#8B7CF6">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
          </circle>
        </g>
      )}
    </svg>
  );
}

function StateBadge({ state }) {
  const config = {
    idle: { label: "Ready", color: "bg-navy-700/10 text-navy-700" },
    thinking: { label: "Thinking…", color: "bg-lavender-200 text-lavender-700" },
    speaking: { label: "Speaking…", color: "bg-lavender-500 text-white" },
    listening: { label: "Listening…", color: "bg-emerald-500 text-white" },
    processing: { label: "Evaluating…", color: "bg-lavender-200 text-lavender-700" },
  }[state] || { label: "Ready", color: "bg-navy-700/10 text-navy-700" };

  return (
    <div
      className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-300 ${config.color}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          state === "idle" ? "bg-navy-400" : "bg-white animate-pulseSoft"
        }`}
      />
      {config.label}
    </div>
  );
}