import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const isAIAvailable = Boolean(apiKey);

const client = isAIAvailable ? new OpenAI({ apiKey }) : null;

/* --------------------------------------------------------------------- */
/* Demo-mode question banks - used automatically when no API key is set  */
/* --------------------------------------------------------------------- */

const DEMO_BANK = {
  "Frontend Developer": [
    { q: "What is the difference between the Virtual DOM and the real DOM?", topic: "React", difficulty: "easy" },
    { q: "Explain the difference between useState and useEffect in React.", topic: "React", difficulty: "easy" },
    { q: "How would you optimize unnecessary re-renders in a large React application?", topic: "React performance", difficulty: "medium" },
    { q: "What are JavaScript closures, and can you describe a practical use case?", topic: "JavaScript closures", difficulty: "medium" },
    { q: "How does the browser event loop work, and how does it affect async code?", topic: "JavaScript internals", difficulty: "hard" },
    { q: "How would you structure CSS in a large-scale application to keep it maintainable?", topic: "CSS architecture", difficulty: "medium" },
    { q: "What strategies would you use to improve the loading performance of a web app?", topic: "Web performance", difficulty: "hard" },
    { q: "How do you handle accessibility (a11y) in your frontend projects?", topic: "Accessibility", difficulty: "medium" },
  ],
  "Backend Developer": [
    { q: "What is the difference between REST and GraphQL APIs?", topic: "REST APIs", difficulty: "easy" },
    { q: "How would you design a database schema for an e-commerce order system?", topic: "Database design", difficulty: "medium" },
    { q: "Explain how indexing improves database query performance.", topic: "Databases", difficulty: "medium" },
    { q: "How would you handle authentication and authorization in a Node.js API?", topic: "Authentication", difficulty: "medium" },
    { q: "What is the N+1 query problem and how would you avoid it?", topic: "Database optimization", difficulty: "hard" },
    { q: "How would you design a system to handle 10,000 concurrent requests?", topic: "System design", difficulty: "hard" },
    { q: "Explain the difference between SQL and NoSQL databases, with use cases.", topic: "Databases", difficulty: "easy" },
    { q: "How do you handle error handling and logging in a production backend service?", topic: "Reliability", difficulty: "medium" },
  ],
  "Full Stack Developer": [
    { q: "Walk me through how data flows from your database to the UI in a typical MERN app.", topic: "Full stack architecture", difficulty: "easy" },
    { q: "How did you manage state in a project where the frontend needed real-time data?", topic: "State management", difficulty: "medium" },
    { q: "How would you structure your database schema for a project like this?", topic: "Database design", difficulty: "medium" },
    { q: "How do you secure API endpoints in a full-stack application?", topic: "Security", difficulty: "medium" },
    { q: "Describe how you would deploy a full-stack MERN app to production.", topic: "Deployment", difficulty: "medium" },
    { q: "How would you scale a full-stack application as user traffic grows?", topic: "System design", difficulty: "hard" },
    { q: "What is the difference between server-side rendering and client-side rendering?", topic: "Rendering strategies", difficulty: "medium" },
    { q: "How do you handle version control and collaboration in a team project?", topic: "Workflow", difficulty: "easy" },
  ],
  "Java Developer": [
    { q: "What is the difference between an abstract class and an interface in Java?", topic: "OOP fundamentals", difficulty: "easy" },
    { q: "Explain how garbage collection works in the JVM.", topic: "JVM internals", difficulty: "medium" },
    { q: "What is the difference between == and .equals() in Java?", topic: "Java fundamentals", difficulty: "easy" },
    { q: "How does Spring Boot simplify dependency injection?", topic: "Spring Boot", difficulty: "medium" },
    { q: "Explain checked vs unchecked exceptions and when you'd use each.", topic: "Exception handling", difficulty: "medium" },
    { q: "How would you design a thread-safe singleton class in Java?", topic: "Concurrency", difficulty: "hard" },
    { q: "What are Java Streams and how do they improve collection processing?", topic: "Java 8+", difficulty: "medium" },
    { q: "How would you handle a memory leak in a long-running Java application?", topic: "Performance", difficulty: "hard" },
  ],
  "Software Developer": [
    { q: "Tell me about a project you're proud of. What was your role?", topic: "Project experience", difficulty: "easy" },
    { q: "What is the time and space complexity of binary search, and why?", topic: "Data structures & algorithms", difficulty: "easy" },
    { q: "How would you detect a cycle in a linked list?", topic: "Data structures & algorithms", difficulty: "medium" },
    { q: "Explain the difference between a stack and a queue with a real-world example.", topic: "Data structures", difficulty: "easy" },
    { q: "How would you approach debugging a production issue you've never seen before?", topic: "Problem solving", difficulty: "medium" },
    { q: "Describe the SOLID principles and why they matter in software design.", topic: "Software design", difficulty: "medium" },
    { q: "How would you design a URL shortening service like bit.ly?", topic: "System design", difficulty: "hard" },
    { q: "How do you approach writing unit tests for your code?", topic: "Testing", difficulty: "medium" },
  ],
};

const HR_BANK = [
  { q: "Tell me about yourself and why you're interested in this role.", topic: "Introduction", difficulty: "easy" },
  { q: "Describe a time you faced a conflict in a team project. How did you resolve it?", topic: "Teamwork", difficulty: "medium" },
  { q: "Where do you see yourself in the next 3-5 years?", topic: "Career goals", difficulty: "easy" },
  { q: "Tell me about a time you failed at something. What did you learn?", topic: "Self-awareness", difficulty: "medium" },
  { q: "Why should we hire you over other candidates?", topic: "Self-pitch", difficulty: "medium" },
  { q: "How do you handle tight deadlines and pressure?", topic: "Stress management", difficulty: "medium" },
  { q: "Describe a situation where you had to learn something new quickly.", topic: "Adaptability", difficulty: "easy" },
  { q: "Do you have any questions for us?", topic: "Closing", difficulty: "easy" },
];

function getDemoBank(role, interviewType) {
  const roleBank = DEMO_BANK[role] || DEMO_BANK["Software Developer"];
  if (interviewType === "HR") return HR_BANK;
  if (interviewType === "Mixed") {
    const merged = [];
    for (let i = 0; i < 6; i++) merged.push(roleBank[i % roleBank.length]);
    merged.splice(3, 0, HR_BANK[0]);
    merged.push(HR_BANK[1]);
    return merged;
  }
  return roleBank;
}

/* --------------------------------------------------------------------- */
/* Resume parsing helper (very lightweight keyword extraction)           */
/* --------------------------------------------------------------------- */

export function extractResumeHighlights(resumeText) {
  if (!resumeText) return [];
  const techKeywords = [
    "React", "Node.js", "Node", "Express", "MongoDB", "SQL", "MySQL", "PostgreSQL",
    "Java", "Spring Boot", "Spring", "Python", "Django", "Flask", "AWS", "Docker",
    "Kubernetes", "TypeScript", "JavaScript", "Redux", "GraphQL", "REST", "Microservices",
    "Next.js", "Vue", "Angular", "C++", "Machine Learning", "Git", "CI/CD", "Firebase",
    "Tailwind", "HTML", "CSS", "Kafka", "Redis", "DevOps",
  ];
  const found = new Set();
  for (const kw of techKeywords) {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(resumeText)) found.add(kw);
  }

  const sentences = resumeText.split(/[\n.]/).map((s) => s.trim()).filter(Boolean);
  const projectLines = sentences
    .filter((s) => /\b(built|developed|created|designed|implemented)\b/i.test(s))
    .slice(0, 4);

  return {
    technologies: Array.from(found).slice(0, 12),
    projectLines,
  };
}

/* --------------------------------------------------------------------- */
/* Public engine functions                                               */
/* --------------------------------------------------------------------- */

export async function generateNextQuestion({
  role,
  interviewType,
  experience,
  resumeHighlights,
  previousQuestions,
  currentDifficulty,
  questionNumber,
  totalQuestions,
  isFocusedPractice,
  focusTopic,
}) {
  if (!isAIAvailable) {
    return generateDemoQuestion({
      role,
      interviewType,
      previousQuestions,
      currentDifficulty,
      questionNumber,
      isFocusedPractice,
      focusTopic,
    });
  }

  try {
    const systemPrompt = buildInterviewerSystemPrompt({
      role,
      interviewType,
      experience,
      resumeHighlights,
      isFocusedPractice,
      focusTopic,
    });

    const historyText = previousQuestions
      .map(
        (pq, i) =>
          `Q${i + 1} (${pq.difficulty}): ${pq.question}\nCandidate answer: ${pq.answer || "(none)"}\nScore: ${
            pq.evaluation?.overallScore ?? "n/a"
          }`
      )
      .join("\n\n");

    const userPrompt = `
Interview so far:
${historyText || "(This is the first question.)"}

Current difficulty level to target: ${currentDifficulty}
This will be question number ${questionNumber} of ${totalQuestions}.

Generate the next single interview question now. Respond ONLY with strict JSON:
{
  "question": "string - the interview question, natural and conversational",
  "topic": "string - short topic label e.g. 'React performance'",
  "difficulty": "easy" | "medium" | "hard"
}
No markdown, no backticks, no extra text.`;

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const raw = completion.choices[0].message.content.trim();
    const parsed = safeParseJSON(raw);
    if (!parsed || !parsed.question) throw new Error("Malformed AI question response");

    return {
      question: parsed.question,
      topic: parsed.topic || "General",
      difficulty: ["easy", "medium", "hard"].includes(parsed.difficulty)
        ? parsed.difficulty
        : currentDifficulty,
    };
  } catch (err) {
    console.error("[AI] generateNextQuestion failed, falling back to demo bank:", err.message);
    return generateDemoQuestion({
      role,
      interviewType,
      previousQuestions,
      currentDifficulty,
      questionNumber,
      isFocusedPractice,
      focusTopic,
    });
  }
}

function generateDemoQuestion({
  role,
  interviewType,
  previousQuestions,
  currentDifficulty,
  questionNumber,
  isFocusedPractice,
  focusTopic,
}) {
  let bank;
  if (isFocusedPractice && focusTopic) {
    bank = Object.values(DEMO_BANK)
      .flat()
      .filter((item) => item.topic.toLowerCase().includes(focusTopic.toLowerCase()));
    if (bank.length === 0) bank = getDemoBank(role, "Technical");
  } else {
    bank = getDemoBank(role, interviewType);
  }

  const askedQuestions = new Set(previousQuestions.map((p) => p.question));
  const remaining = bank.filter((item) => !askedQuestions.has(item.q));
  const pool = remaining.length > 0 ? remaining : bank;

  const byDifficulty = pool.filter((item) => item.difficulty === currentDifficulty);
  const chosen = (byDifficulty.length > 0 ? byDifficulty : pool)[
    questionNumber % (byDifficulty.length > 0 ? byDifficulty.length : pool.length)
  ];

  return {
    question: chosen.q,
    topic: chosen.topic,
    difficulty: chosen.difficulty,
  };
}

/**
 * Evaluate a candidate's answer.
 */
export async function evaluateAnswer({
  role,
  question,
  topic,
  difficulty,
  answer,
  experience,
}) {
  if (!answer || answer.trim().length < 2) {
    return buildFallbackEvaluation({ tooShort: true });
  }

  if (!isAIAvailable) {
    return generateDemoEvaluation({ question, answer, difficulty });
  }

  try {
    const systemPrompt = `You are an expert technical interviewer evaluating a candidate's spoken interview answer (transcribed from speech, so minor grammar issues are normal and should not be penalized). Be fair, encouraging but honest, and specific. Candidate is applying for a ${role} role at ${experience} level.`;

    const userPrompt = `
Question asked (topic: ${topic}, difficulty: ${difficulty}):
"${question}"

Candidate's answer (transcribed from speech):
"${answer}"

Evaluate this answer. Respond ONLY with strict JSON in this exact shape:
{
  "overallScore": number (0-100),
  "technicalScore": number (0-100),
  "communicationScore": number (0-100),
  "relevanceScore": number (0-100),
  "confidenceScore": number (0-100),
  "strengths": ["short strength", "short strength"],
  "weaknesses": ["short weakness", "short weakness"],
  "feedback": "2-3 sentence constructive feedback, speak directly to the candidate",
  "betterAnswer": "a concise 2-4 sentence example of a strong answer",
  "nextQuestionDirection": "short note on what the next question should probe, e.g. 'go deeper on the weak area' or 'move to a new topic'"
}
No markdown, no backticks, no extra text.`;

    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: 500,
    });

    const raw = completion.choices[0].message.content.trim();
    const parsed = safeParseJSON(raw);
    if (!parsed || typeof parsed.overallScore !== "number") {
      throw new Error("Malformed AI evaluation response");
    }
    return normalizeEvaluation(parsed);
  } catch (err) {
    console.error("[AI] evaluateAnswer failed, falling back to demo evaluation:", err.message);
    return generateDemoEvaluation({ question, answer, difficulty });
  }
}

function generateDemoEvaluation({ question, answer, difficulty }) {
  const trimmed = answer.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  const stopWords = new Set(["the","a","an","is","are","was","were","how","what","why","would","you","your","to","of","in","on","and","or","with","for","this","that","it"]);
  const questionKeywords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stopWords.has(w));

  const answerLower = trimmed.toLowerCase();
  const keywordHits = questionKeywords.filter((kw) => answerLower.includes(kw)).length;
  const keywordRatio = questionKeywords.length > 0 ? keywordHits / questionKeywords.length : 0;

  const repetitionRatio = words.length > 0 ? uniqueWords.size / words.length : 0;
  const isVeryShort = words.length < 8;
  const isLowEffort = repetitionRatio < 0.4 || (words.length > 0 && uniqueWords.size < 5);

  const hasExample = /\b(example|for instance|i used|i built|project)\b/i.test(trimmed);

  let base;
  if (isVeryShort) {
    base = 15 + keywordRatio * 15;
  } else if (isLowEffort) {
    base = 10;
  } else {
    const lengthScore = Math.min(100, Math.round((words.length / 60) * 100));
    base = lengthScore * 0.35 + keywordRatio * 45 + (hasExample ? 10 : 0);
  }

  const overall = Math.max(0, Math.min(95, Math.round(base)));
  const jitter = () => Math.max(0, Math.min(100, Math.round(overall + (Math.random() * 8 - 4))));

  return normalizeEvaluation({
    overallScore: overall,
    technicalScore: jitter(),
    communicationScore: jitter(),
    relevanceScore: Math.max(0, Math.min(100, Math.round(keywordRatio * 100))),
    confidenceScore: jitter(),
    strengths:
      overall >= 60
        ? [hasExample ? "Backed the answer with a concrete example" : "Addressed the core of the question", "Used relevant terminology"]
        : [],
    weaknesses:
      overall < 60
        ? [isVeryShort ? "Answer was too brief to demonstrate understanding" : "Answer didn't clearly address the question's key concepts", "Consider structuring with a definition, reasoning, then example"]
        : ["Consider quantifying impact or results where possible"],
    feedback:
      overall >= 70
        ? "Solid answer overall - you covered the core idea clearly. Adding a specific example or metric would make it even stronger."
        : overall >= 40
        ? "This touches on the topic but lacks depth or specific detail relevant to the question. Try explaining the 'why' behind your answer, not just a general statement."
        : "This answer doesn't demonstrate understanding of the topic being asked. Try to directly address the specific concept in the question with a clear explanation.",
    betterAnswer:
      "A strong answer would briefly define the concept, explain the reasoning or trade-offs, and close with a real example from a project you've worked on.",
    nextQuestionDirection:
      overall >= 70 ? "increase difficulty slightly" : "reinforce this topic with a related follow-up",
    _demo: true,
    _difficulty: difficulty,
  });
}

function buildFallbackEvaluation({ tooShort }) {
  return normalizeEvaluation({
    overallScore: 20,
    technicalScore: 20,
    communicationScore: 20,
    relevanceScore: 20,
    confidenceScore: 20,
    strengths: [],
    weaknesses: ["Answer was too short to evaluate meaningfully"],
    feedback: tooShort
      ? "It looks like your answer was very short or empty. Try to explain your reasoning in a few full sentences."
      : "Unable to evaluate this answer.",
    betterAnswer: "Try restating the question in your own words, then explain your approach step by step.",
    nextQuestionDirection: "repeat a similar-difficulty question",
  });
}

function normalizeEvaluation(evaln) {
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  return {
    overallScore: clamp(evaln.overallScore),
    technicalScore: clamp(evaln.technicalScore ?? evaln.overallScore),
    communicationScore: clamp(evaln.communicationScore ?? evaln.overallScore),
    relevanceScore: clamp(evaln.relevanceScore ?? evaln.overallScore),
    confidenceScore: clamp(evaln.confidenceScore ?? evaln.overallScore),
    strengths: Array.isArray(evaln.strengths) ? evaln.strengths.slice(0, 4) : [],
    weaknesses: Array.isArray(evaln.weaknesses) ? evaln.weaknesses.slice(0, 4) : [],
    feedback: evaln.feedback || "",
    betterAnswer: evaln.betterAnswer || "",
    nextQuestionDirection: evaln.nextQuestionDirection || "",
  };
}

function buildInterviewerSystemPrompt({
  role,
  interviewType,
  experience,
  resumeHighlights,
  isFocusedPractice,
  focusTopic,
}) {
  const techList = resumeHighlights?.technologies?.length
    ? resumeHighlights.technologies.join(", ")
    : "not specified";
  const projectLines = resumeHighlights?.projectLines?.length
    ? resumeHighlights.projectLines.join(" | ")
    : "not specified";

  return `You are PrepPilot, a professional, encouraging but rigorous AI interviewer conducting a ${interviewType} interview for a ${role} position with a candidate at ${experience} experience level.

Candidate resume signals:
- Technologies mentioned: ${techList}
- Project highlights: ${projectLines}

Rules:
- Ask exactly ONE question at a time, naturally phrased like a real interviewer.
- Never repeat a question already asked.
- When resume information is relevant, reference it naturally (e.g. "You mentioned building X using Y, ...").
- Gradually adapt difficulty based on how well the candidate has performed so far.
- Keep questions concise - no long preambles.
- Do not reveal scoring or internal evaluation logic in the question text.
${isFocusedPractice ? `- This is a focused practice session on the weak topic: "${focusTopic}". All questions should target this topic specifically.` : ""}`;
}

function safeParseJSON(text) {
  try {
    const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Adapts difficulty based on the last evaluation.
 */
export function nextDifficulty(currentDifficulty, lastScore) {
  const order = ["easy", "medium", "hard"];
  let idx = order.indexOf(currentDifficulty);
  if (idx === -1) idx = 0;

  if (lastScore == null) return currentDifficulty;
  if (lastScore >= 80) idx = Math.min(order.length - 1, idx + 1);
  else if (lastScore < 50) idx = Math.max(0, idx - 1);
  return order[idx];
}

/**
 * Build the final performance report from a completed interview's questions.
 */
export function buildFinalReport(questions) {
  const evaluated = questions.filter((q) => q.evaluation);
  if (evaluated.length === 0) {
    return {
      overallScore: 0,
      metrics: { technical: 0, communication: 0, relevance: 0, confidence: 0, clarity: 0 },
      strengths: [],
      weaknesses: [],
      practiceTopics: [],
    };
  }

  const avg = (key) =>
    Math.round(
      evaluated.reduce((sum, q) => sum + (q.evaluation[key] || 0), 0) / evaluated.length
    );

  const overallScore = avg("overallScore");
  const technical = avg("technicalScore");
  const communication = avg("communicationScore");
  const relevance = avg("relevanceScore");
  const confidence = avg("confidenceScore");
  const clarity = Math.round((communication + relevance) / 2);

  const strengthCounts = {};
  const weaknessCounts = {};
  for (const q of evaluated) {
    for (const s of q.evaluation.strengths || []) {
      strengthCounts[s] = (strengthCounts[s] || 0) + 1;
    }
    for (const w of q.evaluation.weaknesses || []) {
      weaknessCounts[w] = (weaknessCounts[w] || 0) + 1;
    }
  }

  const topStrengths = Object.entries(strengthCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([s]) => s);

  const topWeaknesses = Object.entries(weaknessCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([w]) => w);

  const practiceTopics = Array.from(
    new Set(
      evaluated
        .filter((q) => (q.evaluation.overallScore || 0) < 65)
        .sort((a, b) => a.evaluation.overallScore - b.evaluation.overallScore)
        .map((q) => q.topic)
        .filter(Boolean)
    )
  ).slice(0, 5);

  return {
    overallScore,
    metrics: { technical, communication, relevance, confidence, clarity },
    strengths: topStrengths,
    weaknesses: topWeaknesses,
    practiceTopics: practiceTopics.length > 0 ? practiceTopics : ["General interview fluency"],
  };
}