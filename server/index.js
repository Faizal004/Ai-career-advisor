const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authenticate = require("./middleware/authenticate");
const { analyzeData } = require("./services/analyzeService");

const app = express();

/* ================= MIDDLEWARE ================= */

app.use(cors());
app.use(express.json());

/* ================= ROOT ROUTE ================= */

app.get("/", (req, res) => {
  res.send("🚀 Backend is running successfully");
});

/* ================= MULTER SETUP ================= */

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

app.post(
  "/api/upload-resume",
  authenticate,
  upload.single("resume"),
  async (req, res) => {
    try {
      console.log("🚀 UPLOAD API HIT");
      console.log("📄 FILE:", req.file);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;

      /* ================= PDF PARSE FIX ================= */

      const pdfParseLib = require("pdf-parse");

      // 🔥 CRITICAL FIX (Node 22 compatibility)
      const pdfParse = pdfParseLib.default;

      console.log("TYPE OF pdfParse:", typeof pdfParse); // should be function

      const pdfBuffer = fs.readFileSync(filePath);

      const data = await pdfParse(pdfBuffer);
      const text = data.text;

      /* ================= SKILL DETECTION ================= */

      const cleanText = text.toLowerCase();

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
        result = await analyzeData({
          text,
          skills,
          education: [],
          experience: "Not found",
          domain: "Web Development",
        });
      } catch (aiErr) {
        console.log("❌ AI ERROR:", aiErr.message);

        result = {
          rag: {
            role: "Web Developer",
            matchedSkills: skills,
            missingSkills: ["Projects", "Advanced concepts"],
            readinessScore: 30,
          },
          aiAnalysis: {
            career_summary: "AI unavailable, basic analysis shown.",
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

      /* ================= CLEANUP ================= */

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      /* ================= RESPONSE ================= */

      res.json({
        message: "Resume Analysis Complete 🚀",
        basicAnalysis: { skills },
        ragAnalysis: result.rag,
        aiAnalysis: result.aiAnalysis,
      });

    } catch (err) {
      console.error("🔥 FULL ERROR:", err.stack);
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});