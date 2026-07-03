export const asText = (value) => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return asText(
      value.sample_answer ??
        value.content ??
        value.text ??
        value.answer ??
        value.value ??
        "",
    );
  }
  return String(value);
};

export const estimateMinutes = (value, fallback = 3) => {
  if (!value || typeof value !== "object") return fallback;
  const duration = value.duration;
  if (typeof duration === "number") return duration;
  if (typeof duration !== "string") return fallback;
  const numbers = duration.match(/\d+/g);
  if (!numbers || numbers.length === 0) return fallback;
  const parsed = Number(numbers[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const findTechnicalSkill = (qText) => {
  const text = qText.toLowerCase();

  if (
    text.includes("virtual dom") ||
    text.includes("react hooks") ||
    text.includes("state and props") ||
    text.includes("react")
  ) {
    return "React";
  }
  if (
    text.includes("dependency injection") ||
    text.includes("background tasks") ||
    text.includes("fastapi")
  ) {
    return "FastAPI";
  }
  if (
    text.includes("delete vs truncate") ||
    text.includes("delete and truncate") ||
    text.includes("joins") ||
    text.includes("indexing") ||
    text.includes("postgresql") ||
    text.includes("postgres")
  ) {
    return "PostgreSQL";
  }
  if (
    text.includes("image and container") ||
    text.includes("docker compose") ||
    text.includes("docker volumes") ||
    text.includes("multi-stage builds") ||
    text.includes("docker")
  ) {
    return "Docker";
  }
  if (
    text.includes("oop") ||
    text.includes("list and tuple") ||
    text.includes("decorators") ||
    text.includes("python")
  ) {
    return "Python";
  }

  const techs = [
    "React",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "Docker",
    "JavaScript",
    "TypeScript",
    "HTML",
    "CSS",
    "Node.js",
    "Express",
    "MongoDB",
    "MySQL",
    "Redis",
    "Git",
    "GitHub",
    "AWS",
    "Kubernetes",
    "C++",
    "Java",
    "Go",
    "Ruby",
    "PHP",
    "Scala",
    "Rust",
    "Swift",
    "Kotlin",
    "Angular",
    "Vue",
    "Next.js",
    "Django",
    "Flask",
    "Spring Boot",
    "Alembic",
    "SQL",
  ];

  for (const tech of techs) {
    if (text.includes(tech.toLowerCase())) {
      return tech;
    }
  }

  return "General Technical";
};

export const getProjectName = (qText) => {
  const words = qText.match(/[a-zA-Z0-9]+/g) || [];
  const ignore = new Set([
    "explain",
    "why",
    "what",
    "how",
    "fastapi",
    "python",
    "react",
    "docker",
    "postgresql",
    "jwt",
    "rag",
    "sql",
    "api",
    "rest",
    "json",
    "google",
    "aws",
    "github",
    "git",
    "project",
    "candidate",
    "resume",
    "database",
    "difference",
    "between",
    "your",
    "for",
    "did",
    "you",
    "choose",
    "architecture",
    "implementation",
    "challenges",
    "faced",
    "authentication",
    "validation",
  ]);

  for (const w of words) {
    const lower = w.toLowerCase();
    if (!ignore.has(lower) && w.length > 2) {
      if (w[0] === w[0].toUpperCase()) {
        return w;
      }
    }
  }
  return "CareerSprint";
};

export const getCompanyName = (qText) => {
  const atMatch = qText.match(/at\s+([A-Z][a-zA-Z0-9]+)/i);
  if (atMatch && atMatch[1]) {
    const ignore = new Set([
      "the",
      "explain",
      "why",
      "what",
      "how",
      "fastapi",
      "python",
      "react",
      "docker",
      "postgresql",
      "jwt",
      "rag",
      "sql",
      "api",
      "rest",
      "json",
      "google",
      "aws",
      "github",
      "git",
    ]);
    if (!ignore.has(atMatch[1].toLowerCase())) {
      return atMatch[1];
    }
  }

  const words = qText.match(/[a-zA-Z0-9]+/g) || [];
  const ignore = new Set([
    "explain",
    "why",
    "what",
    "how",
    "fastapi",
    "python",
    "react",
    "docker",
    "postgresql",
    "jwt",
    "rag",
    "sql",
    "api",
    "rest",
    "json",
    "google",
    "aws",
    "github",
    "git",
    "responsibilities",
    "production",
    "issues",
    "optimization",
    "architecture",
    "team",
    "collaboration",
    "experience",
    "company",
    "role",
    "your",
    "at",
    "were",
  ]);

  for (const w of words) {
    const lower = w.toLowerCase();
    if (!ignore.has(lower) && w.length > 2) {
      if (w[0] === w[0].toUpperCase()) {
        return w;
      }
    }
  }
  return "Company Name";
};
