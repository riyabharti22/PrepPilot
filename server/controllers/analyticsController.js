import { AnalyticsStore } from "../utils/store.js";

const ALLOWED_EVENTS = new Set([
  "landing_page_view",
  "interview_started",
  "question_answered",
  "interview_completed",
  "interview_retried",
  "weak_area_practice_started",
  "setup_started",
  "results_viewed",
]);

/** POST /api/analytics/event */
export async function logEvent(req, res) {
  try {
    const { event, interviewId, metadata } = req.body;
    const guestId = req.headers["x-guest-id"] || req.body.guestId;

    if (!event || !ALLOWED_EVENTS.has(event)) {
      return res.status(400).json({ error: "Unknown or missing event name." });
    }

    await AnalyticsStore.log(event, guestId || null, interviewId || null, metadata || {});
    res.json({ ok: true });
  } catch (err) {
    console.error("[logEvent]", err);
    // Analytics failures should never surface as user-facing errors.
    res.json({ ok: false });
  }
}

/** GET /api/analytics/summary */
export async function getSummary(req, res) {
  try {
    const summary = await AnalyticsStore.summary();
    res.json({ summary });
  } catch (err) {
    console.error("[getSummary]", err);
    res.status(500).json({ error: "Could not load analytics summary." });
  }
}
