import { InterviewStore, AnalyticsStore } from "../utils/store.js";
import { extractTextFromFile } from "../services/resumeService.js";
import {
  isAIAvailable,
  extractResumeHighlights,
  generateNextQuestion,
  evaluateAnswer,
  nextDifficulty,
  buildFinalReport,
} from "../services/aiService.js";

const TOTAL_QUESTIONS = 7;
const PRACTICE_QUESTIONS = 3;

function getGuestId(req) {
  return req.headers["x-guest-id"] || req.body.guestId || req.query.guestId;
}

/** POST /api/interview/resume - parse uploaded/pasted resume text */
export async function parseResume(req, res) {
  try {
    let text = "";
    if (req.file) {
      text = await extractTextFromFile(req.file.buffer, req.file.mimetype);
    } else if (req.body.resumeText) {
      text = String(req.body.resumeText).slice(0, 8000);
    } else {
      return res.status(400).json({ error: "No resume file or text provided." });
    }

    const highlights = extractResumeHighlights(text);
    res.json({ resumeText: text, highlights });
  } catch (err) {
    console.error("[parseResume]", err.message);
    res.status(err.status || 500).json({
      error: err.status ? err.message : "Something went wrong while processing your resume.",
    });
  }
}

/** POST /api/interview/start */
export async function startInterview(req, res) {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ error: "Missing guest session." });

    const {
      role,
      interviewType,
      experience,
      difficultyPreference,
      resumeText,
    } = req.body;

    if (!role || !interviewType || !experience) {
      return res.status(400).json({ error: "role, interviewType, and experience are required." });
    }

    const highlights = extractResumeHighlights(resumeText || "");

    const startingDifficulty =
      difficultyPreference === "Easy"
        ? "easy"
        : difficultyPreference === "Hard"
        ? "hard"
        : "easy"; // Adaptive/Medium both start easy-to-medium and adjust

    const interview = await InterviewStore.create({
      guestId,
      role,
      interviewType,
      experience,
      difficultyPreference: difficultyPreference || "Adaptive",
      resumeText: resumeText || "",
      resumeHighlights: highlights.technologies || [],
      mode: isAIAvailable ? "ai" : "demo",
      status: "in_progress",
      questions: [],
      currentDifficulty: startingDifficulty,
    });

    const firstQuestion = await generateNextQuestion({
      role,
      interviewType,
      experience,
      resumeHighlights: highlights,
      previousQuestions: [],
      currentDifficulty: startingDifficulty,
      questionNumber: 1,
      totalQuestions: TOTAL_QUESTIONS,
    });

    const questionRecord = {
      index: 0,
      question: firstQuestion.question,
      topic: firstQuestion.topic,
      difficulty: firstQuestion.difficulty,
      answer: "",
      evaluation: null,
    };

    const updated = await InterviewStore.update(interview.id, {
      questions: [questionRecord],
    });

    await AnalyticsStore.log("interview_started", guestId, interview.id, {
      role,
      interviewType,
      mode: interview.mode,
    });

    res.json({
      interviewId: updated.id,
      mode: updated.mode,
      totalQuestions: TOTAL_QUESTIONS,
      question: questionRecord,
    });
  } catch (err) {
    console.error("[startInterview]", err);
    res.status(500).json({ error: "Something went wrong while preparing your interview. Please try again." });
  }
}

/** POST /api/interview/:id/answer */
export async function submitAnswer(req, res) {
  try {
    const { id } = req.params;
    const { answer } = req.body;
    const guestId = getGuestId(req);

    const interview = await InterviewStore.findById(id);
    if (!interview) return res.status(404).json({ error: "Interview not found." });
    if (interview.status !== "in_progress") {
      return res.status(400).json({ error: "This interview has already ended." });
    }

    const currentIdx = interview.questions.length - 1;
    const currentQ = interview.questions[currentIdx];
    if (!currentQ) return res.status(400).json({ error: "No active question found." });

    const evaluation = await evaluateAnswer({
      role: interview.role,
      question: currentQ.question,
      topic: currentQ.topic,
      difficulty: currentQ.difficulty,
      answer,
      experience: interview.experience,
    });

    const updatedQuestions = [...interview.questions];
    updatedQuestions[currentIdx] = {
      ...currentQ,
      answer,
      answeredAt: new Date(),
      evaluation,
    };

    const totalTarget = interview.isPracticeSession ? PRACTICE_QUESTIONS : TOTAL_QUESTIONS;
    const isLast = updatedQuestions.length >= totalTarget;

    let updates = { questions: updatedQuestions };
    let nextQuestionRecord = null;

    if (isLast) {
      const report = buildFinalReport(updatedQuestions);
      updates = {
        ...updates,
        status: "completed",
        completedAt: new Date(),
        overallScore: report.overallScore,
        metrics: report.metrics,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        practiceTopics: report.practiceTopics,
      };
    } else {
      const adaptedDifficulty =
        interview.difficultyPreference === "Adaptive" || interview.isPracticeSession
          ? nextDifficulty(currentQ.difficulty, evaluation.overallScore)
          : currentQ.difficulty;

      const highlights = extractResumeHighlights(interview.resumeText || "");

      const nextQ = await generateNextQuestion({
        role: interview.role,
        interviewType: interview.interviewType,
        experience: interview.experience,
        resumeHighlights: highlights,
        previousQuestions: updatedQuestions,
        currentDifficulty: adaptedDifficulty,
        questionNumber: updatedQuestions.length + 1,
        totalQuestions: totalTarget,
        isFocusedPractice: interview.isPracticeSession,
        focusTopic: interview.focusTopic,
      });

      nextQuestionRecord = {
        index: updatedQuestions.length,
        question: nextQ.question,
        topic: nextQ.topic,
        difficulty: nextQ.difficulty,
        answer: "",
        evaluation: null,
      };

      updates.questions = [...updatedQuestions, nextQuestionRecord];
      updates.currentDifficulty = adaptedDifficulty;
    }

    const updated = await InterviewStore.update(id, updates);

    await AnalyticsStore.log("question_answered", guestId, id, {
      questionIndex: currentIdx,
      score: evaluation.overallScore,
    });

    if (isLast) {
      await AnalyticsStore.log("interview_completed", guestId, id, {
        overallScore: updated.overallScore,
      });
    }

    res.json({
      evaluation,
      isComplete: isLast,
      nextQuestion: nextQuestionRecord,
      questionNumber: updatedQuestions.length,
      totalQuestions: totalTarget,
      report: isLast
        ? {
            overallScore: updated.overallScore,
            metrics: updated.metrics,
            strengths: updated.strengths,
            weaknesses: updated.weaknesses,
            practiceTopics: updated.practiceTopics,
          }
        : null,
    });
  } catch (err) {
    console.error("[submitAnswer]", err);
    res.status(500).json({ error: "Something went wrong while evaluating your answer. Please try again." });
  }
}

/** GET /api/interview/:id */
export async function getInterview(req, res) {
  try {
    const interview = await InterviewStore.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: "Interview not found." });
    res.json({ interview });
  } catch (err) {
    console.error("[getInterview]", err);
    res.status(500).json({ error: "Could not load interview." });
  }
}

/** POST /api/interview/:id/abandon */
export async function abandonInterview(req, res) {
  try {
    const interview = await InterviewStore.findById(req.params.id);
    if (!interview) return res.status(404).json({ error: "Interview not found." });
    if (interview.status === "in_progress") {
      await InterviewStore.update(req.params.id, { status: "abandoned" });
      await AnalyticsStore.log("interview_retried", getGuestId(req), req.params.id, {});
    }
    res.json({ ok: true });
  } catch (err) {
    console.error("[abandonInterview]", err);
    res.status(500).json({ error: "Could not update interview." });
  }
}

/** GET /api/interviews - history for current guest */
export async function listInterviews(req, res) {
  try {
    const guestId = getGuestId(req);
    if (!guestId) return res.status(400).json({ error: "Missing guest session." });
    const interviews = await InterviewStore.listByGuest(guestId);

    const history = interviews.map((i) => ({
      id: i.id,
      role: i.role,
      interviewType: i.interviewType,
      status: i.status,
      overallScore: i.overallScore,
      isPracticeSession: i.isPracticeSession,
      focusTopic: i.focusTopic,
      createdAt: i.createdAt,
      completedAt: i.completedAt,
    }));

    res.json({ interviews: history });
  } catch (err) {
    console.error("[listInterviews]", err);
    res.status(500).json({ error: "Could not load interview history." });
  }
}

/** POST /api/practice/weak-area */
export async function startWeakAreaPractice(req, res) {
  try {
    const guestId = getGuestId(req);
    const { parentInterviewId, topic } = req.body;

    if (!guestId || !parentInterviewId || !topic) {
      return res.status(400).json({ error: "parentInterviewId and topic are required." });
    }

    const parent = await InterviewStore.findById(parentInterviewId);
    if (!parent) return res.status(404).json({ error: "Original interview not found." });

    const highlights = extractResumeHighlights(parent.resumeText || "");

    const interview = await InterviewStore.create({
      guestId,
      role: parent.role,
      interviewType: parent.interviewType,
      experience: parent.experience,
      difficultyPreference: "Adaptive",
      resumeText: parent.resumeText,
      resumeHighlights: parent.resumeHighlights,
      mode: isAIAvailable ? "ai" : "demo",
      status: "in_progress",
      isPracticeSession: true,
      focusTopic: topic,
      parentInterview: parentInterviewId,
      questions: [],
      currentDifficulty: "medium",
    });

    const firstQuestion = await generateNextQuestion({
      role: parent.role,
      interviewType: parent.interviewType,
      experience: parent.experience,
      resumeHighlights: highlights,
      previousQuestions: [],
      currentDifficulty: "medium",
      questionNumber: 1,
      totalQuestions: PRACTICE_QUESTIONS,
      isFocusedPractice: true,
      focusTopic: topic,
    });

    const questionRecord = {
      index: 0,
      question: firstQuestion.question,
      topic: firstQuestion.topic,
      difficulty: firstQuestion.difficulty,
      answer: "",
      evaluation: null,
    };

    const updated = await InterviewStore.update(interview.id, { questions: [questionRecord] });

    await AnalyticsStore.log("weak_area_practice_started", guestId, interview.id, { topic });

    res.json({
      interviewId: updated.id,
      mode: updated.mode,
      totalQuestions: PRACTICE_QUESTIONS,
      question: questionRecord,
      focusTopic: topic,
    });
  } catch (err) {
    console.error("[startWeakAreaPractice]", err);
    res.status(500).json({ error: "Could not start the practice session. Please try again." });
  }
}
