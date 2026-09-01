import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./utils/db.js";
import { isAIAvailable } from "./services/aiService.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});
app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiMode: isAIAvailable ? "ai" : "demo",
    time: new Date().toISOString(),
  });
});

app.use("/api", interviewRoutes);
app.use("/api", analyticsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 PrepPilot server running on http://localhost:${PORT}`);
    console.log(`   AI mode: ${isAIAvailable ? "LIVE (OpenAI)" : "DEMO (no OPENAI_API_KEY set)"}`);
  });
}

start();
