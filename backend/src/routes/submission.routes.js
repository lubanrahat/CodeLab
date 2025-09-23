import express from "express";
import {
  getAllSubmissions,
  getSubmissionCountForProblem,
  getSubmissionForProblem,
} from "../controllers/submission.controllers.js";
import { authMiddleware } from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.get("/get-all-submissions", authMiddleware, getAllSubmissions);
router.get(
  "/get-submission/:problemId",
  authMiddleware,
  getSubmissionForProblem
);
router.get(
  "/get-submission-count/:problemId",
  authMiddleware,
  getSubmissionCountForProblem
);

export default router;
