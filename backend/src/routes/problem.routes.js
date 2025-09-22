import express from "express";
import {
  authMiddleware,
  cheackAdmin,
} from "../middlewares/auth.middlewares.js";
import {
  createProblem,
  getAllProblems,
  getProblemById,
  getProblemSolvedByUser,
  updateProblem,
  deleteProblem,
} from "../controllers/problem.controllers.js";

const router = express.Router();

router.post("/create-problem", authMiddleware, cheackAdmin, createProblem);

router.get("/get-all-problems", authMiddleware, getAllProblems);

router.get("/get-problem/:id", authMiddleware, getProblemById);

router.put("/update-problem/:id", authMiddleware, cheackAdmin, updateProblem);

router.delete(
  "/delete-problem/:id",
  authMiddleware,
  cheackAdmin,
  deleteProblem
);

router.get("/get-solved-problems", authMiddleware, getProblemSolvedByUser);

export default router;
