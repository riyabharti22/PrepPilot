import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Loader2, ArrowRight, X } from "lucide-react";
import { api } from "../services/api.js";
import { ErrorBanner } from "../components/Feedback.jsx";

const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Java Developer", "Software Developer"];
const TYPES = ["Technical", "HR", "Mixed"];
const EXPERIENCE = ["Fresher", "0-1 years", "1-3 years"];
const DIFFICULTIES = ["Easy", "Medium", "Hard", "Adaptive"];

export default function SetupPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [role, setRole] = useState(ROLES[0]);
  const [interviewType, setInterviewType] = useState("Technical");
  const [experience, setExperience] = useState("Fresher");
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [resumeText, setResumeText] = useState("");
  const [resumeMode, setResumeMode] = useState("paste"); // "paste" | "upload"
  const [fileName, setFileName] = useState("");
  const [parsingResume, setParsingResume] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.logEvent("setup_started");
  }, []);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("That file is too large. Please upload a resume under 5MB.");
      return;
    }

    setFileName(file.name);
    setParsingResume(true);
    setError(null);
    try {
      const result = await api.parseResumeFile(file);
      setResumeText(result.resumeText);
    } catch (err) {
      setError(err.message || "We couldn't read that file. Try pasting your resume text instead.");
      setResumeMode("paste");
      setFileName("");
    } finally {
      setParsingResume(false);
    }
  }

  function clearResume() {
    setResumeText("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      const result = await api.startInterview({
        role,
        interviewType,
        experience,
        difficultyPreference: difficulty,
        resumeText,
      });
      navigate(`/interview/${result.interviewId}`, {
        state: { firstQuestion: result.question, totalQuestions: result.totalQuestions, mode: result.mode },
      });
    } catch (err) {
      setError(err.message || "Something went wrong while preparing your interview. Please try again.");
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-10">
        <span className="label-pill">Interview setup</span>
        <h1 className="mt-4 font-display text-3xl font-bold text-navy-900">
          Let's set up your mock interview
        </h1>
        <p className="mt-2 text-navy-700/65">
          A couple of quick choices, then we'll bring in your resume to personalize the questions.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      <div className="space-y-8">
        <Field label="Target role">
          <PillGroup options={ROLES} value={role} onChange={setRole} />
        </Field>

        <Field label="Interview type">
          <PillGroup options={TYPES} value={interviewType} onChange={setInterviewType} />
        </Field>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Field label="Experience level">
            <PillGroup options={EXPERIENCE} value={experience} onChange={setExperience} />
          </Field>
          <Field label="Difficulty">
            <PillGroup options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
          </Field>
        </div>

        <Field label="Resume (optional, but recommended)">
          <div className="mb-3 flex gap-2">
            <ModeTab active={resumeMode === "paste"} onClick={() => setResumeMode("paste")}>
              Paste text
            </ModeTab>
            <ModeTab active={resumeMode === "upload"} onClick={() => setResumeMode("upload")}>
              Upload PDF
            </ModeTab>
          </div>

          {resumeMode === "paste" ? (
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here - e.g. 'Built an e-commerce website using React and Node.js...'"
              rows={6}
              className="w-full resize-none rounded-xl border border-navy-700/15 bg-white px-4 py-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-lavender-400"
            />
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {!fileName ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-navy-700/20 px-6 py-10 text-navy-700/60 transition-colors hover:border-lavender-400 hover:text-lavender-600"
                >
                  <Upload size={24} />
                  <span className="text-sm font-medium">Click to upload your resume (PDF, up to 5MB)</span>
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-navy-700/15 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-navy-900">
                    <FileText size={16} className="text-lavender-600" />
                    {fileName}
                    {parsingResume && <Loader2 size={14} className="animate-spin text-navy-700/50" />}
                  </span>
                  <button onClick={clearResume} className="text-navy-700/40 hover:text-rose-500">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
          <p className="mt-2 text-xs text-navy-700/45">
            PrepPilot uses this to ask about the specific technologies and projects you mention.
          </p>
        </Field>
      </div>

      <button
        onClick={handleStart}
        disabled={starting || parsingResume}
        className="btn-primary mt-10 w-full sm:w-auto"
      >
        {starting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Preparing your interview…
          </>
        ) : (
          <>
            Begin Interview
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-navy-900">{label}</label>
      {children}
    </div>
  );
}

function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            value === opt
              ? "border-lavender-500 bg-lavender-500 text-white"
              : "border-navy-700/15 bg-white text-navy-700 hover:border-lavender-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ModeTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
        active ? "bg-navy-950 text-white" : "bg-mist-100 text-navy-700/60 hover:text-navy-900"
      }`}
    >
      {children}
    </button>
  );
}
