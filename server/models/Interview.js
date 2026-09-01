import mongoose from "mongoose";

const EvaluationSchema = new mongoose.Schema(
  {
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    relevanceScore: Number,
    confidenceScore: Number,
    strengths: [String],
    weaknesses: [String],
    feedback: String,
    betterAnswer: String,
    nextQuestionDirection: String,
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    index: Number,
    question: String,
    topic: String,
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    answer: { type: String, default: "" },
    answeredAt: Date,
    evaluation: { type: EvaluationSchema, default: null },
  },
  { _id: false }
);

const InterviewSchema = new mongoose.Schema(
  {
    guestId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    interviewType: { type: String, enum: ["Technical", "HR", "Mixed"], required: true },
    experience: { type: String, required: true },
    difficultyPreference: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Adaptive"],
      default: "Adaptive",
    },
    resumeText: { type: String, default: "" },
    resumeHighlights: [String],
    mode: { type: String, enum: ["ai", "demo"], default: "demo" },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    isPracticeSession: { type: Boolean, default: false },
    focusTopic: { type: String, default: null },
    parentInterview: { type: mongoose.Schema.Types.ObjectId, ref: "Interview", default: null },
    questions: [QuestionSchema],
    currentDifficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    overallScore: { type: Number, default: null },
    metrics: {
      technical: Number,
      communication: Number,
      relevance: Number,
      confidence: Number,
      clarity: Number,
    },
    strengths: [String],
    weaknesses: [String],
    practiceTopics: [String],
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Interview || mongoose.model("Interview", InterviewSchema);
