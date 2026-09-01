import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  FileText,
  Brain,
  BarChart3,
  Target,
  Sparkles,
  ArrowRight,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import Avatar from "../components/Avatar.jsx";
import { api } from "../services/api.js";

const FEATURES = [
  {
    icon: FileText,
    title: "Resume-Aware Questions",
    desc: "PrepPilot reads your resume and asks about the exact projects and technologies you've listed, not generic textbook questions.",
  },
  {
    icon: Mic,
    title: "Voice-Based Interviews",
    desc: "Answer out loud like a real interview. Your speech is transcribed live so you can focus on speaking, not typing.",
  },
  {
    icon: Brain,
    title: "Adaptive Follow-Ups",
    desc: "Struggle on a topic and the interviewer probes deeper. Answer well and the difficulty climbs - just like a real panel.",
  },
  {
    icon: Sparkles,
    title: "Instant AI Feedback",
    desc: "Every answer is scored on technical accuracy, communication, relevance, and confidence within seconds.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    desc: "A full breakdown of strengths and weaknesses after every session, with trends across your practice history.",
  },
  {
    icon: Target,
    title: "Personalized Practice",
    desc: "Jump straight into a focused mini-session on your weakest topic instead of repeating a whole interview.",
  },
];

const STEPS = [
  { title: "Pick your target role", desc: "Frontend, backend, full stack, Java, or general software - plus interview type and experience level." },
  { title: "Share your resume", desc: "Paste it or upload a PDF. PrepPilot pulls out your real projects and skills to personalize questions." },
  { title: "Talk through the interview", desc: "The AI avatar asks questions out loud, you answer with your mic, and difficulty adapts as you go." },
  { title: "Get your performance report", desc: "See your score, strengths, weaknesses, and a clear list of what to practice next." },
];

export default function LandingPage() {
  useEffect(() => {
    api.logEvent("landing_page_view");
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-950 bg-aurora text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div className="animate-fadeUp">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-lavender-200">
              <Sparkles size={14} />
              Your AI Interview Coach
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Practice interviews with an AI interviewer that actually adapts to you.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              Practice realistic technical and HR interviews, get instant feedback, and know
              exactly what to improve before your next interview.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/setup" className="btn-primary">
                Start Mock Interview
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn-dark">
                <PlayCircle size={18} />
                See How It Works
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-white/50">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-lavender-300" /> No signup required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-lavender-300" /> Works in demo mode</span>
            </div>
          </div>

          <div className="flex justify-center md:justify-end">
            <Avatar state="speaking" size="lg" shape="circle" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl font-bold text-navy-900">How it works</h2>
          <p className="mt-3 text-navy-700/70">
            Four steps from opening the app to knowing exactly what to work on.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-950 font-display text-lg font-bold text-lavender-300">
                {i + 1}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-700/65">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-mist-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold text-navy-900">Everything you need to walk in ready</h2>
            <p className="mt-3 text-navy-700/70">
              Built specifically for placement interviews - not a generic chatbot wrapper.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lavender-200/60 text-lavender-600">
                  <f.icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-700/65">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-950 bg-aurora py-20 text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
          <Avatar state="idle" size="sm" shape="circle" />
          <h2 className="mt-8 font-display text-3xl font-bold sm:text-4xl">
            Ready to practice before it counts?
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Start a mock interview in under a minute - no account needed.
          </p>
          <Link to="/setup" className="btn-primary mt-8">
            Start Mock Interview
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-navy-700/10 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-navy-700/50 sm:flex-row">
          <span>© {new Date().getFullYear()} PrepPilot. Built for placement season.</span>
          <span>Made for the AI Avatar Product assignment.</span>
        </div>
      </footer>
    </div>
  );
}