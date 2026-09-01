const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getGuestId() {
  let id = localStorage.getItem("preppilot_guest_id");
  if (!id) {
    id =
      "guest_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 10);
    localStorage.setItem("preppilot_guest_id", id);
  }
  return id;
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const headers = {
    "x-guest-id": getGuestId(),
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch (err) {
    throw new ApiError(
      "Can't reach the PrepPilot server. Please check your connection and try again.",
      0
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    throw new ApiError(
      data?.error || "Something went wrong. Please try again.",
      res.status
    );
  }

  return data;
}

export const api = {
  getGuestId,

  health: () => request("/health"),

  parseResumeFile: (file) => {
    const fd = new FormData();
    fd.append("resume", file);
    return request("/interview/resume", { method: "POST", body: fd });
  },

  parseResumeText: (resumeText) =>
    request("/interview/resume", {
      method: "POST",
      body: JSON.stringify({ resumeText }),
    }),

  startInterview: (payload) =>
    request("/interview/start", { method: "POST", body: JSON.stringify(payload) }),

  submitAnswer: (interviewId, answer) =>
    request(`/interview/${interviewId}/answer`, {
      method: "POST",
      body: JSON.stringify({ answer }),
    }),

  getInterview: (interviewId) => request(`/interview/${interviewId}`),

  abandonInterview: (interviewId) =>
    request(`/interview/${interviewId}/abandon`, { method: "POST" }),

  listInterviews: () => request("/interviews"),

  startWeakAreaPractice: (parentInterviewId, topic) =>
    request("/practice/weak-area", {
      method: "POST",
      body: JSON.stringify({ parentInterviewId, topic }),
    }),

  logEvent: (event, interviewId, metadata) =>
    request("/analytics/event", {
      method: "POST",
      body: JSON.stringify({ event, interviewId, metadata }),
    }).catch(() => {}),

  getAnalyticsSummary: () => request("/analytics/summary"),
};

export { ApiError };
