import express from "express";
import multer from "multer";
import {
  parseResume,
  startInterview,
  submitAnswer,
  getInterview,
  abandonInterview,
  listInterviews,
  startWeakAreaPractice,
} from "../controllers/interviewController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF or plain text resumes are supported."));
    }
  },
});

const router = express.Router();

router.post("/interview/resume", (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    next();
  });
}, parseResume);

router.post("/interview/start", startInterview);
router.post("/interview/:id/answer", submitAnswer);
router.get("/interview/:id", getInterview);
router.post("/interview/:id/abandon", abandonInterview);

router.get("/interviews", listInterviews);

router.post("/practice/weak-area", startWeakAreaPractice);

export default router;
