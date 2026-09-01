import mongoose from "mongoose";

const AnalyticsEventSchema = new mongoose.Schema(
  {
    event: { type: String, required: true, index: true },
    guestId: { type: String, default: null },
    interviewId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.AnalyticsEvent ||
  mongoose.model("AnalyticsEvent", AnalyticsEventSchema);
