import express from "express";
import { logEvent, getSummary } from "../controllers/analyticsController.js";

const router = express.Router();

router.post("/analytics/event", logEvent);
router.get("/analytics/summary", getSummary);

export default router;
