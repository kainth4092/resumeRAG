import { describe, it, expect } from "vitest";
import { fromApi, toApi, formatDateRange } from "./resumeModel.js";

describe("resumeModel", () => {
  describe("formatDateRange", () => {
    it("handles current jobs properly", () => {
      expect(formatDateRange("2021", null, true)).toBe("2021 – Present");
      expect(formatDateRange(null, null, true)).toBe("Present");
    });

    it("handles start and end dates", () => {
      expect(formatDateRange("2018", "2021", false)).toBe("2018 – 2021");
    });

    it("handles single dates or empty strings", () => {
      expect(formatDateRange("2020", "", false)).toBe("2020");
      expect(formatDateRange("", "2022", false)).toBe("2022");
      expect(formatDateRange(null, null, false)).toBe("");
    });
  });

  describe("fromApi", () => {
    it("returns null when passed null or undefined", () => {
      expect(fromApi(null)).toBeNull();
      expect(fromApi(undefined)).toBeNull();
    });

    it("normalizes flat API response schema", () => {
      const apiDoc = {
        contact: {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "555-1234",
          location: "San Francisco, CA",
          linkedin: "https://linkedin.com/in/janedoe",
          github: "https://github.com/janedoe",
        },
        headline: "Principal Systems Engineer",
        summary: "Over a decade designing cloud native distributed systems.",
        skills: ["Go", "Kubernetes", { id: 1, name: "Rust", level: 90 }],
        experience: [
          {
            company: "CloudCorp",
            role: "Lead Architect",
            start: "2020",
            end: "Present",
            bullets: ["Designed multi-region failover architecture."],
          },
        ],
        projects: [
          {
            title: "MicroKV",
            technologies: "Rust, Raft, gRPC",
            description: "High performance key-value store.",
            github_url: "https://github.com/janedoe/microkv",
          },
        ],
        education: [
          {
            institution: "UC Berkeley",
            degree: "B.S. in Electrical Engineering & Computer Science",
            start: "2012",
            end: "2016",
            grade: "3.9",
          },
        ],
        parse_warnings: ["Low contrast detected on page 2"],
        suggested_projects: ["Distributed Lock Manager"],
        skill_gaps: ["Zig"],
      };

      const model = fromApi(apiDoc);

      expect(model.personal.name).toBe("Jane Doe");
      expect(model.personal.email).toBe("jane@example.com");
      expect(model.headline).toBe("Principal Systems Engineer");
      expect(model.skills).toContain("Go");
      expect(model.skills).toContain("Rust");
      expect(model.skillsList).toHaveLength(3);

      // Experience checks
      expect(model.experience).toHaveLength(1);
      expect(model.experience[0].company).toBe("CloudCorp");
      expect(model.experience[0].current).toBe(true);
      expect(model.experience[0].bullets).toEqual([
        "Designed multi-region failover architecture.",
      ]);

      // Projects checks
      expect(model.projects).toHaveLength(1);
      expect(model.projects[0].name).toBe("MicroKV");
      expect(model.projects[0].technologies).toEqual(["Rust", "Raft", "gRPC"]);
      expect(model.projects[0].bullets).toEqual(["High performance key-value store."]);

      // Warnings and suggestions
      expect(model.parse_warnings).toContain("Low contrast detected on page 2");
      expect(model.suggested_projects).toContain("Distributed Lock Manager");
      expect(model.skill_gaps).toContain("Zig");
    });

    it("normalizes nested envelope doc.resume and handles missing fields gracefully", () => {
      const nestedEnvelope = {
        resume: {
          personal_info: {
            name: "Nested Alex",
            title: "ML Engineer",
          },
          summary: { text: "Focusing on large language model fine-tuning." },
          skills: ["PyTorch", "Transformers"],
          work_experience: [],
        },
      };

      const model = fromApi(nestedEnvelope);

      expect(model.personal.name).toBe("Nested Alex");
      expect(model.personal.title).toBe("ML Engineer");
      expect(model.summary).toBe("Focusing on large language model fine-tuning.");
      expect(model.skills).toEqual(["PyTorch", "Transformers"]);
      expect(model.experience).toEqual([]);
      expect(model.projects).toEqual([]);
      expect(model.education).toEqual([]);
    });
  });

  describe("toApi", () => {
    it("converts editor state back into canonical ResumeDoc payload format", () => {
      const editorState = {
        personal: {
          name: "Carlos Developer",
          email: "carlos@example.com",
          phone: "+1-202-555-0199",
          location: "Austin, TX",
          title: "Full Stack Engineer",
          linkedin: "https://linkedin.com/in/carlos",
          github: "https://github.com/carlos",
        },
        headline: "Full Stack Engineer",
        summary: "Full stack developer specializing in React and Python.",
        skills: ["React", "FastAPI", "PostgreSQL"],
        experience: [
          {
            company: "Acme Inc.",
            role: "Software Engineer",
            location: "Austin, TX",
            start: "2021",
            end: null,
            current: true,
            bullets: ["Maintained 99.99% uptime on payment service."],
          },
        ],
        projects: [
          {
            title: "Resume Analyzer",
            bullets: ["Built real-time parsing with zero date fabrication."],
            technologies: ["React", "Python"],
            github_url: "https://github.com/carlos/resume-analyzer",
            live_url: "https://carlos-resume.example.com",
          },
        ],
        education: [
          {
            institution: "UT Austin",
            degree: "B.S. Computer Science",
            start: "2017",
            end: "2021",
            grade: "3.8",
          },
        ],
      };

      const apiPayload = toApi(editorState);

      expect(apiPayload.schema_version).toBe(1);
      expect(apiPayload.contact.name).toBe("Carlos Developer");
      expect(apiPayload.contact.email).toBe("carlos@example.com");
      expect(apiPayload.headline).toBe("Full Stack Engineer");
      expect(apiPayload.skills).toEqual(["React", "FastAPI", "PostgreSQL"]);
      expect(apiPayload.experience[0].company).toBe("Acme Inc.");
      expect(apiPayload.experience[0].current).toBe(true);
      expect(apiPayload.experience[0].end).toBeNull();
      expect(apiPayload.projects[0].technologies).toEqual(["React", "Python"]);
      expect(apiPayload.education[0].institution).toBe("UT Austin");
    });

    it("returns null when passed null or undefined", () => {
      expect(toApi(null)).toBeNull();
      expect(toApi(undefined)).toBeNull();
    });
  });
});
