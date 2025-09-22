import axios from "axios";

export const getJudg0LanguageId = (language) => {
  const languageMap = {
    "PYTHON": 71,
    "JAVA": 62,
    "JAVASCRIPT": 63,
  };
  return languageMap[language.toUpperCase()];
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Toggle base64 encoding for submissions (source_code, input, expected_output)
const useBase64Encoding =
  (process.env.JUDGE0_BASE64_ENCODE ?? "false").toLowerCase() === "true";

export const pollBatchResult = async (tokens) => {
  while (true) {
    const options = {
      method: "GET",
      url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
      },
      params: { tokens: tokens.join(","), base64_encoded: false },
    };

    try {
      const { data } = await axios.request(options);

      const results = data.submissions;

      const allDone = results.every(r => r.status.id !== 1 && r.status.id !== 2);

      if(allDone) return results; 

      await sleep(1000);

    } catch (err) {
      console.error("Judge0 error:", err.response?.data || err.message);
      throw err;
    }
  }
};

export const submitBatch = async (submissions) => {
  // If base64 flag is on, encode fields accordingly
  const payloadSubmissions = useBase64Encoding
    ? submissions.map((s) => ({
        ...s,
        source_code: Buffer.from(s.source_code ?? "").toString("base64"),
        stdin:
          s.stdin !== undefined && s.stdin !== null
            ? Buffer.from(String(s.stdin)).toString("base64")
            : undefined,
        expected_output:
          s.expected_output !== undefined && s.expected_output !== null
            ? Buffer.from(String(s.expected_output)).toString("base64")
            : undefined,
      }))
    : submissions;

  const options = {
    method: "POST",
    url: "https://judge0-ce.p.rapidapi.com/submissions/batch",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    },
    params: { base64_encoded: useBase64Encoding },
    data: { submissions: payloadSubmissions },
  };

  try {
    const { data } = await axios.request(options);
    return data;
  } catch (err) {
    console.error("Judge0 error:", err.response?.data || err.message);
    throw err;
  }
};

