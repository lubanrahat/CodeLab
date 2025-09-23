import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executeCodeRoutes from "./routes/execute-code.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executeCodeRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/playlists", playlistRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
