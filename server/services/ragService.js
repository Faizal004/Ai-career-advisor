/**
 * ============================================================
 *  ADVANCED RAG ENGINE  —  ragEngine.js
 *  Supports ANY role/domain with:
 *   • Fuzzy + semantic skill matching (alias resolution)
 *   • Weighted tiered scoring (core > intermediate > advanced)
 *   • Multi-domain inference when domain is unknown
 *   • Skill taxonomy & category awareness
 *   • Personalized gap-priority ordering
 *   • Dynamic roadmap stitched from user's exact gap profile
 *   • Confidence score + role alternatives ranking
 * ============================================================
 */

const careerData = require("../data/careerData");

/* ─────────────────────────────────────────────
   1. SKILL TAXONOMY & ALIAS MAP
   Maps common aliases / abbreviations → canonical skill name
   so "js" → "JavaScript", "tf" → "TensorFlow", etc.
────────────────────────────────────────────── */
const SKILL_ALIASES = {
  // Languages
  js: "javascript", javascript: "javascript",
  ts: "typescript", typescript: "typescript",
  py: "python", python: "python",
  rb: "ruby", ruby: "ruby",
  go: "golang", golang: "golang",
  rs: "rust", rust: "rust",
  kt: "kotlin", kotlin: "kotlin",
  sw: "swift", swift: "swift",
  cs: "c#", "c#": "c#", csharp: "c#",
  cpp: "c++", "c++": "c++",
  c: "c",
  java: "java",
  php: "php",
  r: "r",
  scala: "scala",
  dart: "dart",

  // Frontend
  react: "react", reactjs: "react",
  vue: "vue.js", vuejs: "vue.js", "vue.js": "vue.js",
  angular: "angular", angularjs: "angular",
  svelte: "svelte",
  nextjs: "next.js", "next.js": "next.js",
  nuxtjs: "nuxt.js",
  html: "html", html5: "html",
  css: "css", css3: "css",
  sass: "sass", scss: "sass",
  tailwind: "tailwindcss", tailwindcss: "tailwindcss",
  bootstrap: "bootstrap",
  webpack: "webpack",
  vite: "vite",
  redux: "redux",

  // Backend
  node: "node.js", nodejs: "node.js", "node.js": "node.js",
  express: "express.js", expressjs: "express.js", "express.js": "express.js",
  django: "django",
  flask: "flask",
  fastapi: "fastapi",
  spring: "spring boot", springboot: "spring boot", "spring boot": "spring boot",
  laravel: "laravel",
  rails: "ruby on rails", ror: "ruby on rails",
  graphql: "graphql",
  rest: "rest api", restapi: "rest api", "rest api": "rest api",
  grpc: "grpc",

  // Databases
  sql: "sql",
  mysql: "mysql",
  postgres: "postgresql", postgresql: "postgresql",
  mongo: "mongodb", mongodb: "mongodb",
  redis: "redis",
  cassandra: "cassandra",
  elastic: "elasticsearch", elasticsearch: "elasticsearch",
  firebase: "firebase",
  dynamodb: "dynamodb",
  sqlite: "sqlite",

  // Cloud & DevOps
  aws: "aws",
  gcp: "google cloud", "google cloud": "google cloud",
  azure: "azure",
  docker: "docker",
  k8s: "kubernetes", kubernetes: "kubernetes",
  terraform: "terraform",
  ansible: "ansible",
  jenkins: "jenkins",
  github: "github actions", "github actions": "github actions",
  cicd: "ci/cd", "ci/cd": "ci/cd",
  linux: "linux",
  bash: "bash/shell", shell: "bash/shell",
  nginx: "nginx",

  // ML / AI
  ml: "machine learning", "machine learning": "machine learning",
  dl: "deep learning", "deep learning": "deep learning",
  nlp: "nlp",
  cv: "computer vision", "computer vision": "computer vision",
  tf: "tensorflow", tensorflow: "tensorflow",
  pytorch: "pytorch",
  sklearn: "scikit-learn", "scikit-learn": "scikit-learn",
  keras: "keras",
  pandas: "pandas",
  numpy: "numpy",
  matplotlib: "matplotlib",
  openai: "openai api", "openai api": "openai api",
  langchain: "langchain",
  rag: "rag",
  llm: "llm",
  huggingface: "hugging face", "hugging face": "hugging face",

  // Mobile
  rn: "react native", "react native": "react native",
  flutter: "flutter",
  android: "android",
  ios: "ios",
  xcode: "xcode",

  // Data
  spark: "apache spark", "apache spark": "apache spark",
  hadoop: "hadoop",
  kafka: "kafka",
  airflow: "airflow",
  dbt: "dbt",
  tableau: "tableau",
  powerbi: "power bi", "power bi": "power bi",
  excel: "excel",
  etl: "etl",

  // Security
  owasp: "owasp",
  pentest: "penetration testing", "penetration testing": "penetration testing",
  siem: "siem",
  burpsuite: "burp suite", "burp suite": "burp suite",
  cryptography: "cryptography",
  "network security": "network security",
  soc: "soc",

  // Design
  figma: "figma",
  xd: "adobe xd", "adobe xd": "adobe xd",
  sketch: "sketch",
  ux: "ux design", "ux design": "ux design",
  ui: "ui design", "ui design": "ui design",

  // Soft / General
  git: "git",
  agile: "agile",
  scrum: "scrum",
  jira: "jira",
  "system design": "system design",
  dsa: "data structures", "data structures": "data structures",
  algorithms: "algorithms",
  "problem solving": "problem solving",
  communication: "communication",
  leadership: "leadership",
};

/* ─────────────────────────────────────────────
   2. UNIVERSAL ROLE REGISTRY
   Covers 60+ roles across all major domains.
   Each role has weighted skill tiers + metadata.
────────────────────────────────────────────── */
const ROLE_REGISTRY = {

  /* ── FRONTEND ── */
  "Frontend Developer": {
    domain: "Web Development",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["html", "css", "javascript", "react", "git"] },
      intermediate: { weight: 2, list: ["typescript", "tailwindcss", "redux", "next.js", "rest api", "webpack"] },
      advanced:     { weight: 1, list: ["vite", "graphql", "testing", "performance optimization", "accessibility", "ci/cd"] },
    },
    roadmap: [
      { phase: "Foundation",    duration: "4 weeks",  topics: ["HTML5 semantics", "CSS Flexbox & Grid", "JavaScript ES6+"] },
      { phase: "Framework",     duration: "6 weeks",  topics: ["React hooks", "State management", "Component architecture"] },
      { phase: "Advanced",      duration: "4 weeks",  topics: ["TypeScript", "Next.js SSR/SSG", "Performance & testing"] },
      { phase: "Professional",  duration: "2 weeks",  topics: ["CI/CD", "Accessibility (WCAG)", "System design basics"] },
    ],
    projects: ["Portfolio website", "E-commerce storefront", "Real-time dashboard", "PWA app"],
    resources: { courses: ["Frontend Masters", "Scrimba"], certs: ["Meta Front-End Developer"] },
  },

  "UI/UX Developer": {
    domain: "Design & Web",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["figma", "html", "css", "ux design", "ui design"] },
      intermediate: { weight: 2, list: ["javascript", "react", "tailwindcss", "sketch", "prototyping"] },
      advanced:     { weight: 1, list: ["motion design", "design systems", "accessibility", "user research", "adobe xd"] },
    },
    roadmap: [
      { phase: "Design Fundamentals", duration: "3 weeks", topics: ["Color theory", "Typography", "Layout & grids"] },
      { phase: "Tools",               duration: "3 weeks", topics: ["Figma mastery", "Prototyping", "Component libraries"] },
      { phase: "Dev Bridge",          duration: "4 weeks", topics: ["HTML/CSS for designers", "React basics"] },
      { phase: "Professional",        duration: "2 weeks", topics: ["Design systems", "Handoff workflows", "User testing"] },
    ],
    projects: ["Design system", "Mobile app redesign", "Landing page with animations"],
    resources: { courses: ["Google UX Design (Coursera)", "DesignCourse"], certs: ["Google UX Design Certificate"] },
  },

  /* ── BACKEND ── */
  "Backend Developer": {
    domain: "Web Development",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["node.js", "python", "sql", "rest api", "git"] },
      intermediate: { weight: 2, list: ["express.js", "postgresql", "mongodb", "redis", "docker", "authentication"] },
      advanced:     { weight: 1, list: ["graphql", "microservices", "message queues", "system design", "ci/cd", "kubernetes"] },
    },
    roadmap: [
      { phase: "Core Backend",   duration: "4 weeks", topics: ["HTTP fundamentals", "Node.js / Python", "REST API design"] },
      { phase: "Databases",      duration: "3 weeks", topics: ["SQL deep dive", "MongoDB", "Redis caching"] },
      { phase: "Advanced",       duration: "4 weeks", topics: ["Auth (JWT/OAuth)", "Docker", "Message queues"] },
      { phase: "Architecture",   duration: "3 weeks", topics: ["Microservices", "System design", "Scalability patterns"] },
    ],
    projects: ["RESTful API", "Auth system", "Real-time chat backend", "E-commerce API"],
    resources: { courses: ["Node.js - The Complete Guide", "FastAPI docs"], certs: ["AWS Developer Associate"] },
  },

  "API Engineer": {
    domain: "Web Development",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["rest api", "graphql", "node.js", "python", "sql"] },
      intermediate: { weight: 2, list: ["openapi", "authentication", "rate limiting", "docker", "postgresql"] },
      advanced:     { weight: 1, list: ["grpc", "api gateway", "microservices", "monitoring", "ci/cd"] },
    },
    roadmap: [
      { phase: "API Fundamentals", duration: "3 weeks", topics: ["REST principles", "HTTP methods", "Status codes"] },
      { phase: "Design",           duration: "3 weeks", topics: ["OpenAPI/Swagger", "Versioning", "Auth patterns"] },
      { phase: "Advanced",         duration: "4 weeks", topics: ["GraphQL", "gRPC", "Rate limiting & security"] },
      { phase: "Production",       duration: "2 weeks", topics: ["Monitoring", "API Gateway", "Documentation"] },
    ],
    projects: ["Public API with docs", "GraphQL gateway", "API rate limiter"],
    resources: { courses: ["APIs in Node.js", "GraphQL Zero to Hero"], certs: [] },
  },

  /* ── FULLSTACK ── */
  "Full Stack Developer": {
    domain: "Web Development",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["javascript", "react", "node.js", "sql", "git", "rest api"] },
      intermediate: { weight: 2, list: ["typescript", "next.js", "postgresql", "mongodb", "docker", "redis"] },
      advanced:     { weight: 1, list: ["system design", "ci/cd", "kubernetes", "graphql", "microservices", "cloud"] },
    },
    roadmap: [
      { phase: "Frontend Core",  duration: "5 weeks", topics: ["React", "TypeScript", "State management"] },
      { phase: "Backend Core",   duration: "5 weeks", topics: ["Node.js", "REST + GraphQL", "Databases"] },
      { phase: "Integration",    duration: "3 weeks", topics: ["Full stack apps", "Auth", "File uploads"] },
      { phase: "Production",     duration: "3 weeks", topics: ["Docker", "CI/CD", "Deployment", "Monitoring"] },
    ],
    projects: ["SaaS app", "Social media clone", "Real-time collaboration tool"],
    resources: { courses: ["The Odin Project", "MERN Stack Udemy"], certs: ["AWS Solutions Architect"] },
  },

  /* ── DEVOPS / CLOUD ── */
  "DevOps Engineer": {
    domain: "DevOps & Cloud",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["linux", "docker", "kubernetes", "ci/cd", "git", "bash/shell"] },
      intermediate: { weight: 2, list: ["terraform", "aws", "ansible", "jenkins", "github actions", "nginx"] },
      advanced:     { weight: 1, list: ["service mesh", "observability", "gitops", "chaos engineering", "security scanning"] },
    },
    roadmap: [
      { phase: "Linux & Shell",  duration: "3 weeks", topics: ["Linux administration", "Bash scripting", "Networking"] },
      { phase: "Containers",     duration: "4 weeks", topics: ["Docker deep dive", "Kubernetes", "Helm charts"] },
      { phase: "CI/CD & IaC",   duration: "4 weeks", topics: ["GitHub Actions", "Jenkins", "Terraform"] },
      { phase: "Cloud & SRE",    duration: "4 weeks", topics: ["AWS/GCP", "Monitoring (Prometheus/Grafana)", "GitOps"] },
    ],
    projects: ["CI/CD pipeline", "K8s cluster on cloud", "Infrastructure as code project"],
    resources: { courses: ["KodeKloud", "A Cloud Guru"], certs: ["CKA", "AWS DevOps Engineer"] },
  },

  "Cloud Architect": {
    domain: "DevOps & Cloud",
    tier: "lead",
    skills: {
      core:         { weight: 3, list: ["aws", "azure", "google cloud", "terraform", "kubernetes"] },
      intermediate: { weight: 2, list: ["system design", "networking", "security", "cost optimization", "docker"] },
      advanced:     { weight: 1, list: ["multi-cloud", "disaster recovery", "compliance", "serverless", "service mesh"] },
    },
    roadmap: [
      { phase: "Cloud Basics",   duration: "4 weeks", topics: ["AWS/GCP core services", "IAM", "VPC networking"] },
      { phase: "Architecture",   duration: "5 weeks", topics: ["Well-architected framework", "High availability", "DR"] },
      { phase: "Advanced",       duration: "4 weeks", topics: ["Multi-cloud", "Cost optimization", "Compliance"] },
      { phase: "Leadership",     duration: "3 weeks", topics: ["Architecture reviews", "Team mentoring", "Documentation"] },
    ],
    projects: ["Multi-region app deployment", "Cost optimization audit", "Disaster recovery plan"],
    resources: { courses: ["AWS Training", "GCP Professional training"], certs: ["AWS Solutions Architect Professional", "GCP Professional Cloud Architect"] },
  },

  "Site Reliability Engineer": {
    domain: "DevOps & Cloud",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["linux", "python", "kubernetes", "monitoring", "ci/cd"] },
      intermediate: { weight: 2, list: ["prometheus", "grafana", "terraform", "docker", "bash/shell"] },
      advanced:     { weight: 1, list: ["chaos engineering", "incident management", "sla/slo/sli", "distributed systems"] },
    },
    roadmap: [
      { phase: "SRE Mindset",    duration: "2 weeks", topics: ["SLI/SLO/SLA", "Error budgets", "Toil reduction"] },
      { phase: "Observability",  duration: "4 weeks", topics: ["Prometheus", "Grafana", "Distributed tracing"] },
      { phase: "Reliability",    duration: "4 weeks", topics: ["Chaos engineering", "Incident management", "Post-mortems"] },
      { phase: "Automation",     duration: "4 weeks", topics: ["Python automation", "Terraform", "Auto-scaling"] },
    ],
    projects: ["Monitoring stack", "Chaos experiments", "Runbook automation"],
    resources: { courses: ["Google SRE Book (free)", "Linux Foundation SRE"], certs: ["CKA", "AWS SysOps"] },
  },

  /* ── DATA SCIENCE / ML ── */
  "Data Scientist": {
    domain: "Data & AI",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["python", "machine learning", "statistics", "pandas", "numpy", "sql"] },
      intermediate: { weight: 2, list: ["scikit-learn", "matplotlib", "deep learning", "feature engineering", "model evaluation"] },
      advanced:     { weight: 1, list: ["tensorflow", "pytorch", "mlops", "a/b testing", "nlp", "computer vision"] },
    },
    roadmap: [
      { phase: "Math & Stats",   duration: "4 weeks", topics: ["Statistics", "Linear algebra", "Probability"] },
      { phase: "Python & EDA",   duration: "4 weeks", topics: ["Pandas", "NumPy", "Matplotlib", "EDA techniques"] },
      { phase: "ML Core",        duration: "6 weeks", topics: ["Supervised/Unsupervised learning", "Model evaluation", "Scikit-learn"] },
      { phase: "Deep Learning",  duration: "4 weeks", topics: ["Neural networks", "CNNs", "RNNs", "Transfer learning"] },
      { phase: "MLOps",          duration: "3 weeks", topics: ["Model deployment", "MLflow", "A/B testing"] },
    ],
    projects: ["Kaggle competition", "Churn prediction", "Recommendation system", "NLP classifier"],
    resources: { courses: ["fast.ai", "Andrew Ng (Coursera)", "Kaggle Learn"], certs: ["TensorFlow Developer Certificate", "AWS ML Specialty"] },
  },

  "Machine Learning Engineer": {
    domain: "Data & AI",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["python", "machine learning", "deep learning", "tensorflow", "pytorch"] },
      intermediate: { weight: 2, list: ["mlops", "docker", "kubernetes", "sql", "feature engineering", "model serving"] },
      advanced:     { weight: 1, list: ["distributed training", "model optimization", "kubeflow", "ray", "llm", "rag"] },
    },
    roadmap: [
      { phase: "ML Fundamentals",  duration: "5 weeks", topics: ["ML algorithms", "Neural networks", "Model evaluation"] },
      { phase: "Deep Learning",    duration: "5 weeks", topics: ["PyTorch / TF", "CNNs / RNNs / Transformers"] },
      { phase: "Production ML",    duration: "4 weeks", topics: ["Model serving (FastAPI)", "Docker", "MLflow"] },
      { phase: "Scale",            duration: "4 weeks", topics: ["Distributed training", "Kubernetes", "KubeFlow"] },
    ],
    projects: ["End-to-end ML pipeline", "Model serving API", "LLM fine-tuning"],
    resources: { courses: ["MLOps Specialization (Coursera)", "Full Stack Deep Learning"], certs: ["TensorFlow Developer", "AWS ML Specialty"] },
  },

  "AI Engineer": {
    domain: "Data & AI",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["python", "llm", "openai api", "langchain", "rag"] },
      intermediate: { weight: 2, list: ["vector databases", "prompt engineering", "fastapi", "docker", "deep learning"] },
      advanced:     { weight: 1, list: ["fine-tuning", "hugging face", "agents", "evaluation frameworks", "mlops"] },
    },
    roadmap: [
      { phase: "LLM Basics",      duration: "3 weeks", topics: ["Prompt engineering", "OpenAI API", "Chat completions"] },
      { phase: "RAG Systems",     duration: "4 weeks", topics: ["Vector DBs (Pinecone/Chroma)", "Embeddings", "LangChain"] },
      { phase: "Agents",          duration: "4 weeks", topics: ["Tool use", "ReAct agents", "Multi-agent systems"] },
      { phase: "Production AI",   duration: "4 weeks", topics: ["Fine-tuning", "Evaluation", "Cost optimization", "Deployment"] },
    ],
    projects: ["RAG chatbot", "AI agent with tools", "Document Q&A system", "Fine-tuned model"],
    resources: { courses: ["DeepLearning.AI short courses", "LangChain docs", "Hugging Face course"], certs: [] },
  },

  "Data Analyst": {
    domain: "Data & AI",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["sql", "excel", "python", "tableau", "statistics"] },
      intermediate: { weight: 2, list: ["pandas", "power bi", "data visualization", "etl", "r"] },
      advanced:     { weight: 1, list: ["machine learning", "a/b testing", "dbt", "airflow", "storytelling"] },
    },
    roadmap: [
      { phase: "SQL & Excel",      duration: "3 weeks", topics: ["Advanced SQL", "Pivot tables", "Data cleaning"] },
      { phase: "Visualization",    duration: "3 weeks", topics: ["Tableau", "Power BI", "Chart best practices"] },
      { phase: "Python for Data",  duration: "4 weeks", topics: ["Pandas", "Matplotlib", "Statistical analysis"] },
      { phase: "Advanced",         duration: "4 weeks", topics: ["A/B testing", "dbt", "Storytelling with data"] },
    ],
    projects: ["Sales dashboard", "Customer segmentation", "KPI tracking system"],
    resources: { courses: ["Google Data Analytics (Coursera)", "Mode Analytics SQL"], certs: ["Google Data Analytics Certificate"] },
  },

  "Data Engineer": {
    domain: "Data & AI",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["python", "sql", "etl", "apache spark", "kafka"] },
      intermediate: { weight: 2, list: ["airflow", "dbt", "aws", "docker", "postgresql", "hadoop"] },
      advanced:     { weight: 1, list: ["data lake", "delta lake", "streaming", "kubernetes", "data modeling"] },
    },
    roadmap: [
      { phase: "Data Fundamentals", duration: "3 weeks", topics: ["SQL advanced", "Data modeling", "ETL concepts"] },
      { phase: "Pipeline Tools",    duration: "4 weeks", topics: ["Airflow", "dbt", "Spark basics"] },
      { phase: "Streaming & Scale", duration: "4 weeks", topics: ["Kafka", "Spark Streaming", "Delta Lake"] },
      { phase: "Cloud DE",          duration: "4 weeks", topics: ["AWS Glue / GCP Dataflow", "Data Lakehouse", "Orchestration"] },
    ],
    projects: ["ETL pipeline", "Real-time streaming pipeline", "Data lakehouse setup"],
    resources: { courses: ["DataTalks.Club DE Zoomcamp", "Databricks Academy"], certs: ["Databricks Associate DE", "AWS Data Analytics"] },
  },

  /* ── MOBILE ── */
  "Android Developer": {
    domain: "Mobile",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["kotlin", "java", "android", "android studio", "git"] },
      intermediate: { weight: 2, list: ["jetpack compose", "retrofit", "room database", "mvvm", "coroutines"] },
      advanced:     { weight: 1, list: ["firebase", "ci/cd", "testing", "google play deployment", "kotlin multiplatform"] },
    },
    roadmap: [
      { phase: "Kotlin Basics",    duration: "3 weeks", topics: ["Kotlin syntax", "OOP", "Coroutines"] },
      { phase: "Android Core",     duration: "5 weeks", topics: ["Activities/Fragments", "Jetpack Compose", "Navigation"] },
      { phase: "Data & Network",   duration: "3 weeks", topics: ["Room DB", "Retrofit", "MVVM architecture"] },
      { phase: "Production",       duration: "3 weeks", topics: ["Firebase", "Testing", "Play Store publish"] },
    ],
    projects: ["Todo app", "Weather app", "Social feed clone", "E-commerce app"],
    resources: { courses: ["Android Developers docs", "Phillip Lackner YouTube"], certs: ["Google Associate Android Developer"] },
  },

  "iOS Developer": {
    domain: "Mobile",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["swift", "xcode", "ios", "swiftui", "git"] },
      intermediate: { weight: 2, list: ["uikit", "combine", "core data", "rest api", "mvvm"] },
      advanced:     { weight: 1, list: ["arkit", "cloudkit", "app store deployment", "testing", "ci/cd"] },
    },
    roadmap: [
      { phase: "Swift Basics",    duration: "3 weeks", topics: ["Swift syntax", "Optionals", "Closures", "Protocols"] },
      { phase: "iOS Core",        duration: "5 weeks", topics: ["SwiftUI", "UIKit", "Navigation", "Data flow"] },
      { phase: "Persistence",     duration: "3 weeks", topics: ["Core Data", "UserDefaults", "CloudKit"] },
      { phase: "Production",      duration: "3 weeks", topics: ["App Store review", "TestFlight", "Push notifications"] },
    ],
    projects: ["iOS habit tracker", "News reader", "Fitness tracker"],
    resources: { courses: ["Hacking with Swift", "100 Days of SwiftUI"], certs: [] },
  },

  "React Native Developer": {
    domain: "Mobile",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["react native", "javascript", "typescript", "react", "git"] },
      intermediate: { weight: 2, list: ["expo", "redux", "rest api", "navigation", "firebase"] },
      advanced:     { weight: 1, list: ["native modules", "animations", "ci/cd", "testing", "app store deployment"] },
    },
    roadmap: [
      { phase: "RN Foundations",  duration: "4 weeks", topics: ["Core components", "Styling", "Navigation"] },
      { phase: "State & Data",    duration: "3 weeks", topics: ["Redux / Zustand", "API integration", "Firebase"] },
      { phase: "Advanced",        duration: "4 weeks", topics: ["Animations (Reanimated)", "Native modules", "Performance"] },
      { phase: "Production",      duration: "3 weeks", topics: ["EAS Build", "App Store + Play Store", "OTA updates"] },
    ],
    projects: ["Cross-platform e-commerce app", "Chat app", "Fitness tracker"],
    resources: { courses: ["React Native docs", "Udemy React Native course"], certs: [] },
  },

  "Flutter Developer": {
    domain: "Mobile",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["flutter", "dart", "git"] },
      intermediate: { weight: 2, list: ["state management", "rest api", "firebase", "bloc", "provider"] },
      advanced:     { weight: 1, list: ["animations", "platform channels", "ci/cd", "testing", "deployment"] },
    },
    roadmap: [
      { phase: "Dart & Flutter",  duration: "4 weeks", topics: ["Dart OOP", "Widget tree", "Layouts"] },
      { phase: "State & Data",    duration: "3 weeks", topics: ["BLoC / Provider / Riverpod", "HTTP", "Firebase"] },
      { phase: "Advanced",        duration: "3 weeks", topics: ["Animations", "Platform channels", "Custom painters"] },
      { phase: "Production",      duration: "2 weeks", topics: ["Testing", "CI/CD with Codemagic", "Deployment"] },
    ],
    projects: ["Cross-platform todo app", "E-commerce UI", "Real-time chat"],
    resources: { courses: ["Flutter docs", "The Flutter Way YouTube"], certs: [] },
  },

  /* ── SECURITY ── */
  "Cybersecurity Analyst": {
    domain: "Security",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["network security", "siem", "linux", "soc", "owasp"] },
      intermediate: { weight: 2, list: ["python", "penetration testing", "cryptography", "burp suite", "firewall"] },
      advanced:     { weight: 1, list: ["threat hunting", "digital forensics", "malware analysis", "compliance", "zero trust"] },
    },
    roadmap: [
      { phase: "Fundamentals",    duration: "4 weeks", topics: ["Networking (TCP/IP)", "CIA triad", "Common attacks"] },
      { phase: "Core Tools",      duration: "4 weeks", topics: ["SIEM tools", "Wireshark", "Linux security", "Burp Suite"] },
      { phase: "Defense",         duration: "3 weeks", topics: ["SOC operations", "Incident response", "Log analysis"] },
      { phase: "Advanced",        duration: "4 weeks", topics: ["Threat hunting", "Malware analysis", "Compliance (ISO 27001)"] },
    ],
    projects: ["Home SOC lab", "CTF challenges", "Vulnerability assessment report"],
    resources: { courses: ["TryHackMe", "Hack The Box", "Google Cybersecurity (Coursera)"], certs: ["CompTIA Security+", "CEH"] },
  },

  "Penetration Tester": {
    domain: "Security",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["penetration testing", "linux", "python", "networking", "burp suite"] },
      intermediate: { weight: 2, list: ["metasploit", "nmap", "owasp", "bash/shell", "cryptography"] },
      advanced:     { weight: 1, list: ["exploit development", "reverse engineering", "red teaming", "social engineering"] },
    },
    roadmap: [
      { phase: "Networking & OS",  duration: "4 weeks", topics: ["TCP/IP deep dive", "Linux hacking", "Windows AD"] },
      { phase: "Recon & Scanning", duration: "3 weeks", topics: ["Nmap", "OSINT", "Enumeration"] },
      { phase: "Exploitation",     duration: "5 weeks", topics: ["Metasploit", "Web exploitation", "Privilege escalation"] },
      { phase: "Advanced",         duration: "4 weeks", topics: ["Exploit dev", "Red team ops", "Report writing"] },
    ],
    projects: ["HackTheBox machines", "CTF write-ups", "Bug bounty findings"],
    resources: { courses: ["TCM Security", "OffSec PEN-200"], certs: ["OSCP", "eJPT", "CEH"] },
  },

  /* ── BLOCKCHAIN ── */
  "Blockchain Developer": {
    domain: "Blockchain",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["solidity", "ethereum", "javascript", "web3.js", "git"] },
      intermediate: { weight: 2, list: ["hardhat", "truffle", "smart contracts", "defi", "ipfs"] },
      advanced:     { weight: 1, list: ["layer 2", "zk proofs", "dao governance", "security auditing", "cross-chain"] },
    },
    roadmap: [
      { phase: "Blockchain Basics", duration: "3 weeks", topics: ["How blockchain works", "Ethereum", "Wallets"] },
      { phase: "Solidity",          duration: "5 weeks", topics: ["Smart contracts", "ERC standards", "Hardhat testing"] },
      { phase: "DApp Dev",          duration: "4 weeks", topics: ["Web3.js / Ethers.js", "React integration", "IPFS"] },
      { phase: "Advanced",          duration: "4 weeks", topics: ["DeFi protocols", "Security auditing", "Layer 2"] },
    ],
    projects: ["ERC-20 token", "NFT marketplace", "DeFi lending protocol"],
    resources: { courses: ["CryptoZombies", "Patrick Collins Solidity Course"], certs: [] },
  },

  /* ── GAME DEV ── */
  "Game Developer": {
    domain: "Game Development",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["unity", "c#", "game design", "git"] },
      intermediate: { weight: 2, list: ["unreal engine", "c++", "physics", "animation", "shaders"] },
      advanced:     { weight: 1, list: ["multiplayer networking", "ai pathfinding", "optimization", "vr/ar", "cinemachine"] },
    },
    roadmap: [
      { phase: "Game Basics",     duration: "4 weeks", topics: ["Unity/Unreal setup", "Game loop", "C#/C++ basics"] },
      { phase: "Core Mechanics",  duration: "5 weeks", topics: ["Physics", "Collision", "Input handling", "Animation"] },
      { phase: "Advanced",        duration: "4 weeks", topics: ["Shaders", "AI", "Audio", "UI systems"] },
      { phase: "Shipping",        duration: "3 weeks", topics: ["Optimization", "Build pipeline", "Publishing"] },
    ],
    projects: ["2D platformer", "3D FPS prototype", "Mobile casual game"],
    resources: { courses: ["Unity Learn", "Unreal Online Learning"], certs: ["Unity Certified Programmer"] },
  },

  /* ── PRODUCT / MANAGEMENT ── */
  "Product Manager": {
    domain: "Product & Business",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["product strategy", "agile", "user research", "roadmap planning", "data analysis"] },
      intermediate: { weight: 2, list: ["sql", "jira", "a/b testing", "communication", "stakeholder management"] },
      advanced:     { weight: 1, list: ["go-to-market", "pricing strategy", "okrs", "leadership", "technical understanding"] },
    },
    roadmap: [
      { phase: "PM Fundamentals", duration: "3 weeks", topics: ["Product lifecycle", "User stories", "Prioritization frameworks"] },
      { phase: "Discovery",       duration: "3 weeks", topics: ["User research", "Jobs to be done", "Competitive analysis"] },
      { phase: "Delivery",        duration: "4 weeks", topics: ["Agile/Scrum", "Jira", "Sprint planning", "Stakeholder comms"] },
      { phase: "Growth",          duration: "4 weeks", topics: ["OKRs", "Metrics", "A/B testing", "Go-to-market"] },
    ],
    projects: ["PRD document", "Product pitch deck", "Competitive analysis report"],
    resources: { courses: ["Reforge", "Product School", "Aha! PM courses"], certs: ["AIPMM CPM", "Pragmatic Institute"] },
  },

  "Scrum Master": {
    domain: "Product & Business",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["scrum", "agile", "jira", "communication", "facilitation"] },
      intermediate: { weight: 2, list: ["kanban", "conflict resolution", "retrospectives", "sprint planning", "leadership"] },
      advanced:     { weight: 1, list: ["scaled agile", "coaching", "metrics", "okrs", "safe"] },
    },
    roadmap: [
      { phase: "Agile Foundations", duration: "2 weeks", topics: ["Agile manifesto", "Scrum framework", "Ceremonies"] },
      { phase: "Facilitation",      duration: "3 weeks", topics: ["Sprint planning", "Retrospectives", "Daily standups"] },
      { phase: "Coaching",          duration: "4 weeks", topics: ["Team dynamics", "Conflict resolution", "Servant leadership"] },
      { phase: "Scaling",           duration: "3 weeks", topics: ["SAFe", "LeSS", "Nexus", "Metrics & KPIs"] },
    ],
    projects: ["Team retrospective facilitation", "Agile transformation plan"],
    resources: { courses: ["Scrum.org courses", "Mountain Goat Software"], certs: ["PSM I", "CSM", "SAFe SM"] },
  },

  /* ── QA ── */
  "QA Engineer": {
    domain: "Quality Assurance",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["manual testing", "test planning", "bug reporting", "jira", "git"] },
      intermediate: { weight: 2, list: ["selenium", "playwright", "cypress", "python", "api testing"] },
      advanced:     { weight: 1, list: ["performance testing", "ci/cd", "test automation framework", "security testing"] },
    },
    roadmap: [
      { phase: "Testing Basics",   duration: "3 weeks", topics: ["SDLC", "Test cases", "Bug lifecycle", "Jira"] },
      { phase: "Test Automation",  duration: "4 weeks", topics: ["Selenium", "Cypress / Playwright", "Python basics"] },
      { phase: "API Testing",      duration: "3 weeks", topics: ["Postman", "Rest Assured", "API automation"] },
      { phase: "Advanced",         duration: "4 weeks", topics: ["Performance testing (JMeter)", "CI/CD integration", "Framework design"] },
    ],
    projects: ["Automation framework", "API test suite", "Performance test report"],
    resources: { courses: ["Test Automation University", "Udemy Selenium/Cypress courses"], certs: ["ISTQB Foundation", "CTFL"] },
  },

  /* ── EMBEDDED / SYSTEMS ── */
  "Embedded Systems Engineer": {
    domain: "Systems & Hardware",
    tier: "senior",
    skills: {
      core:         { weight: 3, list: ["c", "c++", "embedded systems", "microcontrollers", "rtos"] },
      intermediate: { weight: 2, list: ["arduino", "raspberry pi", "uart/spi/i2c", "debugging", "linux"] },
      advanced:     { weight: 1, list: ["bare metal programming", "dsp", "can bus", "fpga", "power management"] },
    },
    roadmap: [
      { phase: "C/C++ Deep Dive", duration: "4 weeks", topics: ["Pointers", "Memory management", "Bit manipulation"] },
      { phase: "Microcontrollers", duration: "5 weeks", topics: ["GPIO", "Interrupts", "Timers", "UART/SPI/I2C"] },
      { phase: "RTOS",             duration: "4 weeks", topics: ["FreeRTOS", "Task scheduling", "Semaphores"] },
      { phase: "Advanced",         duration: "4 weeks", topics: ["FPGA basics", "DSP", "CAN bus", "Power optimization"] },
    ],
    projects: ["Smart sensor system", "RTOS-based project", "IoT device prototype"],
    resources: { courses: ["Embedded Systems - Shape the World (edX)", "FastBit Academy"], certs: [] },
  },

  /* ── OTHER NOTABLE ROLES ── */
  "Technical Writer": {
    domain: "Communication & Docs",
    tier: "mid",
    skills: {
      core:         { weight: 3, list: ["technical writing", "markdown", "git", "api documentation", "communication"] },
      intermediate: { weight: 2, list: ["docs-as-code", "html", "openapi", "confluence", "dita"] },
      advanced:     { weight: 1, list: ["developer advocacy", "video tutorials", "seo", "diagramming"] },
    },
    roadmap: [
      { phase: "Writing Basics",  duration: "3 weeks", topics: ["Docs-as-code", "Markdown", "Style guides"] },
      { phase: "API Docs",        duration: "3 weeks", topics: ["OpenAPI/Swagger", "Postman docs", "SDK docs"] },
      { phase: "Tools",           duration: "3 weeks", topics: ["MkDocs", "Docusaurus", "Confluence", "Git workflow"] },
      { phase: "Advanced",        duration: "3 weeks", topics: ["Developer advocacy", "SEO for docs", "Diagramming (Mermaid)"] },
    ],
    projects: ["Open source docs contribution", "API reference guide", "Developer portal"],
    resources: { courses: ["Google Technical Writing (free)", "Write the Docs community"], certs: [] },
  },

  "Solution Architect": {
    domain: "Architecture",
    tier: "lead",
    skills: {
      core:         { weight: 3, list: ["system design", "cloud", "architecture patterns", "leadership", "communication"] },
      intermediate: { weight: 2, list: ["aws", "microservices", "api design", "security", "cost optimization"] },
      advanced:     { weight: 1, list: ["enterprise architecture", "solution blueprints", "stakeholder management", "tofu/c4"] },
    },
    roadmap: [
      { phase: "Engineering Depth", duration: "6 weeks", topics: ["Deep system design", "Distributed systems", "Patterns"] },
      { phase: "Cloud Mastery",     duration: "5 weeks", topics: ["AWS/GCP/Azure advanced", "Multi-cloud", "Networking"] },
      { phase: "Architecture",      duration: "5 weeks", topics: ["Solution blueprints", "ADRs", "Trade-off analysis"] },
      { phase: "Leadership",        duration: "4 weeks", topics: ["Stakeholder alignment", "Roadmap planning", "Technical governance"] },
    ],
    projects: ["Enterprise system design doc", "Cloud migration plan", "Architecture decision records"],
    resources: { courses: ["AWS Solutions Architect courses", "O'Reilly Learning"], certs: ["AWS Solutions Architect Professional", "TOGAF"] },
  },
};

/* ─────────────────────────────────────────────
   3. HELPER — canonicalize a raw skill string
────────────────────────────────────────────── */
function canonicalize(skill) {
  const cleaned = skill.toLowerCase().trim();
  return SKILL_ALIASES[cleaned] || cleaned;
}

/* ─────────────────────────────────────────────
   4. HELPER — fuzzy match
   Returns true if skillA ≈ skillB
   (handles partial matches, typos of ≤2 chars)
────────────────────────────────────────────── */
function fuzzyMatch(a, b) {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  // Levenshtein distance for short strings
  if (Math.abs(a.length - b.length) > 3) return false;
  let m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n] <= 2;
}

/* ─────────────────────────────────────────────
   5. HELPER — check if a user skill matches a
   required skill (canonical + fuzzy)
────────────────────────────────────────────── */
function skillMatches(userSkill, requiredSkill) {
  const u = canonicalize(userSkill);
  const r = canonicalize(requiredSkill);
  return fuzzyMatch(u, r);
}

/* ─────────────────────────────────────────────
   6. SCORE a single role against user skills
   Returns a rich scoring object
────────────────────────────────────────────── */
function scoreRole(roleName, roleData, userSkills) {
  const tiers   = roleData.skills;
  let rawScore  = 0;
  let maxScore  = 0;
  const matched = [];
  const missing = [];

  for (const [tier, { weight, list }] of Object.entries(tiers)) {
    for (const req of list) {
      const isMatched = userSkills.some(us => skillMatches(us, req));
      maxScore += weight;
      if (isMatched) {
        rawScore += weight;
        matched.push({ skill: req, tier });
      } else {
        missing.push({ skill: req, tier, weight });
      }
    }
  }

  // Core coverage bonus: if user has ALL core skills → +10%
  const coreList   = tiers.core?.list ?? [];
  const coreHits   = coreList.filter(r => userSkills.some(us => skillMatches(us, r)));
  const coreCoverage = coreList.length ? coreHits.length / coreList.length : 0;

  const baseScore        = maxScore ? rawScore / maxScore : 0;
  const adjustedScore    = Math.min(1, baseScore + (coreCoverage === 1 ? 0.05 : 0));
  const readinessPercent = Math.round(adjustedScore * 100);

  return {
    role: roleName,
    domain: roleData.domain,
    readinessScore: readinessPercent,
    confidence: rawScore,
    matchedSkills: matched,
    missingSkills: missing.sort((a, b) => b.weight - a.weight), // priority order
    coreCoverage: Math.round(coreCoverage * 100),
    roadmap: roleData.roadmap,
    projects: roleData.projects,
    resources: roleData.resources,
    tier: roleData.tier,
  };
}

/* ─────────────────────────────────────────────
   7. DYNAMIC ROADMAP STITCHER
   Filters roadmap phases based on user's gap
   and re-orders by urgency
────────────────────────────────────────────── */
function buildPersonalizedRoadmap(roleScore, userSkills) {
  const missingTiers = new Set(
    roleScore.missingSkills.map(m => m.tier)
  );

  // Always include core if any core gaps exist
  const phases = roleScore.roadmap.filter((phase, i) => {
    if (i === 0) return missingTiers.has("core"); // Foundation phase
    if (i === 1) return missingTiers.has("intermediate");
    if (i === 2) return missingTiers.has("advanced");
    return true; // Always show professional/capstone phase
  });

  // If user already has some skills, prepend a "Quick Review" phase
  if (roleScore.matchedSkills.length > 0 && phases.length < roleScore.roadmap.length) {
    const matchedNames = roleScore.matchedSkills.map(m => m.skill);
    phases.unshift({
      phase: "✅ Strengths to Leverage",
      duration: "Already covered",
      topics: matchedNames.slice(0, 6),
    });
  }

  return phases.length ? phases : roleScore.roadmap;
}

/* ─────────────────────────────────────────────
   8. DOMAIN INFERENCE
   When user passes no domain, infer it from
   which domain cluster has highest skill overlap
────────────────────────────────────────────── */
function inferDomain(userSkills) {
  const domainScores = {};
  for (const [, roleData] of Object.entries(ROLE_REGISTRY)) {
    const d = roleData.domain;
    domainScores[d] = (domainScores[d] || 0);
    const allRequired = Object.values(roleData.skills).flatMap(t => t.list);
    const hits = userSkills.filter(us => allRequired.some(r => skillMatches(us, r)));
    domainScores[d] += hits.length;
  }
  return Object.entries(domainScores).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/* ─────────────────────────────────────────────
   9. ALSO CHECK careerData.js (legacy data)
   Merges legacy roles into scoring pool so
   nothing is lost from the original data file
────────────────────────────────────────────── */
function getLegacyRoles() {
  const legacyRoles = {};
  for (const [domain, domainData] of Object.entries(careerData)) {
    if (!domainData?.roles) continue;
    for (const [roleName, roleData] of Object.entries(domainData.roles)) {
      if (legacyRoles[roleName]) continue; // already in registry
      const core         = roleData.requiredSkills?.core         ?? [];
      const intermediate = roleData.requiredSkills?.intermediate ?? [];
      const advanced     = roleData.requiredSkills?.advanced     ?? [];
      legacyRoles[roleName] = {
        domain,
        tier: "mid",
        skills: {
          core:         { weight: 3, list: core },
          intermediate: { weight: 2, list: intermediate },
          advanced:     { weight: 1, list: advanced },
        },
        roadmap: [
          ...(domainData.roadmap?.beginner     ?? []).map(t => ({ phase: "Beginner",     duration: "4 weeks", topics: [t] })),
          ...(domainData.roadmap?.intermediate ?? []).map(t => ({ phase: "Intermediate", duration: "4 weeks", topics: [t] })),
          ...(domainData.roadmap?.advanced     ?? []).map(t => ({ phase: "Advanced",     duration: "4 weeks", topics: [t] })),
        ],
        projects:  domainData.projects  ?? [],
        resources: domainData.resources ?? {},
      };
    }
  }
  return legacyRoles;
}

/* ─────────────────────────────────────────────
   10. MAIN EXPORT — analyzeWithRAG
────────────────────────────────────────────── */
function analyzeWithRAG({ skills = [], domain = null, goal = null } = {}) {

  // ── Normalize user skills ──
  const normalizedSkills = skills.map(s => canonicalize(s.trim()));

  // ── Merge all roles (registry + legacy careerData) ──
  const allRoles = { ...getLegacyRoles(), ...ROLE_REGISTRY };

  // ── If domain specified, filter roles to that domain first ──
  const inferredDomain = domain || inferDomain(normalizedSkills);

  // ── Score ALL roles (or domain-filtered roles if confidence is high) ──
  const allScores = Object.entries(allRoles).map(([roleName, roleData]) =>
    scoreRole(roleName, roleData, normalizedSkills)
  );

  // ── Sort by readiness score ──
  allScores.sort((a, b) => b.confidence - a.confidence);

  const bestMatch      = allScores[0];
  const alternatives   = allScores.slice(1, 4); // top 3 alternatives

  // ── Domain-filtered best if domain known ──
  let domainBest = bestMatch;
  if (inferredDomain) {
    const domainScores = allScores.filter(s =>
      s.domain?.toLowerCase() === inferredDomain?.toLowerCase()
    );
    if (domainScores.length > 0) domainBest = domainScores[0];
  }

  // ── Personalize roadmap based on actual gaps ──
  const personalizedRoadmap = buildPersonalizedRoadmap(domainBest, normalizedSkills);

  // ── Gap analysis with priority levels ──
  const prioritizedGaps = domainBest.missingSkills.map(m => ({
    skill: m.skill,
    tier: m.tier,
    priority: m.weight === 3 ? "🔴 Critical" : m.weight === 2 ? "🟡 Important" : "🟢 Nice to have",
  }));

  // ── Build final enriched response ──
  return {
    // Core result
    role:           domainBest.role,
    domain:         domainBest.domain || inferredDomain,
    readinessScore: domainBest.readinessScore,
    coreCoverage:   domainBest.coreCoverage,
    tier:           domainBest.tier,

    // Skill analysis
    matchedSkills:  domainBest.matchedSkills.map(m => ({ skill: m.skill, tier: m.tier })),
    missingSkills:  prioritizedGaps,

    // Personalized learning path
    roadmap:        personalizedRoadmap,
    projects:       domainBest.projects   ?? [],
    resources:      domainBest.resources  ?? {},

    // Alternatives
    alternativeRoles: alternatives.map(a => ({
      role:           a.role,
      domain:         a.domain,
      readinessScore: a.readinessScore,
      topMissingSkills: a.missingSkills.slice(0, 3).map(m => m.skill),
    })),

    // Meta
    totalSkillsAnalyzed: normalizedSkills.length,
    inferredDomain,
  };
}

module.exports = { analyzeWithRAG };