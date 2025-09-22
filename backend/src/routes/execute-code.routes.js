import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { executeCode } from "../controllers/execute-code.controllers.js";

const router = express.Router();

router.post("/", authMiddleware, executeCode);

export default router;