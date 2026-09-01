import { v4 as uuid } from "uuid";
import { dbIsConnected } from "./db.js";
import Interview from "../models/Interview.js";
import AnalyticsEvent from "../models/AnalyticsEvent.js";

/**
 * PrepPilot works whether or not MongoDB is configured.
 * When MongoDB is connected, everything is persisted via Mongoose.
 * When it isn't, we transparently fall back to an in-memory store so the
 * product can still be demoed end-to-end (data resets on server restart).
 */

const memory = {
  interviews: new Map(),
  events: [],
};

function toPlain(doc) {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  obj.id = obj.id || obj._id?.toString() || obj._id;
  return obj;
}

export const InterviewStore = {
  async create(data) {
    if (dbIsConnected()) {
      const doc = await Interview.create(data);
      return toPlain(doc);
    }
    const id = uuid();
    const record = {
      _id: id,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    memory.interviews.set(id, record);
    return record;
  },

  async findById(id) {
    if (dbIsConnected()) {
      const doc = await Interview.findById(id);
      return toPlain(doc);
    }
    return memory.interviews.get(id) || null;
  },

  async update(id, updates) {
    if (dbIsConnected()) {
      const doc = await Interview.findByIdAndUpdate(id, updates, { new: true });
      return toPlain(doc);
    }
    const existing = memory.interviews.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: new Date() };
    memory.interviews.set(id, updated);
    return updated;
  },

  async listByGuest(guestId) {
    if (dbIsConnected()) {
      const docs = await Interview.find({ guestId }).sort({ createdAt: -1 });
      return docs.map(toPlain);
    }
    return Array.from(memory.interviews.values())
      .filter((i) => i.guestId === guestId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
};

export const AnalyticsStore = {
  async log(event, guestId, interviewId, metadata = {}) {
    try {
      if (dbIsConnected()) {
        await AnalyticsEvent.create({ event, guestId, interviewId, metadata });
      } else {
        memory.events.push({
          event,
          guestId,
          interviewId,
          metadata,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      // Analytics must never break the core product experience.
      console.error("[Analytics] Failed to log event:", event, err.message);
    }
  },

  async summary() {
    let events;
    if (dbIsConnected()) {
      events = await AnalyticsEvent.find({}).lean();
    } else {
      events = memory.events;
    }

    const counts = {};
    for (const e of events) {
      counts[e.event] = (counts[e.event] || 0) + 1;
    }

    const interviews = dbIsConnected()
      ? await Interview.find({}).lean()
      : Array.from(memory.interviews.values());

    const completed = interviews.filter((i) => i.status === "completed");
    const guestIds = new Set(interviews.map((i) => i.guestId));

    const avgScore =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completed.length
          )
        : null;

    const repeatUsers = Array.from(guestIds).filter(
      (g) => interviews.filter((i) => i.guestId === g).length > 1
    ).length;

    return {
      totalEvents: events.length,
      eventCounts: counts,
      interviewsStarted: interviews.length,
      interviewsCompleted: completed.length,
      uniqueUsers: guestIds.size,
      repeatUsers,
      averageScore: avgScore,
      practiceSessionsStarted: interviews.filter((i) => i.isPracticeSession).length,
    };
  },
};
