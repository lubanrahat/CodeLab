import { pollBatchResult, submitBatch } from "../libs/judg0.libs.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_output } = req.body;

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

    const submission = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    //3. Submit batch to judg0
    const submissionResult = await submitBatch(submission);

    const tokens = submissionResult.map((res) => res.token);

    const result = await pollBatchResult(tokens);

    console.log("Result ---> ");
    console.log(result);

    return res
      .status(200)
      .json({ message: "Code executed successfully", result });
  } catch (error) {
    console.log("Error executing code ---> ", error);
    return res.status(500).json({ error: "Failed to execute code" });
  }
};
