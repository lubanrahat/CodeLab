import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  addProblemToPlaylist,
  createPlaylist,
  deletePlaylist,
  getAllPlaylistsDetails,
  getPlaylistDetails,
  removeProblemFromPlaylist,
} from "../controllers/playlist.controllers.js";

const router = express.Router();

router.get("/", authMiddleware, getAllPlaylistsDetails);

router.get("/:playlistId", authMiddleware, getPlaylistDetails);

router.post("/create-playlist", authMiddleware, createPlaylist);

router.post("/:playlistId/add-problem", authMiddleware, addProblemToPlaylist);

router.delete("/:playlistId", authMiddleware, deletePlaylist);

router.delete("/:playlistId/remove-problem", authMiddleware, removeProblemFromPlaylist);

export default router;
