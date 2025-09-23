import { db } from "../libs/db.js";

export const getAllSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const submission = await db.submission.findMany({
      where: {
        userId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      data: submission,
    });
  } catch (error) {
    console.error("Error fetching submissions", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getSubmissionForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemId;
    const submissions = await db.submission.findMany({
      where: {
        userId: userId,
        problemId: problemId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      data: submissions,
    });
  } catch (error) {
    console.error("Error fetching submissions", error);
    return res.status(500).json({ message: error.message });
  }
};

export const getSubmissionCountForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemId;
    const submissionCount = await db.submission.count({
      where: {
        problemId: problemId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Submissions count fetched successfully",
      data: submissionCount,
    });
  } catch (error) {
    console.error("Error fetching submissions count", error);
    return res.status(500).json({ message: error.message });
  }
};
