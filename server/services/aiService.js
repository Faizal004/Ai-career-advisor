/**
 * ============================================================
 *  ADVANCED AI CAREER ANALYSIS SERVICE  —  aiService.js
 *
 *  Features:
 *   • Multi-pass prompting (extract → analyze → advise)
 *   • Full RAG integration — AI + structured data combined
 *   • Skill extraction from raw resume text (no pre-parse needed)
 *   • Chain-of-thought reasoning in prompt
 *   • Retry with exponential backoff
 *   • Hallucination guards + output validation
 *   • Token-efficient structured prompts
 *   • Rich, actionable, role-specific output
 *   • Graceful degradation — fallback uses real RAG (not dummy data)
 * ============================================================
 */

"use strict";

const OpenAI          = require("openai");
const { analyzeWithRAG } = require("./ragService");

/* ─────────────────────────────────────────────
   CLIENT INIT
────────────────────────────────────────────── */
let openai = null;

try {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("No API key");
  openai = new OpenAI({
    apiKey:  process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    timeout: 30_000,
    maxRetries: 0, // we handle retries manually below
  });
  console.log("✅ OpenRouter client initialized");
} catch (err) {
  console.warn("⚠️  OpenRouter init failed:", err.message);
}

/* ─────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────── */
const PRIMARY_MODEL  = "openai/gpt-4o-mini";
const FALLBACK_MODEL = "mistralai/mistral-7b-instruct";
const MAX_RETRIES    = 3;
const RETRY_BASE_MS  = 800;

/* ─────────────────────────────────────────────
   UTILITY — exponential backoff retry
────────────────────────────────────────────── */
async function withRetry(fn, retries = MAX_RETRIES, baseMs = RETRY_BASE_MS) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === retries;
      const isRetryable = err.status === 429 || err.status === 503 || err.code === "ECONNRESET";
      if (isLast || !isRetryable) throw err;
      const delay = baseMs * Math.pow(2, attempt - 1);
      console.warn(`⚠️  Attempt ${attempt} failed (${err.message}). Retrying in ${delay}ms…`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/* ─────────────────────────────────────────────
   UTILITY — safe JSON extraction
   Handles markdown fences, trailing commas,
   and partial JSON from the model
────────────────────────────────────────────── */
function safeParseJSON(raw) {
  if (!raw) throw new Error("Empty response");

  // Strip markdown fences
  let cleaned = raw.replace(/```(?:json)?/gi, "").trim();

  // Extract outermost JSON object
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found");
  cleaned = cleaned.slice(start, end + 1);

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  return JSON.parse(cleaned);
}

/* ─────────────────────────────────────────────
   UTILITY — validate AI output shape
   Returns a clean, guaranteed-safe object
────────────────────────────────────────────── */
function validateAndClean(parsed, ragData, rawSkills) {
  const ensureArray  = (v, fallback = []) => Array.isArray(v) && v.length ? v : fallback;
  const ensureStr    = (v, fallback = "") => typeof v === "string" && v.trim() ? v.trim() : fallback;
  const ensureNum    = (v, fallback = 50) => typeof v === "number" && v >= 0 && v <= 100 ? Math.round(v) : fallback;

  const roadmap = ensureArray(parsed.personalized_roadmap).map(phase => ({
    phase:    ensureStr(phase.phase,    "Phase"),
    duration: ensureStr(phase.duration, "2–4 weeks"),
    steps:    ensureArray(phase.steps,  ["Complete recommended resources"]),
    resources: ensureArray(phase.resources),
  }));

  const projects = ensureArray(parsed.projects_to_build).map(p => ({
    title:        ensureStr(p.title,       "Project"),
    description:  ensureStr(p.description, "Build a real-world project"),
    stack:        ensureArray(p.stack),
    difficulty:   ensureStr(p.difficulty,  "Intermediate"),
    impact:       ensureStr(p.impact,      "Portfolio-ready"),
  }));

  const skillGaps = ensureArray(parsed.skill_gaps).map(g => ({
    skill:       ensureStr(g.skill,      ""),
    priority:    ensureStr(g.priority,   "Medium"),
    why:         ensureStr(g.why,        ""),
    learnIn:     ensureStr(g.learnIn,    "2–4 weeks"),
    resource:    ensureStr(g.resource,   ""),
  })).filter(g => g.skill);

  return {
    // Identity
    detected_role:   ensureStr(parsed.detected_role,   ragData.role),
    seniority_level: ensureStr(parsed.seniority_level, ragData.tier ?? "Mid"),
    domain:          ensureStr(parsed.domain,           ragData.domain),

    // Summary
    career_summary:  ensureStr(parsed.career_summary,  "No summary generated"),
    final_advice:    ensureStr(parsed.final_advice,     "Keep building real-world projects and stay consistent"),

    // Scores
    career_readiness_score: ensureNum(parsed.career_readiness_score, ragData.readinessScore),
    rag_readiness_score:    ragData.readinessScore,
    core_coverage:          ragData.coreCoverage ?? 0,

    // Strengths / Weaknesses
    strengths:   ensureArray(parsed.strengths,  rawSkills.slice(0, 3)),
    weaknesses:  ensureArray(parsed.weaknesses, ["Needs more real-world projects"]),

    // Skills
    confirmed_skills: ensureArray(parsed.confirmed_skills, rawSkills),
    skills_to_learn:  ensureArray(parsed.skills_to_learn,  ragData.missingSkills?.map(m => m.skill) ?? []),
    skill_gaps:       skillGaps,

    // Learning path
    personalized_roadmap: roadmap.length ? roadmap : ragData.roadmap?.map(r => ({
      phase:     r.phase,
      duration:  r.duration,
      steps:     r.topics ?? [],
      resources: [],
    })) ?? [],

    // Projects
    projects_to_build: projects.length ? projects : ragData.projects?.map(p => ({
      title:       p,
      description: `Build a ${p} project to strengthen your portfolio`,
      stack:       rawSkills.slice(0, 3),
      difficulty:  "Intermediate",
      impact:      "Portfolio-ready",
    })) ?? [],

    // Alternatives
    alternative_roles: ensureArray(
      parsed.alternative_roles,
      ragData.alternativeRoles ?? []
    ),

    // Resources (from RAG)
    recommended_resources: ragData.resources ?? {},

    // Market intel
    market_insights: {
      demand:       ensureStr(parsed.market_demand,    "High demand in current market"),
      salary_range: ensureStr(parsed.salary_range,     "Varies by location and experience"),
      top_companies: ensureArray(parsed.top_companies, []),
    },
  };
}

/* ─────────────────────────────────────────────
   PASS 1 — Skill Extraction
   Pulls skills out of raw resume text
   Returns: string[] of skill names
────────────────────────────────────────────── */
async function extractSkillsFromText(resumeText, model) {
  if (!resumeText || resumeText.length < 50) return [];

  const response = await withRetry(() =>
    openai.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens: 400,
      messages: [{
        role: "system",
        content: "You are a resume parser. Extract ONLY technical and professional skills. Return ONLY a JSON array of strings. No explanation.",
      }, {
        role: "user",
        content: `Extract all skills (programming languages, frameworks, tools, cloud, databases, soft skills, certifications) from this resume:\n\n${resumeText.slice(0, 3000)}`,
      }],
    })
  );

  try {
    const raw = response.choices[0].message.content.trim();
    const arr = JSON.parse(raw.replace(/```(?:json)?/gi, "").trim());
    return Array.isArray(arr) ? arr.map(s => String(s).trim()).filter(Boolean) : [];
  } catch {
    // fallback: extract comma/newline separated tokens
    return response.choices[0].message.content
      .replace(/[[\]"'`]/g, "")
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 40);
  }
}

/* ─────────────────────────────────────────────
   PASS 2 — Deep Career Analysis
   The main prompt — informed by RAG context
────────────────────────────────────────────── */
function buildAnalysisPrompt(resumeText, allSkills, ragData) {
  const ragContext = `
STRUCTURED ANALYSIS (from career database):
- Best Role Match: ${ragData.role}
- Domain: ${ragData.domain}
- RAG Readiness Score: ${ragData.readinessScore}%
- Core Skills Coverage: ${ragData.coreCoverage}%
- Confirmed Matching Skills: ${ragData.matchedSkills?.map(m => m.skill).join(", ") || "None"}
- Critical Missing Skills: ${ragData.missingSkills?.filter(m => m.priority?.includes("Critical")).map(m => m.skill).join(", ") || "None"}
- Important Missing Skills: ${ragData.missingSkills?.filter(m => m.priority?.includes("Important")).map(m => m.skill).join(", ") || "None"}
- Alternative Roles: ${ragData.alternativeRoles?.map(r => r.role).join(", ") || "None"}
- Suggested Projects: ${ragData.projects?.slice(0, 4).join(", ") || "None"}
`;

  return `You are a world-class AI Career Advisor used by top companies.

TASK: Provide a deep, specific, actionable career analysis for this candidate.

${ragContext}

CANDIDATE SKILLS: ${allSkills.join(", ")}

RESUME TEXT:
${resumeText ? resumeText.slice(0, 4000) : "(Resume text not available — use skills list only)"}

INSTRUCTIONS:
1. Think step by step before answering
2. Be SPECIFIC — reference actual skills from the resume
3. Do NOT use generic advice — tailor everything to THIS candidate
4. Skill gaps must reference the RAG missing skills above
5. Projects must use the candidate's actual tech stack
6. Roadmap must be realistic (weeks, not vague "months")
7. Salary/market data should be realistic for India market (₹) and global ($)
8. Return ONLY valid JSON — no markdown, no explanation outside JSON

Return this EXACT JSON structure (fill every field meaningfully):

{
  "detected_role": "Specific role title that best matches this candidate",
  "seniority_level": "Junior | Mid | Senior | Lead",
  "domain": "Domain of the role",

  "career_summary": "3-4 sentences: who this person is, what they're good at, where they are in their career, and their biggest opportunity",

  "strengths": [
    "Specific strength with evidence from resume",
    "Another specific strength",
    "Third strength"
  ],

  "weaknesses": [
    "Specific gap with context (e.g. 'No cloud experience despite backend work')",
    "Another specific gap",
    "Third gap"
  ],

  "confirmed_skills": ["list", "of", "all", "detected", "skills"],

  "skill_gaps": [
    {
      "skill": "Skill name",
      "priority": "Critical | Important | Nice to have",
      "why": "Why this specific skill matters for their goal role",
      "learnIn": "Realistic time e.g. 2 weeks",
      "resource": "Best free or paid resource (e.g. 'freeCodeCamp Docker tutorial')"
    }
  ],

  "skills_to_learn": ["skill1", "skill2", "skill3", "skill4", "skill5"],

  "projects_to_build": [
    {
      "title": "Specific project name",
      "description": "What to build, why it matters for their career",
      "stack": ["tech1", "tech2", "tech3"],
      "difficulty": "Beginner | Intermediate | Advanced",
      "impact": "What this adds to portfolio / demonstrates"
    }
  ],

  "personalized_roadmap": [
    {
      "phase": "Phase name (e.g. 'Fill Critical Gaps')",
      "duration": "e.g. 3 weeks",
      "steps": [
        "Specific actionable step",
        "Another specific step"
      ],
      "resources": ["Resource 1", "Resource 2"]
    }
  ],

  "alternative_roles": [
    {
      "role": "Alternative role name",
      "readinessScore": 75,
      "reason": "Why they could pivot here"
    }
  ],

  "market_demand": "Current market demand sentence with specifics",
  "salary_range": "e.g. ₹8–18 LPA in India | $70k–$110k globally",
  "top_companies": ["Company1", "Company2", "Company3"],

  "final_advice": "2-3 sentences of honest, direct, personalized advice for this specific candidate",

  "career_readiness_score": 72
}`;
}

/* ─────────────────────────────────────────────
   MAIN EXPORT — analyzeResumeAdvanced
────────────────────────────────────────────── */
async function analyzeResumeAdvanced(data) {
  const {
    skills:       rawSkills = [],
    text:         resumeText = "",
    domain:       userDomain = null,
    goal:         userGoal   = null,
    education:    education  = "",
  } = data;

  console.log(`\n🚀 Starting analysis | Skills: ${rawSkills.length} | Text: ${resumeText.length} chars`);

  /* ── Step 1: Extract skills from resume text if not pre-parsed ── */
  let allSkills = [...rawSkills];

  if (openai && resumeText.length > 100 && rawSkills.length < 5) {
    try {
      console.log("🔍 Pass 1: Extracting skills from resume text…");
      const extracted = await extractSkillsFromText(resumeText, PRIMARY_MODEL);
      console.log(`   → Extracted ${extracted.length} skills`);
      // Merge & deduplicate
      const combined = [...new Set([...rawSkills, ...extracted].map(s => s.toLowerCase()))];
      allSkills = combined;
    } catch (err) {
      console.warn("   ⚠️ Skill extraction failed:", err.message);
    }
  }

  /* ── Step 2: RAG analysis (always runs — no API needed) ── */
  console.log("📊 Running RAG analysis…");
  const ragData = analyzeWithRAG({
    skills: allSkills,
    domain: userDomain,
    goal:   userGoal,
  });
  console.log(`   → RAG best role: ${ragData.role} (${ragData.readinessScore}% readiness)`);

  /* ── Step 3: AI deep analysis (if available) ── */
  if (!openai) {
    console.warn("⚠️  No AI client — returning enhanced RAG-only analysis");
    return buildRAGOnlyResponse(ragData, allSkills, resumeText, education);
  }

  let model = PRIMARY_MODEL;

  try {
    console.log(`🤖 Pass 2: Deep AI analysis using ${model}…`);

    const prompt = buildAnalysisPrompt(resumeText, allSkills, ragData);

    const response = await withRetry(() =>
      openai.chat.completions.create({
        model,
        temperature: 0.4,      // Lower = more factual, less hallucination
        max_tokens:  2000,
        messages: [
          {
            role: "system",
            content:
              "You are an expert career advisor AI. You always return valid JSON. " +
              "You never fabricate skills not mentioned. " +
              "You give specific, actionable advice tailored to the exact candidate. " +
              "You never use placeholder text like 'X years of experience' without knowing the actual value.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      })
    );

    const raw    = response.choices[0].message.content;
    const parsed = safeParseJSON(raw);
    const result = validateAndClean(parsed, ragData, allSkills);

    console.log(`✅ AI analysis complete | Role: ${result.detected_role} | Score: ${result.career_readiness_score}`);
    return result;

  } catch (err) {
    // Try fallback model once
    if (model === PRIMARY_MODEL) {
      console.warn(`⚠️  Primary model failed (${err.message}), trying fallback model…`);
      try {
        model = FALLBACK_MODEL;
        const prompt   = buildAnalysisPrompt(resumeText, allSkills, ragData);
        const response = await openai.chat.completions.create({
          model,
          temperature: 0.3,
          max_tokens: 1800,
          messages: [
            { role: "system", content: "Return only valid JSON. No explanation." },
            { role: "user",   content: prompt },
          ],
        });
        const raw    = response.choices[0].message.content;
        const parsed = safeParseJSON(raw);
        const result = validateAndClean(parsed, ragData, allSkills);
        console.log(`✅ Fallback model succeeded | Role: ${result.detected_role}`);
        return result;
      } catch (fallbackErr) {
        console.error("❌ Fallback model also failed:", fallbackErr.message);
      }
    }

    // Final fallback: Rich RAG-only response
    console.warn("🔁 Using RAG-only response as final fallback");
    return buildRAGOnlyResponse(ragData, allSkills, resumeText, education);
  }
}

/* ─────────────────────────────────────────────
   RAG-ONLY FALLBACK
   When AI is unavailable — still returns rich,
   structured, meaningful data from RAG engine
   (far better than the old dummy hardcoded data)
────────────────────────────────────────────── */
function buildRAGOnlyResponse(ragData, skills, resumeText, education) {
  const missingCritical  = ragData.missingSkills?.filter(m => m.priority?.includes("Critical"))  ?? [];
  const missingImportant = ragData.missingSkills?.filter(m => m.priority?.includes("Important")) ?? [];

  // Build skill gaps from RAG
  const skillGaps = [
    ...missingCritical.map(m => ({
      skill:    m.skill,
      priority: "Critical",
      why:      `Core requirement for ${ragData.role}`,
      learnIn:  "2–3 weeks",
      resource: `Search: "learn ${m.skill} free tutorial"`,
    })),
    ...missingImportant.slice(0, 3).map(m => ({
      skill:    m.skill,
      priority: "Important",
      why:      `Frequently required for ${ragData.role} positions`,
      learnIn:  "3–4 weeks",
      resource: `Search: "${m.skill} course"`,
    })),
  ];

  // Build projects from RAG projects list
  const projects = (ragData.projects ?? []).slice(0, 3).map((p, i) => ({
    title:       p,
    description: `Build a production-quality ${p} using your current tech stack`,
    stack:       skills.slice(0, 3),
    difficulty:  i === 0 ? "Intermediate" : "Advanced",
    impact:      "Demonstrates real-world capability to employers",
  }));

  // Build roadmap from personalized RAG roadmap
  const roadmap = (ragData.roadmap ?? []).map(r => ({
    phase:     r.phase,
    duration:  r.duration ?? "2–4 weeks",
    steps:     Array.isArray(r.topics) ? r.topics : [r.phase],
    resources: [],
  }));

  const score = ragData.readinessScore ?? 50;

  return {
    detected_role:          ragData.role    ?? "Software Developer",
    seniority_level:        ragData.tier    ?? "Mid",
    domain:                 ragData.domain  ?? "Technology",

    career_summary: skills.length
      ? `Candidate has hands-on experience with ${skills.slice(0, 4).join(", ")}. ` +
        `Best matched to the ${ragData.role} role with ${score}% readiness. ` +
        `Focus on filling ${missingCritical.length} critical skill gaps to become job-ready.`
      : "Upload a resume or add skills for a personalized analysis.",

    strengths:  skills.slice(0, 5).map(s => `Proficiency in ${s}`),

    weaknesses: [
      ...missingCritical.slice(0, 2).map(m => `Missing critical skill: ${m.skill}`),
      ...(skills.length < 5 ? ["Limited skill breadth detected"] : []),
      "Real-world project experience not verified from resume",
    ].slice(0, 4),

    confirmed_skills: skills,
    skills_to_learn:  ragData.missingSkills?.map(m => m.skill).slice(0, 6) ?? [],
    skill_gaps:       skillGaps,

    personalized_roadmap: roadmap,
    projects_to_build:    projects,

    alternative_roles: (ragData.alternativeRoles ?? []).map(r => ({
      role:          r.role,
      readinessScore: r.readinessScore,
      reason:        `${r.readinessScore}% skill overlap with your current profile`,
    })),

    recommended_resources: ragData.resources ?? {},

    market_insights: {
      demand:        `${ragData.role} roles are in strong demand across the tech industry`,
      salary_range:  "Varies by experience and location — research on LinkedIn Salary",
      top_companies: [],
    },

    final_advice:
      `Focus on the ${missingCritical.length} critical skill gaps first, especially ` +
      `${missingCritical[0]?.skill ?? "core fundamentals"}. ` +
      `Build at least 2 portfolio projects to demonstrate practical ability. ` +
      `Your current readiness score is ${score}% — with focused effort, you can reach 80%+ in 8–12 weeks.`,

    career_readiness_score: score,
    rag_readiness_score:    score,
    core_coverage:          ragData.coreCoverage ?? 0,
  };
}

module.exports = { analyzeResumeAdvanced };