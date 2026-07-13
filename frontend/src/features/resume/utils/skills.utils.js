export const classifySkill = (skill) => {
  const s = skill.trim().toLowerCase();
  if (!s) return null;

  // AI / GenAI
  if (
    s === "llm" ||
    s === "llms" ||
    s === "rag" ||
    s === "langchain" ||
    s === "huggingface" ||
    s === "hugging face" ||
    s === "ollama" ||
    s === "openai" ||
    s === "gpt" ||
    s === "gpt-4" ||
    s === "llama" ||
    s === "claude" ||
    s === "gemini" ||
    s.includes("prompt engineering") ||
    s.includes("generative ai") ||
    s === "genai" ||
    s === "gen ai"
  ) {
    return "AI / GenAI";
  }

  // Cloud
  if (
    s === "aws" ||
    s === "gcp" ||
    s === "azure" ||
    s.includes("google cloud") ||
    s.includes("amazon web services") ||
    s.includes("microsoft azure") ||
    s === "vercel" ||
    s === "render" ||
    s === "netlify" ||
    s === "heroku" ||
    s === "s3" ||
    s === "ec2" ||
    s === "rds" ||
    s === "lambda" ||
    s === "redshift" ||
    s === "glue" ||
    s === "athena"
  ) {
    return "Cloud";
  }

  // DevOps & Tools
  if (
    s === "docker" ||
    s === "kubernetes" ||
    s === "k8s" ||
    s === "git" ||
    s === "github" ||
    s === "gitlab" ||
    s === "linux" ||
    s === "jenkins" ||
    s === "ansible" ||
    s === "terraform" ||
    s === "circleci" ||
    s === "travis" ||
    s === "jira" ||
    s === "confluence" ||
    s.includes("ci/cd") ||
    s.includes("devops") ||
    s === "unix" ||
    s === "bash" ||
    s === "shell" ||
    s === "prometheus" ||
    s === "grafana"
  ) {
    return "DevOps & Tools";
  }

  // Databases
  if (
    s === "postgresql" ||
    s === "postgres" ||
    s === "mysql" ||
    s === "sqlite" ||
    s === "mongodb" ||
    s === "mongo" ||
    s === "redis" ||
    s === "firebase" ||
    s === "oracle" ||
    s === "sql server" ||
    s === "mssql" ||
    s === "cassandra" ||
    s === "mariadb" ||
    s === "dynamodb" ||
    s === "elasticsearch" ||
    s === "neo4j" ||
    s.includes("database") ||
    s.includes("warehous") ||
    s === "db" ||
    s === "dbt" ||
    s.includes("snowflake") ||
    s.includes("bigquery") ||
    s.includes("databricks")
  ) {
    return "Databases";
  }

  // Frontend
  if (
    s === "react" ||
    s === "react.js" ||
    s === "reactjs" ||
    s === "vue" ||
    s === "vue.js" ||
    s === "vuejs" ||
    s === "angular" ||
    s === "angularjs" ||
    s === "next.js" ||
    s === "nextjs" ||
    s === "nuxt" ||
    s === "html" ||
    s === "html5" ||
    s === "css" ||
    s === "css3" ||
    s === "tailwind" ||
    s === "tailwind css" ||
    s === "tailwindcss" ||
    s === "bootstrap" ||
    s === "sass" ||
    s === "less" ||
    s === "jquery" ||
    s === "webpack" ||
    s === "vite" ||
    s === "redux" ||
    s === "sass/scss" ||
    s.includes("frontend")
  ) {
    return "Frontend";
  }

  // Backend
  if (
    s === "fastapi" ||
    s === "flask" ||
    s === "django" ||
    s === "node" ||
    s === "node.js" ||
    s === "nodejs" ||
    s === "express" ||
    s === "express.js" ||
    s === "spring" ||
    s === "spring boot" ||
    s === "springboot" ||
    s === "laravel" ||
    s === "rails" ||
    s === "ruby on rails" ||
    s.includes("rest api") ||
    s.includes("restful api") ||
    s === "graphql" ||
    s === "grpc" ||
    s.includes("microservices") ||
    s.includes("backend")
  ) {
    return "Backend";
  }

  // Programming Languages
  if (
    s === "python" ||
    s === "javascript" ||
    s === "js" ||
    s === "typescript" ||
    s === "ts" ||
    s === "sql" ||
    s === "java" ||
    s === "c#" ||
    s === "c++" ||
    s === "ruby" ||
    s === "go" ||
    s === "golang" ||
    s === "rust" ||
    s === "php" ||
    s === "r" ||
    s === "swift" ||
    s === "kotlin" ||
    s === "scala" ||
    s === "perl" ||
    s === "c" ||
    s === "haskell" ||
    s === "matlab"
  ) {
    return "Programming Languages";
  }

  // AI / GenAI (fallback substring check)
  if (
    s.includes("deep learning") ||
    s.includes("machine learning") ||
    s.includes("neural network") ||
    s.includes("nlp") ||
    s.includes("computer vision") ||
    s.includes("pytorch") ||
    s.includes("tensorflow") ||
    s.includes("keras") ||
    s.includes("scikit") ||
    s.includes("artificial intelligence") ||
    s.includes("gen ai")
  ) {
    return "AI / GenAI";
  }

  // DevOps & Tools / Cloud (fallback substring check)
  if (
    s.includes("cloud") ||
    s.includes("pipeline") ||
    s.includes("spark") ||
    s.includes("hadoop")
  ) {
    return "Cloud";
  }

  // Frameworks & Libraries (generic frameworks / testing / libs)
  if (
    s.includes("framework") ||
    s.includes("library") ||
    s.includes("test") ||
    s.includes("junit") ||
    s.includes("jest") ||
    s.includes("cypress") ||
    s.includes("mocha") ||
    s.includes("selenium")
  ) {
    return "Frameworks & Libraries";
  }

  return "Other Skills";
};

export const getTechnicalSkills = (resumeData) => {
  const r = resumeData?.resume || resumeData || {};
  const allSkills = [];

  // Extract from flat skills list
  if (Array.isArray(r.skills)) {
    r.skills.forEach((s) => {
      const name = typeof s === "string" ? s : s?.name;
      if (name) allSkills.push(name);
    });
  }

  // Extract from structured technicalSkills
  if (Array.isArray(r.technicalSkills)) {
    r.technicalSkills.forEach((cat) => {
      if (Array.isArray(cat?.skills)) {
        cat.skills.forEach((s) => {
          const name = typeof s === "string" ? s : s?.name;
          if (name) allSkills.push(name);
        });
      }
    });
  }

  const categoryBuckets = {};

  allSkills.forEach((skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const cat = classifySkill(trimmed);
    if (!cat) return;

    if (!categoryBuckets[cat]) {
      categoryBuckets[cat] = new Set();
    }
    categoryBuckets[cat].add(trimmed);
  });

  const sortedCategories = [];

  const ORDERED_CATEGORIES = [
    "Programming Languages",
    "Frontend",
    "Backend",
    "Databases",
    "AI / GenAI",
    "Cloud",
    "DevOps & Tools",
    "Frameworks & Libraries",
    "Other Skills",
  ];

  ORDERED_CATEGORIES.forEach((cat) => {
    if (categoryBuckets[cat] && categoryBuckets[cat].size > 0) {
      const sortedSkills = Array.from(categoryBuckets[cat]).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
      sortedCategories.push({
        category: cat,
        skills: sortedSkills,
      });
    }
  });

  Object.keys(categoryBuckets).forEach((cat) => {
    if (!ORDERED_CATEGORIES.includes(cat) && categoryBuckets[cat].size > 0) {
      const sortedSkills = Array.from(categoryBuckets[cat]).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" }),
      );
      sortedCategories.push({
        category: cat,
        skills: sortedSkills,
      });
    }
  });

  if (sortedCategories.length === 0) {
    return [];
  }

  return sortedCategories;
};
