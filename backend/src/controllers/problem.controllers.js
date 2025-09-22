import { db } from "../libs/db.js";
import {
  getJudg0LanguageId,
  pollBatchResult,
  submitBatch,
} from "../libs/judg0.libs.js";

export const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    hints,
    editorial,
    testCases,
    codeSnippets,
  } = req.body;

  // Support both keys: referencesSolutions (preferred) and referenceSolutions (alias)
  const referencesSolutions =
    req.body?.referencesSolutions ?? req.body?.referenceSolutions;

  if (req.user.role !== "ADMIN") {
    return res
      .status(401)
      .json({ error: "You are not authorized to create a problem" });
  }

  // Basic input validation to avoid runtime errors
  if (!title || !description || !difficulty) {
    return res.status(400).json({
      error: "Missing required fields: title, description, difficulty",
    });
  }

  if (
    !referencesSolutions ||
    typeof referencesSolutions !== "object" ||
    Object.keys(referencesSolutions).length === 0
  ) {
    return res.status(400).json({
      error: "referencesSolutions must be a non-empty object keyed by language",
    });
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return res
      .status(400)
      .json({ error: "testCases must be a non-empty array" });
  }

  try {
    const shouldValidate =
      (process.env.JUDGE0_VALIDATE_REFERENCE_SOLUTIONS ?? "true").toLowerCase() !==
      "false";

    if (shouldValidate) {
      // Validate each reference solution against provided test cases
      for (const [language, solutionCode] of Object.entries(
        referencesSolutions
      )) {
        const languageId = getJudg0LanguageId(language);
        if (!languageId) {
          return res
            .status(400)
            .json({ error: `Language ${language} is not supported` });
        }

        const submission = testCases.map(({ input, output }) => ({
          source_code: solutionCode,
          language_id: languageId,
          stdin: input ?? "",
          expected_output: output ?? "",
        }));

        const submissionResult = await submitBatch(submission);

        const tokens = submissionResult.map((res) => res.token);

        const result = await pollBatchResult(tokens);

        for (let i = 0; i < result.length; i++) {
          const submissionResult = result[i];
          console.log("Submission Result ---> ", submissionResult);

          if (submissionResult.status.id !== 3) {
            return res.status(400).json({
              error: `Testcase ${i + 1} failed for language ${language}`,
            });
          }
        }
      }
    }

    // Prisma schema expects:
    // - constraints: String (not array)
    // - hints: String? (nullable string)
    const normalizedConstraints = Array.isArray(constraints)
      ? constraints.join("\n")
      : (constraints ?? "");
    const normalizedHints = Array.isArray(hints)
      ? hints.join("\n")
      : (typeof hints === "string" ? hints : null);

    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints: normalizedConstraints,
        hints: normalizedHints,
        editorial,
        testCases,
        codeSnippets,
        referencesSolutions,
        userId: req.user.id,
      },
    });

    return res
      .status(201)
      .json({ message: "Problem created successfully", problem: newProblem });
  } catch (error) {
    console.log("Error creating problem:", error);
    return res.status(500).json({ error: "Failed to create problem" });
  }
};

export const getAllProblems = async (req, res) => {
  try {
  } catch (error) {}
};

export const getProblem = async (req, res) => {};

export const updateProblem = async (req, res) => {
  try {
  } catch (error) {}
};

export const deleteProblem = async (req, res) => {
  try {
  } catch (error) {}
};

export const getProblemSolvedByUser = async (req, res) => {
  try {
  } catch (error) {}
};
