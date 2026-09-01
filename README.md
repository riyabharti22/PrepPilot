# PrepPilot — Your AI Interview Coach

PrepPilot is an AI-powered mock interview platform where a candidate practices
realistic job interviews with an AI interviewer. The AI avatar asks questions
out loud, listens to spoken answers, evaluates them, adapts difficulty in
real time, and produces a full performance report with personalized practice
recommendations.

Built for the **"Build & Validate an AI Avatar Product"** assignment, focused
on placement interviews for software/frontend/backend/full-stack/Java
developer roles.

---

## 1. What PrepPilot does

- Candidate picks a target role, interview type (Technical / HR / Mixed),
  experience level, and difficulty, then shares a resume (paste or PDF).
- An animated AI interviewer avatar asks questions **out loud** (text-to-speech).
- The candidate answers **by voice** (speech-to-text transcribes live), or by typing.
- Every answer is scored (technical, communication, relevance, confidence) with
  written feedback, and the next question adapts to how the candidate is doing.
- Resume content directly shapes questions (e.g. "You mentioned React and
  Node.js — how did you manage state?").
- After 7 questions, PrepPilot generates a full performance report: overall
  score, metric breakdown, strengths, weaknesses, and specific topics to
  practice — each with a one-click focused 3-question practice session.
- An interview history dashboard tracks score progress across sessions, plus
  a small live product-analytics panel (interviews started/completed, unique
  users, average score) built from real usage events — no fabricated numbers.

**Demo Mode:** if no OpenAI API key is configured, PrepPilot automatically
runs on curated per-role question banks and a deterministic scoring model —
the entire product works end-to-end with zero external dependencies. This is
clearly labeled in the UI ("Demo mode" badge during the interview).

---

## 2. Features

| Feature | Where |
|---|---|
| Resume-aware questions | Setup page → resume upload/paste, feeds interview engine |
| Voice-based interview | Web Speech API (STT + TTS), with typed-answer fallback |
| Animated AI avatar | Custom SVG avatar with idle/thinking/speaking/listening/processing states |
| Adaptive difficulty | Server adjusts next-question difficulty based on the last score |
| Instant AI feedback | Structured evaluation JSON per answer |
| Performance report | Score ring, per-metric bars, strengths/weaknesses, practice topics |
| Adaptive practice | One-click focused 3-question session on a weak topic |
| Interview history | Score-over-time dashboard per guest/device |
| Product analytics | Real event tracking (landing views, starts, completions, retries) |
| Guest mode | No signup required — a local guest ID is generated on first visit |
| Demo mode | Fully working without any API key or database configured |

---

## 3. Tech stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router, lucide-react icons.
**Backend:** Node.js, Express.
**Database:** MongoDB + Mongoose (falls back to an in-memory store if unset).
**AI:** OpenAI API (`gpt-4o-mini` by default) via the backend only — never
exposed to the client.
**Voice:** Browser Web Speech API (`SpeechRecognition` + `speechSynthesis`) —
no external speech service or credentials required.

---

## 4. Folder structure

```
PrepPilot/
  client/                  React + Vite frontend
    src/
      components/          Avatar, Navbar, ScoreRing, Feedback UI
      pages/                Landing, Setup, Interview, Results, History, 404
      hooks/                useVoice.js (Web Speech API wrapper)
      services/             api.js (backend client)
      App.jsx, main.jsx, index.css
    index.html
    tailwind.config.js
    vite.config.js
    .env.example

  server/                   Express backend
    controllers/            interviewController.js, analyticsController.js
    routes/                 interviewRoutes.js, analyticsRoutes.js
    models/                 User.js, Interview.js, AnalyticsEvent.js (Mongoose)
    services/               aiService.js (interview engine + demo mode), resumeService.js
    middleware/              errorHandler.js
    utils/                  db.js, store.js (Mongo/in-memory data layer)
    index.js
    .env.example

  README.md
  .gitignore
```

---

## 5. Installation

Requires **Node.js 18+** and **npm**.

```bash
git clone <your-repo-url> PrepPilot
cd PrepPilot
```

### Backend setup

```bash
cd server
npm install
cp .env.example .env
```

### Frontend setup

```bash
cd ../client
npm install
cp .env.example .env
```

---

## 6. Environment variables

### `server/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `5000`) | Port the API listens on |
| `MONGODB_URI` | No | MongoDB connection string. If omitted, PrepPilot runs on an in-memory store (data resets on restart, but everything works) |
| `OPENAI_API_KEY` | No | If omitted, PrepPilot runs in **Demo Mode** automatically |
| `OPENAI_MODEL` | No (default `gpt-4o-mini`) | Model used for question generation & evaluation |
| `CLIENT_ORIGIN` | No (default `http://localhost:5173`) | Comma-separated list of allowed frontend origins (CORS) |
| `NODE_ENV` | No | `development` or `production` |

### `client/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | No (default `http://localhost:5000/api`) | Base URL of the backend API |

**Security:** The OpenAI API key is only ever read on the backend
(`server/services/aiService.js`) via `process.env.OPENAI_API_KEY`. It is never
sent to, bundled into, or accessible from the frontend.

---

## 7. Running locally

Open two terminals.

**Terminal 1 — backend:**
```bash
cd server
npm run dev        # or: npm start
```
You should see:
```
🚀 PrepPilot server running on http://localhost:5000
   AI mode: DEMO (no OPENAI_API_KEY set)
```

**Terminal 2 — frontend:**
```bash
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

That's it — no database or API key is required to try the full product.

---

## 8. Configuring MongoDB (optional but recommended for persistence)

**Option A — Local MongoDB:**
```bash
MONGODB_URI=mongodb://127.0.0.1:27017/preppilot
```

**Option B — MongoDB Atlas (recommended for deployment):**
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow network access from your IP (or `0.0.0.0/0` for simple deployments)
3. Copy the connection string into `server/.env`:
```bash
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/preppilot
```

If `MONGODB_URI` is left empty, PrepPilot automatically uses an in-memory
store — the app still works fully, but data is lost on server restart.

---

## 9. Configuring the AI (optional — Demo Mode works without it)

1. Get an API key from https://platform.openai.com
2. Add it to `server/.env`:
```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```
3. Restart the backend. The startup log will show `AI mode: LIVE (OpenAI)`.

If the OpenAI API fails mid-interview (rate limit, network error, malformed
response) PrepPilot automatically falls back to the demo question bank and
scoring for that request, rather than showing a broken screen.

---

## 10. How voice works

- **Text-to-speech:** the browser's built-in `speechSynthesis` API reads each
  question aloud when it appears. No API key or network call is needed.
- **Speech-to-text:** the browser's `SpeechRecognition` API (Chrome/Edge) 
  transcribes the candidate's answer live while the mic is active. The
  transcript is editable before submitting.
- If the browser doesn't support these APIs (e.g. Firefox/Safari have
  limited support), PrepPilot automatically shows a "Type instead" option so
  the interview still works end-to-end.
- Microphone permission denial is caught and shown as a friendly inline
  message rather than a crash.

---

## 11. How the AI interviewer works

`server/services/aiService.js` is the interview engine:

- `generateNextQuestion(...)` builds a system prompt containing the
  candidate's role, experience, interview type, resume highlights, full
  question/answer/score history, and target difficulty, then asks the model
  for exactly one next question as strict JSON. In Demo Mode it instead pulls
  from curated per-role/per-topic question banks, avoiding repeats.
- `evaluateAnswer(...)` scores a transcribed answer across four dimensions
  and returns structured feedback (strengths, weaknesses, a model answer, and
  a hint for the next question's direction) — again as strict JSON, with a
  demo-mode fallback that scores based on answer length/specificity.
- `nextDifficulty(...)` moves difficulty up after a strong answer (≥80) and
  down after a weak one (<50), otherwise holds steady.
- `buildFinalReport(...)` aggregates all per-question evaluations into the
  final score, per-metric averages, top recurring strengths/weaknesses, and a
  ranked list of topics to practice (the lowest-scoring topics).

All AI responses are parsed defensively — malformed JSON from the model
never crashes a request; it falls back to demo content instead.

---

## 12. How the avatar works

`client/src/components/Avatar.jsx` is a hand-built SVG face (not an image or
emoji) with five visible states driven by the interview state machine:

- **idle** — neutral, waiting
- **thinking** — animated dots while the AI is composing a question (rare in
  demo mode, common right after an answer while the next question loads)
- **speaking** — mouth animates, glow pulses, while text-to-speech reads the
  question
- **listening** — a small waveform animates while the mic is active
- **processing** — shown while an answer is being evaluated

---

## 13. API design

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/health` | Server + AI mode status |
| `POST` | `/api/interview/resume` | Parse a pasted or uploaded (PDF) resume |
| `POST` | `/api/interview/start` | Start a new interview, get question 1 |
| `POST` | `/api/interview/:id/answer` | Submit an answer, get evaluation + next question or final report |
| `GET` | `/api/interview/:id` | Fetch a full interview (used by the results page) |
| `POST` | `/api/interview/:id/abandon` | Mark an interview abandoned (exit mid-session) |
| `GET` | `/api/interviews` | List a guest's interview history |
| `POST` | `/api/practice/weak-area` | Start a focused 3-question practice session on a topic |
| `POST` | `/api/analytics/event` | Log a product analytics event |
| `GET` | `/api/analytics/summary` | Aggregate usage metrics |

All interview routes are scoped to the requester via an `x-guest-id` header
(a random ID generated client-side on first visit and stored in
`localStorage`) — there's no account system, by design, so the core flow
never depends on signing up.

---

## 14. Building for production

```bash
cd client
npm run build      # outputs client/dist
```

```bash
cd server
npm start           # runs the same server, just without --watch
```

---

## 15. Deployment

**Frontend → Vercel**
1. Push this repo to GitHub.
2. Import the repo in Vercel, set the project root to `client/`.
3. Framework preset: Vite. Build command: `npm run build`. Output dir: `dist`.
4. Add environment variable `VITE_API_URL` pointing to your deployed backend, e.g. `https://your-backend.onrender.com/api`.

**Backend → Render (or Railway)**
1. Create a new Web Service from the same repo, root directory `server/`.
2. Build command: `npm install`. Start command: `npm start`.
3. Add environment variables: `MONGODB_URI`, `OPENAI_API_KEY` (optional),
   `OPENAI_MODEL`, `CLIENT_ORIGIN` (set to your deployed Vercel URL), `NODE_ENV=production`.

**Database → MongoDB Atlas**
- See section 8 above. Use the Atlas connection string as `MONGODB_URI` on Render/Railway.

No localhost URLs are hardcoded anywhere in the frontend — the API base URL
is always read from `VITE_API_URL`, so this works unmodified in production.

---

## 16. Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend shows "Can't reach the PrepPilot server" | Backend isn't running, or `VITE_API_URL` is wrong. Check the backend terminal and `client/.env`. |
| CORS error in browser console | Add your frontend's exact origin to `CLIENT_ORIGIN` in `server/.env` and restart the backend. |
| Mic button does nothing / says unsupported | Use Chrome or Edge — Safari/Firefox have limited `SpeechRecognition` support. Use "Type instead" as a fallback. |
| PDF resume fails to parse | Try "Paste text" instead — some scanned/image-only PDFs have no extractable text. |
| Server logs `AI mode: DEMO` even though I set a key | Make sure `OPENAI_API_KEY` is in `server/.env` (not `.env.example`) and restart the server — env vars are only read at startup. |
| Data disappears after restarting the server | You're running without `MONGODB_URI` (in-memory fallback). Configure MongoDB per section 8 for persistence. |
| `429` / "Too many requests" | The built-in rate limiter allows 60 requests/minute per IP. Wait a moment and retry. |

---

## 17. How this satisfies the AI Avatar Product assignment

- **Working MVP where an AI avatar is a meaningful part of the experience:**
  the avatar isn't decorative — it visibly drives the interaction (speaking
  the question, showing it's listening, showing it's evaluating), and the
  voice loop is the primary input method, not an add-on to a text chatbot.
- **A real user problem:** final-year students and fresh graduates facing
  placement season lack a way to rehearse spoken technical/HR interviews with
  adaptive difficulty and resume-specific questions before the real thing.
- **A focused product:** scoped deliberately to placement-style software
  interviews (5 roles, 3 interview types) rather than trying to cover every
  profession.
- **Product judgment & speed:** Demo Mode and the in-memory data fallback
  mean the product is always fully demoable, with zero setup risk, while
  still supporting a real AI/DB configuration for production use.
- **Traction/usage metrics:** `/api/analytics/summary` and the History page's
  "Product traction" panel report real counts from actual usage — interviews
  started/completed, unique users, repeat practice, average score — with an
  honest empty state rather than fabricated numbers.

---

## 18. How to demonstrate PrepPilot in a 3-minute interview

1. **(0:00–0:20) Landing page** — show the hero, the avatar, and the "Why an
   AI avatar" section. One line: "This is built to feel like a real
   interviewer, not a chatbot."
2. **(0:20–0:50) Setup** — pick "Frontend Developer" → "Technical" →
   "Fresher", paste a short resume snippet ("Built an e-commerce site using
   React and Node.js"), click Begin Interview.
3. **(0:50–1:50) Interview** — let the avatar speak the first question, click
   "Answer with Voice", give a short spoken answer, submit, and show the
   instant score + feedback. Do this for 2 questions, pointing out that the
   second question referenced the resume.
4. **(1:50–2:30) Results** — jump to a pre-completed interview's results page
   (or finish the short interview quickly) to show the score ring, metric
   breakdown, strengths/weaknesses, and click "Practice [weak topic]" to show
   the adaptive mini-session starting.
5. **(2:30–3:00) History + traction** — show the History dashboard with score
   progress over sessions, and the live "Product traction" analytics panel at
   the bottom, noting it's real event data, not mocked numbers.

---

Built as a complete, runnable MVP — every route, page, and fallback path
listed above was implemented and exercised end-to-end during development,
not left as a stub.
