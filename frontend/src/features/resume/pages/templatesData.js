export const MOCK_RESUME = {
  personal_info: {
    name: "John Doe",
    title: "Senior Full Stack Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    website: "johndoe.dev",
  },
  headline: "Senior Full Stack Engineer",
  summary:
    "Experienced Full Stack Software Architect and Engineer with a passion for designing scalable web applications, optimizing RAG architectures, and leading agile development teams.",
  skills: [
    "React",
    "Node.js",
    "Python",
    "Go",
    "TypeScript",
    "Next.js",
    "PostgreSQL",
    "Docker",
    "AWS",
    "GraphQL",
    "Tailwind CSS",
    "Redis",
  ],
  experience: [
    {
      role: "Lead Software Architect",
      company: "TechCorp Industries",
      location: "San Francisco, CA",
      startYear: "2022",
      endYear: "Present",
      current: true,
      bullets: [
        "Led engineering team of 15 devs to architect and deploy a core microservices infrastructure, reducing page load times by 40%.",
        "Implemented secure JWT-based OAuth2 authentication and optimized database query performance by 25%.",
        "Designed and implemented high-performance vector search query engine using PostgreSQL pgvector.",
      ],
    },
    {
      role: "Senior Software Engineer",
      company: "AppLabs Co",
      location: "New York, NY",
      startYear: "2019",
      endYear: "2022",
      bullets: [
        "Architected scalable serverless APIs using AWS Lambda and API Gateway, handling over 10M requests daily.",
        "Refactored legacy monolithic applications to Next.js and Tailwind CSS, increasing accessibility scores by 30%.",
      ],
    },
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      school: "Stanford University",
      endYear: "2019",
      gpa: "3.8/4.0",
    },
  ],
  projects: [
    {
      name: "ResuPilot AI Platform",
      tech: "Python · React · FastAPI · pgvector",
      url: "github.com/johndoe/ResuPilot AI",
      desc: "Open-source RAG platform for resume optimizations with automatic ATS scoring and vector retrieval pipelines.",
    },
  ],
};

export const TEMPLATE_METADATA = [
  {
    name: "Professional",
    subtitle: "Clean Corporate",
    description:
      "Sleek, classic corporate layout optimized to maximize readability and pass ATS parser checks. Perfect for software engineers targeting top-tier companies.",
    accent: "#4F46E5",
    accentBg: "#EEF2FF",
    favorited: false,
    selected: true,
    tags: ["ATS Optimized", "1-Page", "Corporate"],
  },
  {
    name: "ATS",
    subtitle: "Maximum Compatibility",
    description:
      "Pure black-and-white, zero decoration, maximum recruiter-system compatibility. The safest bet for any role or industry.",
    accent: "#18181b",
    accentBg: "#f4f4f5",
    favorited: true,
    selected: false,
    tags: ["Black & White", "Max ATS", "Simple"],
  },
  {
    name: "Minimal",
    subtitle: "Sleek & Timeline-first",
    description:
      "Clean typography, light gray tones, and elegant spacing to emphasize summary, skills, and timeline achievements.",
    accent: "#4B5563",
    accentBg: "#f3f4f6",
    favorited: false,
    selected: false,
    tags: ["Timeline", "Sleek", "Classic"],
  },
  {
    name: "Corporate",
    subtitle: "Expertise Grid Block",
    description:
      "Structured deep-slate layout with structured sidebars and grid block of expertise badges.",
    accent: "#334155",
    accentBg: "#f1f5f9",
    favorited: false,
    selected: false,
    tags: ["Structured", "Grid Blocks", "Sleek"],
  },
];
