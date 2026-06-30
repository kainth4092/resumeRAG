import React from "react";

// Centralized skill taxonomy mapping
export const classifySkill = (skill) => {
  const s = skill.trim().toLowerCase();
  if (!s) return null;

  // AI / GenAI
  if (
    s === "llm" || s === "llms" || s === "rag" || s === "langchain" || 
    s === "huggingface" || s === "hugging face" || s === "ollama" || 
    s === "openai" || s === "gpt" || s === "gpt-4" || s === "llama" || 
    s === "claude" || s === "gemini" || s.includes("prompt engineering") ||
    s.includes("generative ai") || s === "genai" || s === "gen ai"
  ) {
    return "AI / GenAI";
  }

  // Cloud
  if (
    s === "aws" || s === "gcp" || s === "azure" || s.includes("google cloud") || 
    s.includes("amazon web services") || s.includes("microsoft azure") || 
    s === "vercel" || s === "render" || s === "netlify" || s === "heroku" ||
    s === "s3" || s === "ec2" || s === "rds" || s === "lambda" || s === "redshift" ||
    s === "glue" || s === "athena"
  ) {
    return "Cloud";
  }

  // DevOps & Tools
  if (
    s === "docker" || s === "kubernetes" || s === "k8s" || s === "git" || 
    s === "github" || s === "gitlab" || s === "linux" || s === "jenkins" || 
    s === "ansible" || s === "terraform" || s === "circleci" || s === "travis" || 
    s === "jira" || s === "confluence" || s.includes("ci/cd") || s.includes("devops") ||
    s === "unix" || s === "bash" || s === "shell" || s === "prometheus" || s === "grafana"
  ) {
    return "DevOps & Tools";
  }

  // Databases
  if (
    s === "postgresql" || s === "postgres" || s === "mysql" || s === "sqlite" || 
    s === "mongodb" || s === "mongo" || s === "redis" || s === "firebase" || 
    s === "oracle" || s === "sql server" || s === "mssql" || s === "cassandra" || 
    s === "mariadb" || s === "dynamodb" || s === "elasticsearch" || s === "neo4j" ||
    s.includes("database") || s.includes("warehous") || s === "db" || s === "dbt" ||
    s.includes("snowflake") || s.includes("bigquery") || s.includes("databricks")
  ) {
    return "Databases";
  }

  // Frontend
  if (
    s === "react" || s === "react.js" || s === "reactjs" || s === "vue" || 
    s === "vue.js" || s === "vuejs" || s === "angular" || s === "angularjs" || 
    s === "next.js" || s === "nextjs" || s === "nuxt" || s === "html" || 
    s === "html5" || s === "css" || s === "css3" || s === "tailwind" || 
    s === "tailwind css" || s === "tailwindcss" || s === "bootstrap" || 
    s === "sass" || s === "less" || s === "jquery" || s === "webpack" || 
    s === "vite" || s === "redux" || s === "sass/scss" || s.includes("frontend")
  ) {
    return "Frontend";
  }

  // Backend
  if (
    s === "fastapi" || s === "flask" || s === "django" || s === "node" || 
    s === "node.js" || s === "nodejs" || s === "express" || s === "express.js" || 
    s === "spring" || s === "spring boot" || s === "springboot" || s === "laravel" || 
    s === "rails" || s === "ruby on rails" || s.includes("rest api") || 
    s.includes("restful api") || s === "graphql" || s === "grpc" || 
    s.includes("microservices") || s.includes("backend")
  ) {
    return "Backend";
  }

  // Programming Languages
  if (
    s === "python" || s === "javascript" || s === "js" || s === "typescript" || 
    s === "ts" || s === "sql" || s === "java" || s === "c#" || s === "c++" || 
    s === "ruby" || s === "go" || s === "golang" || s === "rust" || 
    s === "php" || s === "r" || s === "swift" || s === "kotlin" || 
    s === "scala" || s === "perl" || s === "c" || s === "haskell" || s === "matlab"
  ) {
    return "Programming Languages";
  }

  // AI / GenAI (fallback substring check)
  if (
    s.includes("deep learning") || s.includes("machine learning") || 
    s.includes("neural network") || s.includes("nlp") || s.includes("computer vision") || 
    s.includes("pytorch") || s.includes("tensorflow") || s.includes("keras") ||
    s.includes("scikit") || s.includes("artificial intelligence") || s.includes("gen ai")
  ) {
    return "AI / GenAI";
  }

  // DevOps & Tools / Cloud (fallback substring check)
  if (s.includes("cloud") || s.includes("pipeline") || s.includes("spark") || s.includes("hadoop")) {
    return "Cloud";
  }

  // Frameworks & Libraries (generic frameworks / testing / libs)
  if (
    s.includes("framework") || s.includes("library") || s.includes("test") || 
    s.includes("junit") || s.includes("jest") || s.includes("cypress") || 
    s.includes("mocha") || s.includes("selenium")
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
    r.skills.forEach(s => {
      const name = typeof s === "string" ? s : s?.name;
      if (name) allSkills.push(name);
    });
  }

  // Extract from structured technicalSkills
  if (Array.isArray(r.technicalSkills)) {
    r.technicalSkills.forEach(cat => {
      if (Array.isArray(cat?.skills)) {
        cat.skills.forEach(s => {
          const name = typeof s === "string" ? s : s?.name;
          if (name) allSkills.push(name);
        });
      }
    });
  }

  const categoryBuckets = {};

  allSkills.forEach(skill => {
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
    "Other Skills"
  ];

  ORDERED_CATEGORIES.forEach(cat => {
    if (categoryBuckets[cat] && categoryBuckets[cat].size > 0) {
      const sortedSkills = Array.from(categoryBuckets[cat])
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      sortedCategories.push({
        category: cat,
        skills: sortedSkills
      });
    }
  });

  // Pick up any other dynamic categories if any
  Object.keys(categoryBuckets).forEach(cat => {
    if (!ORDERED_CATEGORIES.includes(cat) && categoryBuckets[cat].size > 0) {
      const sortedSkills = Array.from(categoryBuckets[cat])
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      sortedCategories.push({
        category: cat,
        skills: sortedSkills
      });
    }
  });

  // Fallbacks if no skills exist at all
  if (sortedCategories.length === 0) {
    return [
      {
        category: "Programming Languages",
        skills: ["Python", "SQL"]
      },
      {
        category: "Backend",
        skills: ["FastAPI", "REST APIs"]
      },
      {
        category: "Cloud",
        skills: ["AWS", "GCP"]
      }
    ];
  }

  return sortedCategories;
};

// SkillCategory Component - renders inline dot-separated skills
export const SkillCategory = ({ category, skills, variant, primaryColor, accentColor, bodyColor }) => {
  if (variant === "minimal") {
    return (
      <div className="space-y-0.5">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{category}</h4>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-slate-600 font-sans text-[9.5px] leading-relaxed">
          {skills.map((skill, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 select-none">•</span>}
              <span>{skill}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "corporate") {
    return (
      <div className="space-y-1">
        <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider" style={{ color: primaryColor }}>{category}</h4>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-slate-600 font-sans text-[10px] leading-relaxed">
          {skills.map((skill, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 select-none">•</span>}
              <span>{skill}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "ats") {
    return (
      <p className="leading-normal text-gray-950 text-[10px]">
        <span className="font-bold">{category}: </span>
        {skills.join(" • ")}
      </p>
    );
  }

  // Default (Professional)
  return (
    <div className="space-y-1">
      <h4 className="font-bold text-[9.5px] uppercase tracking-wider" style={{ color: primaryColor || "#224b7a" }}>
        {category}
      </h4>
      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-slate-700 font-sans text-[9.5px] leading-relaxed">
        {skills.map((skill, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-300 select-none">•</span>}
            <span>{skill}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const SkillSection = ({ children, variant, primaryColor }) => {
  if (variant === "minimal") {
    return (
      <div className="grid grid-cols-4 gap-4 border-t border-slate-50 pt-4">
        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
          Expertise
        </div>
        <div className="col-span-3 space-y-3">
          {children}
        </div>
      </div>
    );
  }

  if (variant === "corporate") {
    return (
      <div className="space-y-3">
        <h2 className="text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-1" style={{ color: primaryColor || "#334155" }}>
          Key Expertise
        </h2>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    );
  }

  if (variant === "ats") {
    return (
      <div className="space-y-1">
        <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5">Technical Skills</h2>
        <div className="space-y-1 pt-0.5">
          {children}
        </div>
      </div>
    );
  }

  // Default (Professional)
  return (
    <div className="space-y-2">
      <h2 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor || "#224b7a" }}>
        CORE TECHNICAL SKILLS
      </h2>
      <hr className="border-t border-gray-300" />
      <div className="space-y-2 pt-1">
        {children}
      </div>
    </div>
  );
};

export default function ResumeSkillRenderer({ resume, variant, primaryColor, accentColor, bodyColor }) {
  const technicalSkills = getTechnicalSkills(resume);

  if (technicalSkills.length === 0) return null;

  return (
    <SkillSection variant={variant} primaryColor={primaryColor}>
      {technicalSkills.map((cat, idx) => (
        <SkillCategory
          key={idx}
          category={cat.category}
          skills={cat.skills}
          variant={variant}
          primaryColor={primaryColor}
          accentColor={accentColor}
          bodyColor={bodyColor}
        />
      ))}
    </SkillSection>
  );
}
