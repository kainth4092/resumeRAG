/**
 * Canonical Resume Model v1 for Frontend
 * Unified adapter: converts to/from the backend ResumeDoc schema with zero date fabrications.
 */

export function formatDateRange(start, end, current) {
  const cleanStart = start ? String(start).trim() : "";
  const cleanEnd = end ? String(end).trim() : "";

  if (current) {
    return cleanStart ? `${cleanStart} – Present` : "Present";
  }

  if (cleanStart && cleanEnd) {
    return `${cleanStart} – ${cleanEnd}`;
  }

  if (cleanStart) {
    return cleanStart;
  }

  if (cleanEnd) {
    return cleanEnd;
  }

  return "";
}

export function fromApi(doc) {
  if (!doc) return null;

  // Unwrap potential nested envelopes
  const r = doc.resume || doc;
  const rawContact = r.contact || r.personal_info || r.personal || {};

  const personal = {
    name: rawContact.name || doc.name || r.name || "",
    title: r.headline || rawContact.title || doc.role || "",
    email: rawContact.email || "",
    phone: rawContact.phone || "",
    location: rawContact.location || "",
    linkedin: rawContact.linkedin || "",
    github: rawContact.github || "",
    portfolio: rawContact.portfolio || rawContact.website || "",
    website: rawContact.website || rawContact.portfolio || "",
  };

  const summaryText =
    typeof r.summary === "string"
      ? r.summary
      : r.summary?.text || "";

  // Skills
  const rawSkills = r.skills || [];
  const skills = [];
  const skillsList = [];

  if (Array.isArray(rawSkills)) {
    rawSkills.forEach((s, idx) => {
      if (typeof s === "string" && s.trim()) {
        skills.push(s.trim());
        skillsList.push({ id: idx, name: s.trim() });
      } else if (s && typeof s === "object") {
        const name = s.name || s.title || "";
        if (name) {
          skills.push(name);
          skillsList.push({ id: s.id ?? idx, name, level: s.level ?? 80 });
        }
      }
    });
  }

  // Experience
  const rawExperience = r.experience || r.work_experience || [];
  const experience = (Array.isArray(rawExperience) ? rawExperience : []).map(
    (e, idx) => {
      const start = e.start || e.start_year || e.startYear || null;
      const end = e.end || e.end_year || e.endYear || null;
      const isCurrent = Boolean(
        e.current ||
        e.currently_working ||
        String(end).toLowerCase() === "present" ||
        String(end).toLowerCase() === "current"
      );

      let bullets = [];
      if (Array.isArray(e.bullets)) {
        bullets = e.bullets.map(String).filter(Boolean);
      } else if (Array.isArray(e.description)) {
        bullets = e.description.map(String).filter(Boolean);
      } else if (typeof e.description === "string" && e.description.trim()) {
        bullets = e.description.split("\n").map((b) => b.trim()).filter(Boolean);
      }

      return {
        id: e.id ?? idx,
        company: e.company || e.employer || e.organization || "",
        role: e.role || e.title || e.position || "",
        location: e.location || "",
        start: isCurrent && !start ? null : start,
        end: isCurrent ? null : end,
        current: isCurrent,
        duration: formatDateRange(start, isCurrent ? null : end, isCurrent),
        bullets,
      };
    }
  );

  // Projects
  const rawProjects = r.projects || r.user_projects || [];
  const projects = (Array.isArray(rawProjects) ? rawProjects : []).map(
    (p, idx) => {
      let bullets = [];
      if (Array.isArray(p.bullets)) {
        bullets = p.bullets.map(String).filter(Boolean);
      } else if (Array.isArray(p.description)) {
        bullets = p.description.map(String).filter(Boolean);
      } else if (typeof p.desc === "string" && p.desc.trim()) {
        bullets = p.desc.split("\n").map((b) => b.trim()).filter(Boolean);
      } else if (typeof p.description === "string" && p.description.trim()) {
        bullets = p.description.split("\n").map((b) => b.trim()).filter(Boolean);
      }

      let technologies = [];
      if (Array.isArray(p.technologies)) {
        technologies = p.technologies.map(String).filter(Boolean);
      } else if (typeof p.tech === "string" && p.tech.trim()) {
        technologies = p.tech.split(/[,|;·•]/).map((t) => t.trim()).filter(Boolean);
      } else if (typeof p.technologies === "string" && p.technologies.trim()) {
        technologies = p.technologies.split(/[,|;·•]/).map((t) => t.trim()).filter(Boolean);
      }

      const url = p.github_url || p.url || p.github || "";
      const live = p.live_url || p.live || p.demo || "";

      return {
        id: p.id ?? idx,
        name: p.title || p.name || "",
        title: p.title || p.name || "",
        technologies,
        tech: technologies.join(" · "),
        bullets,
        desc: bullets.join("\n"),
        url,
        github_url: url,
        live_url: live,
      };
    }
  );

  // Education
  const rawEducation = r.education || r.user_education || [];
  const education = (Array.isArray(rawEducation) ? rawEducation : []).map(
    (ed, idx) => {
      const start = ed.start || ed.start_year || ed.startYear || null;
      const end = ed.end || ed.end_year || ed.endYear || null;
      const degree = ed.degree || ed.major || "";
      const school = ed.institution || ed.school || ed.university || "";
      const grade = ed.grade || ed.gpa || ed.cgpa || "";

      return {
        id: ed.id ?? idx,
        institution: school,
        school,
        degree,
        start,
        end,
        grade,
        gpa: grade,
        duration: formatDateRange(start, end, false),
      };
    }
  );

  const parseWarnings = Array.isArray(doc.parse_warnings)
    ? doc.parse_warnings
    : (Array.isArray(r.parse_warnings) ? r.parse_warnings : []);

  const suggestedProjects = Array.isArray(doc.suggested_projects)
    ? doc.suggested_projects
    : (Array.isArray(r.suggested_projects) ? r.suggested_projects : []);

  const skillGaps = Array.isArray(doc.skill_gaps)
    ? doc.skill_gaps
    : (Array.isArray(r.skill_gaps) ? r.skill_gaps : []);

  return {
    raw: doc,
    schema_version: 1,
    personal,
    personal_info: personal,
    headline: personal.title,
    summary: summaryText,
    summaryText,
    skills,
    skillsList,
    experience,
    experienceList: experience,
    projects,
    projectsList: projects,
    education,
    educationList: education,
    certifications: r.certifications || [],
    achievements: r.achievements || [],
    languages: r.languages || [],
    parse_warnings: parseWarnings,
    suggested_projects: suggestedProjects,
    skill_gaps: skillGaps,
  };
}

export function toApi(editorState) {
  if (!editorState) return null;

  const personal = editorState.personal || {};

  return {
    schema_version: 1,
    contact: {
      name: personal.name || "",
      email: personal.email || "",
      phone: personal.phone || "",
      location: personal.location || "",
      linkedin: personal.linkedin || "",
      github: personal.github || "",
      portfolio: personal.portfolio || personal.website || "",
    },
    headline: personal.title || editorState.headline || "",
    summary:
      typeof editorState.summary === "string"
        ? editorState.summary
        : editorState.summary?.text || "",
    skills: (editorState.skills || [])
      .map((s) => (typeof s === "string" ? s : s.name || ""))
      .filter(Boolean),
    experience: (editorState.experience || []).map((exp) => ({
      company: exp.company || "",
      role: exp.role || "",
      location: exp.location || "",
      start: exp.start || null,
      end: exp.current ? null : (exp.end || null),
      current: Boolean(exp.current),
      bullets: Array.isArray(exp.bullets)
        ? exp.bullets.filter(Boolean)
        : (exp.description ? [String(exp.description)] : []),
    })),
    projects: (editorState.projects || []).map((proj) => ({
      title: proj.title || proj.name || "",
      bullets: Array.isArray(proj.bullets)
        ? proj.bullets.filter(Boolean)
        : (proj.desc ? [String(proj.desc)] : []),
      technologies: Array.isArray(proj.technologies)
        ? proj.technologies.filter(Boolean)
        : (proj.tech ? proj.tech.split(/[,|;·•]/).map((t) => t.trim()).filter(Boolean) : []),
      github_url: proj.github_url || proj.url || "",
      live_url: proj.live_url || "",
    })),
    education: (editorState.education || []).map((edu) => ({
      institution: edu.institution || edu.school || "",
      degree: edu.degree || "",
      start: edu.start || null,
      end: edu.end || null,
      grade: edu.grade || edu.gpa || "",
    })),
    certifications: editorState.certifications || [],
    achievements: editorState.achievements || [],
    languages: editorState.languages || [],
  };
}

export default {
  fromApi,
  toApi,
  formatDateRange,
};
