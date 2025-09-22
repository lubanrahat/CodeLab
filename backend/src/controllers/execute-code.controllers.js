import {
  getLanguageName,
  pollBatchResult,
  submitBatch,
} from "../libs/judg0.libs.js";
import { db } from "../libs/db.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_output, problemId } =
      req.body;

    const userId = req.user.id;

    //validate testcases
    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_output) ||
      expected_output.length !== stdin.length
    ) {
      return res.status(400).json({ error: "Invalid and missing testcases" });
    }

    //2. Prepare each testcase for judg0 batch submission

    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    //3. Submit batch to judg0
    const submissionResult = await submitBatch(submissions);

    const tokens = submissionResult.map((res) => res.token);

    const results = await pollBatchResult(tokens);

    console.log("Result ---> ");
    console.log(results);

    //Analyze testcases result
    let allPassed = true;
    const detailsResult = results.map((result, idx) => {
      const stdout = result?.stdout ? result.stdout.trim() : null;

      const expectedOutput = expected_output[idx].trim();

      const passed = stdout === expectedOutput;

      if (!passed) allPassed = false;

      return {
        testcase: idx + 1,
        passed,
        stdin: stdin[idx],
        stdout,
        expected: expectedOutput,
        stderr: result?.stderr || null,
        compile_output: result?.compile_output || null,
        status: result?.status.description,
        memory: result?.memory ? `${result.memory}kb` : undefined,
        time: result?.time ? `${result.time}s` : undefined,
      };

      // console.log(`Testcase ${idx + 1}: ${passed ? "Passed" : "Failed"}`);
      // console.log(`Input: ${stdin[idx]}`);
      // console.log(`Expected Output: ${expectedOutput}`);
      // console.log(`Actual Output: ${stdout}`);
    });

    console.log("Details Result ---> ");
    console.log(detailsResult);

    // Summaries for Submission (as Ints to match Prisma schema)
    const memValues = results
      .map((r) => (r?.memory != null ? Number(r.memory) : null))
      .filter((v) => v != null);
    const timeValuesSec = results
      .map((r) => (r?.time != null ? parseFloat(r.time) : null))
      .filter((v) => v != null);
    const summaryMemoryUsage = memValues.length ? Math.max(...memValues) : null; // in KB
    const summaryTimeUsage = timeValuesSec.length
      ? Math.round(Math.max(...timeValuesSec) * 1000)
      : null; // in ms

    const submission = await db.submission.create({
      data: {
        userId,
        problemId,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailsResult.map((r) => r.stdout)),
        stderr: detailsResult.some((r) => r.stderr)
          ? JSON.stringify(detailsResult.map((r) => r.stderr))
          : null,
        compileOutput: detailsResult.some((r) => r.compile_output)
          ? JSON.stringify(detailsResult.map((r) => r.compile_output))
          : null,
        status: allPassed ? "Accepted" : "Failed",
        memoryUsage: summaryMemoryUsage,
        timeUsage: summaryTimeUsage,
      },
    });

    //If all passed, add to solved problem
    if (allPassed) {
      await db.problemSolved.upsert({
        where: {
          userId_problemId: {
            userId,
            problemId,
          },
        },
        update: {},
        create: {
          userId,
          problemId,
        },
      });
    }

    const testCasesResult = detailsResult.map((result) => {
      return {
        submissionId: submission.id,
        testCase: result.testcase,
        passed: result.passed,
        stdout: result.stdout,
        expected: result.expected,
        stderr: result.stderr,
        compileOutput: result.compile_output,
        status: result.status,
        memoryUsage: result.memory,
        timeUsage: result.time,
      };
    });

    await db.testCasesResult.createMany({
      data: testCasesResult,
    });

    const submissionWithTestCases = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Code executed successfully",
      submission: submissionWithTestCases,
    });
  } catch (error) {
    console.log("Error executing code ---> ", error);
    return res.status(500).json({ error: "Failed to execute code" });
  }
};
