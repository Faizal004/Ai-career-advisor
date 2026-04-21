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

/* ================= MIDDLEWARE ================= */

// 🔥 CORS (for now allow all, later restrict to your Vercel domain)
app.use(cors());

// Parse JSON
app.use(express.json());

/* ================= ROOT ROUTE ================= */

// ✅ For testing backend
app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully");
});

/* ================= MULTER SETUP ================= */

// ✅ Safe upload directory
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
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
      const pdfParseLib = require("pdf-parse");
      const pdfParse = pdfParseLib.default || pdfParseLib;

// ✅ DEBUG
console.log("TYPE OF pdfParse:", typeof pdfParse);

const pdfBuffer = fs.readFileSync(filePath);

const data = await pdfParse(pdfBuffer);
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

        // 🔥 FALLBACK SYSTEM
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

      // 🧹 Safe file delete
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

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

// 🔥 IMPORTANT FIX FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});