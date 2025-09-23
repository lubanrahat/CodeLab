import { db } from "../libs/db.js";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const newPlaylist = await db.playlist.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Playlist created successfully",
      playlist: newPlaylist,
    });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create playlist",
      error: error.message,
    });
  }
};

export const getAllPlaylistsDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlists fetched successfully",
      playlists,
    });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch playlists",
      error: error.message,
    });
  }
};

export const getPlaylistDetails = async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: "Playlist not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Playlist details fetched successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch playlist details",
      error: error.message,
    });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemId } = req.body;

  try {
    if (!Array.isArray(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Problem id must be an array",
      });
    }

    const problemInPlaylist = await db.problemInPlaylist.create({
      data: problemId.map((id) => ({
        playlistId,
        problemId,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Problem added to playlist successfully",
      problemInPlaylist,
    });
  } catch (error) {
    console.error("Error adding problem to playlist:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add problem to playlist",
      error: error.message,
    });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
        userId: req.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete playlist",
      error: error.message,
    });
  }
};

export const removeProblemFromPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemId } = req.body;

  if (!Array.isArray(problemId)) {
    return res.status(400).json({
      success: false,
      message: "Problem id must be an array",
    });
  }

  try {
    const deletedProblem = await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId: {
          in: problemId,
        }
      },
    });

    return res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
      deletedProblem,
    });
  } catch (error) {
    console.error("Error removing problem from playlist:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove problem from playlist",
      error: error.message,
    });
  }
};

