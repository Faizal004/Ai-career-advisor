const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const authenticate = require("./middleware/authenticate");
const { analyzeData } = require("./services/analyzeService");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= MULTER SETUP ================= */

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

/* ================= ROUTES ================= */

/* 🔥 RESUME UPLOAD */
app.post(
  "/api/upload-resume",
  authenticate,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("🚀 UPLOAD API HIT");
      console.log("📄 FILE:", req.file);

      // ❗ Check file exists
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;

      // 📄 Extract PDF text
      const data = await pdfParse(fs.readFileSync(filePath));     
      const text = data.text;

      const cleanText = text.toLowerCase();

      // 🔍 Basic skill detection
      const skills = [
        "python",
        "react",
        "node",
        "javascript",
        "java",
        "mongodb",
      ].filter((s) => cleanText.includes(s));

      let result;

      try {
        // 🔥 AI + RAG ANALYSIS
        result = await analyzeData({
          text,
          skills,
          education: [],
          experience: "Not found",
          domain: "Web Development",
        });
      } catch (aiErr) {
        console.log("❌ AI ERROR:", aiErr.message);

        // 🔥 FALLBACK (IMPORTANT)
        result = {
          rag: {
            role: "Web Developer",
            matchedSkills: skills,
            missingSkills: ["Projects", "Advanced concepts"],
            readinessScore: 30,
          },
          aiAnalysis: {
            career_summary:
              "AI unavailable, showing basic analysis.",
            strengths: skills,
            weaknesses: [
              "Need more projects",
              "Missing advanced skills",
            ],
            skills_to_learn: [
              { skill: "Projects", priority: "high" },
              { skill: "DSA", priority: "medium" },
            ],
            projects_to_build: [
              { title: "Portfolio Website" },
              { title: "Full Stack App" },
            ],
            career_readiness_score: 30,
          },
        };
      }

      // 🧹 Delete uploaded file
      fs.unlinkSync(filePath);

      // ✅ FINAL RESPONSE
      res.json({
        message: "Resume Analysis Complete 🚀",

        basicAnalysis: {
          skills,
        },

        ragAnalysis: result.rag,
        aiAnalysis: result.aiAnalysis,
      });

    } catch (err) {
      console.error("🔥 FULL ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

/* 🔥 MANUAL INPUT */
app.post("/api/manual-input", authenticate, async (req, res) => {
  try {
    const { skills, education, goal } = req.body;

    const text = `
    Skills: ${skills}
    Education: ${education}
    Goal: ${goal}
    `;

    const skillArray = skills.toLowerCase().split(",");

    const domain = goal.toLowerCase().includes("data")
      ? "Data Science / AI"
      : "Web Development";

    const result = await analyzeData({
      text,
      skills: skillArray,
      education: [education],
      domain,
    });

    res.json({
      message: "Manual AI Analysis Complete 🚀",
      ragAnalysis: result.rag,
      aiAnalysis: result.aiAnalysis,
    });

  } catch (err) {
    console.error("🔥 MANUAL ERROR:", err);
    res.status(500).json({ error: "Manual analysis failed" });
  }
});

/* ================= SERVER ================= */

app.listen(5000, () => console.log("🚀 Server running on port 5000"));