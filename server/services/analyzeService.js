const { analyzeResumeAdvanced } = require("./aiService");
const { analyzeWithRAG } = require("./ragService");

async function analyzeData({
  text,
  skills = [],
  education = [],
  experience = "Not found",
  domain = "General",
}) {
  const rag = analyzeWithRAG({
    skills,
    domain,
  });

  const aiAnalysis = await analyzeResumeAdvanced({
    text,
    skills,
    education,
    experience,
    domain,
  });

  return {
    rag,
    aiAnalysis,
  };
}

module.exports = { analyzeData };