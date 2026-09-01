import React from "react";

export default function Avatar({ state = "idle", size = "lg", shape = "rectangle" }) {
  const isCircle = shape === "circle";
  const dims = size === "lg" ? 300 : size === "md" ? 230 : 160;
  const width = dims;
  const height = isCircle ? dims : Math.round(dims * 1.25);

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
        className={`relative border-2 ${ring} ${glow} transition-all duration-500 overflow-hidden ${
          isCircle ? "rounded-full" : "rounded-2xl"
        }`}
        style={{ width, height }}
      >
        {(state === "speaking" || state === "listening") && (
          <span
            className={`absolute inset-0 animate-ping ${
              state === "speaking" ? "bg-lavender-400/10" : "bg-emerald-400/10"
            } ${isCircle ? "rounded-full" : ""}`}
          />
        )}
        <div className="relative flex h-full w-full items-end justify-center overflow-hidden bg-gradient-to-b from-[#E9EEF5] via-[#DCE3ED] to-[#C9D2DE]">
          {!isCircle && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-navy-950/70 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI Interviewer
            </div>
          )}
          {/* soft studio backdrop vignette */}
          <div className="pointer-events-none absolute inset-0" style={{
            background: "radial-gradient(circle at 50% 30%, rgba(255,255,255,0.35), transparent 60%)"
          }} />
          <FaceSVG state={state} width={width} height={height} isCircle={isCircle} />
        </div>
      </div>

      <StateBadge state={state} />
    </div>
  );
}

function FaceSVG({ state, width, height, isCircle }) {
  const isSpeaking = state === "speaking";
  const isThinking = state === "thinking" || state === "processing";
  const isListening = state === "listening";

  return (
    <svg
      viewBox="0 0 300 375"
      width={width}
      height={height}
      preserveAspectRatio={isCircle ? "xMidYMid slice" : "xMidYMax slice"}
      className="animate-float"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F4C6A0" />
          <stop offset="100%" stopColor="#E3A87B" />
        </linearGradient>

        <radialGradient id="skinShade" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E211C" />
          <stop offset="100%" stopColor="#19100D" />
        </linearGradient>

        <linearGradient id="suit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#243C5C" />
          <stop offset="100%" stopColor="#0F1F33" />
        </linearGradient>

        <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#EDECE8" />
        </linearGradient>

        <linearGradient id="tie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1D3350" />
          <stop offset="100%" stopColor="#0A1728" />
        </linearGradient>
      </defs>

      {/* shoulders / blazer */}
      <path
        d="M30 375 C36 314 54 279 92 259 C110 249 127 244 150 244 C173 244 190 249 208 259 C246 279 264 314 270 375 Z"
        fill="url(#suit)"
      />
      {/* lapels */}
      <path d="M120 250 L150 288 L133 320 L100 264 Z" fill="#0C1A2C" opacity="0.85" />
      <path d="M180 250 L150 288 L167 320 L200 264 Z" fill="#0C1A2C" opacity="0.85" />
      <path d="M96 271 L64 375" stroke="#2E4A6E" strokeWidth="1.5" opacity="0.6" />
      <path d="M204 271 L236 375" stroke="#2E4A6E" strokeWidth="1.5" opacity="0.6" />

      {/* shirt collar */}
      <path d="M121 246 L150 285 L179 246 L187 269 L150 322 L113 269 Z" fill="url(#shirt)" />
      <path d="M121 246 L150 285 L138 306 L106 266 Z" fill="#F7F6F3" />
      <path d="M179 246 L150 285 L162 306 L194 266 Z" fill="#F7F6F3" />

      {/* tie */}
      <path d="M141 274 L159 274 L157 302 L150 320 L143 302 Z" fill="url(#tie)" />
      <path d="M143 302 L157 302 L162 362 L150 375 L138 362 Z" fill="url(#tie)" />
      <path d="M144 278 L156 278 L155 288 L150 292 L145 288 Z" fill="#2A4468" opacity="0.7" />

      {/* neck */}
      <path
        d="M128 200 L128 254 C135 266 142 271 150 271 C158 271 165 266 172 254 L172 200 Z"
        fill="url(#skin)"
      />
      <path d="M128 214 C136 224 164 224 172 214" stroke="#D08F63" strokeWidth="2" opacity="0.4" fill="none" />

      {/* ears */}
      <path d="M89 148 C79 143 78 157 82 175 C85 189 92 196 99 190 L100 155 C97 152 94 150 89 148 Z" fill="#E3A87B" />
      <path d="M211 148 C221 143 222 157 218 175 C215 189 208 196 201 190 L200 155 C203 152 206 150 211 148 Z" fill="#E3A87B" />
      <path d="M89 161 C86 165 88 177 94 180" stroke="#C67F53" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M211 161 C214 165 212 177 206 180" stroke="#C67F53" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* face base */}
      <path
        d="M150 66 C108 66 88 95 88 141 L88 172 C88 217 109 247 150 259 C191 247 212 217 212 172 L212 141 C212 95 192 66 150 66 Z"
        fill="url(#skin)"
      />
      <path
        d="M150 66 C108 66 88 95 88 141 L88 172 C88 217 109 247 150 259 C191 247 212 217 212 172 L212 141 C212 95 192 66 150 66 Z"
        fill="url(#skinShade)"
      />

      {/* subtle jaw/cheek contour for definition */}
      <path
        d="M88 166 C90 209 111 240 150 258 C189 240 210 209 212 166 C205 202 183 222 150 225 C117 222 95 202 88 166 Z"
        fill="#C9895D"
        opacity="0.10"
      />

      {/* hair — neat, professional short cut */}
      <path
        d="M87 138 C83 118 84 97 93 82 C107 55 132 40 160 40 C190 40 209 53 218 74 C224 87 225 102 221 116 C215 108 207 100 199 96 C184 103 167 106 150 104 C132 103 116 98 103 92 C96 106 92 122 91 138 Z"
        fill="url(#hair)"
      />
      <path
        d="M96 92 C114 60 148 46 178 51 C198 55 213 65 220 80 C199 77 180 79 162 74 C141 68 119 72 96 92 Z"
        fill="#241813"
      />
      <path d="M112 78 C130 65 149 62 169 68" stroke="#150E0B" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M128 71 C146 62 164 61 182 67" stroke="#150E0B" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M207 86 C221 86 228 98 227 115 C226 132 218 146 209 154 L204 127 Z" fill="#1D130F" />

      {/* eyebrows */}
      <g className={isThinking ? "animate-browRaise" : ""} style={{ transformOrigin: "150px 135px" }}>
        <path d="M110 138 C119 131 130 130 141 135" stroke="#241813" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M159 135 C170 130 181 131 190 138" stroke="#241813" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      </g>

      {/* eyes — sharper, more alert/professional */}
      <g className={!isThinking ? "animate-blink" : ""} style={{ transformOrigin: "125px 156px" }}>
        <path d="M113 156 Q125 148 137 156 Q125 163 113 156 Z" fill="#FFFDFB" />
        <circle cx="125.5" cy="156" r="5" fill="#33231A" />
        <circle cx="125.5" cy="156" r="2.2" fill="#0C0806" />
        <circle cx="127.3" cy="154.2" r="1.3" fill="white" />
        <path d="M113 156 Q125 149 137 156" stroke="#241813" strokeWidth="1.6" fill="none" />
      </g>
      <g className={!isThinking ? "animate-blink" : ""} style={{ transformOrigin: "175px 156px" }}>
        <path d="M163 156 Q175 148 187 156 Q175 163 163 156 Z" fill="#FFFDFB" />
        <circle cx="174.5" cy="156" r="5" fill="#33231A" />
        <circle cx="174.5" cy="156" r="2.2" fill="#0C0806" />
        <circle cx="176.3" cy="154.2" r="1.3" fill="white" />
        <path d="M163 156 Q175 149 187 156" stroke="#241813" strokeWidth="1.6" fill="none" />
      </g>

      {/* nose — cleaner, single line contour */}
      <path
        d="M150 152 C149 164 146 177 141 187 C145 190 150 191 155 190 C158 189 160 187 161 185"
        stroke="#C77F55"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />
      <ellipse cx="106" cy="187" rx="12" ry="6" fill="#DD9268" opacity="0.16" />
      <ellipse cx="194" cy="187" rx="12" ry="6" fill="#DD9268" opacity="0.16" />

      {/* mouth */}
      {isSpeaking ? (
        <ellipse
          cx="150"
          cy="209"
          rx="14"
          ry="8.5"
          fill="#B96654"
          className="animate-mouthTalk"
          style={{ transformOrigin: "150px 209px" }}
        />
      ) : (
        <>
          <path d="M134 205 C142 210 158 210 166 205" stroke="#A85748" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M140 212 C146 215 154 215 160 212" stroke="#D97D66" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.65" />
        </>
      )}

      {/* thinking dots */}
      {isThinking && (
        <g>
          <circle cx="235" cy="66" r="5" fill="#8B7CF6">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx="250" cy="54" r="5" fill="#8B7CF6">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" begin="0.2s" />
          </circle>
          <circle cx="265" cy="42" r="5" fill="#8B7CF6">
            <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
          </circle>
        </g>
      )}

      {/* listening waveform */}
      {isListening && (
        <g transform="translate(224,150)">
          <rect x="0" y="-10" width="5" height="20" rx="2.5" fill="#34D399" className="animate-waveform" />
          <rect x="10" y="-17" width="5" height="34" rx="2.5" fill="#34D399" className="animate-waveform" style={{ animationDelay: "150ms" }} />
          <rect x="20" y="-12" width="5" height="24" rx="2.5" fill="#34D399" className="animate-waveform" style={{ animationDelay: "300ms" }} />
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