const careerData = {
  "Web Development": {
    roles: {
      "Frontend Developer": {
        requiredSkills: {
          core: ["html", "css", "javascript"],
          intermediate: ["react"],
          advanced: ["nextjs"],
        },
      },
      "Full Stack Developer": {
        requiredSkills: {
          core: ["html", "css", "javascript"],
          intermediate: ["react", "node"],
          advanced: ["docker", "aws"],
        },
      },
    },
    roadmap: {
      beginner: ["Learn HTML, CSS, JS"],
      intermediate: ["Learn React, Node"],
      advanced: ["Deploy apps"],
    },
    projects: [
      { title: "Portfolio Website" },
      { title: "Full Stack App" },
    ],
  },
};

module.exports = careerData;