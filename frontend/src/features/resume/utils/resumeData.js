export const cleanResumeData = (resume) => {
  if (!resume) return null;
  const r = resume.resume || resume;
  const personalInfo = r.personal_info || r.contact || {};

  const personal = {
    name: personalInfo.name || resume.name || r.name || "",
    title: r.headline || personalInfo.title || resume.role || "",
    email: personalInfo.email || "",
    phone: personalInfo.phone || "",
    location: personalInfo.location || "",
    linkedin: personalInfo.linkedin || "",
    github: personalInfo.github || "",
    website: personalInfo.website || "",
  };

  const summaryText = r.summary?.text || r.summary || "";

  const skillsList = (r.skills || []).map((s, idx) =>
    typeof s === "string"
      ? { id: idx, name: s }
      : { id: s.id || idx, name: s.name || "" },
  );

  const experienceList = (r.experience || r.work_experience || []).map(
    (e, idx) => ({
      id: e.id || idx,
      role: e.role || "",
      company: e.company || "",
      location: e.location || "",
      startYear: e.startYear || e.start_year || "",
      endYear: e.endYear || e.end_year || "",
      current:
        e.current ||
        e.endYear === "present" ||
        e.end_year === "present" ||
        false,
      bullets: Array.isArray(e.bullets)
        ? e.bullets
        : Array.isArray(e.description)
          ? e.description
          : e.description
            ? [e.description]
            : [],
    }),
  );

  const educationList = (r.education || []).map((e, idx) => ({
    id: e.id || idx,
    degree: e.degree || "",
    school: e.school || e.institution || "",
    gpa: e.gpa || "",
    endYear: e.endYear || e.end_year || "",
  }));

  const projectsList = (r.projects || []).map((p, idx) => ({
    id: p.id || idx,
    name: p.name || p.title || "",
    tech:
      p.tech ||
      (Array.isArray(p.technologies)
        ? p.technologies.join(" · ")
        : p.technologies || ""),
    url: p.url || p.github || p.live || p.link || "",
    desc:
      p.desc ||
      (Array.isArray(p.description)
        ? p.description.join("\n")
        : p.description || ""),
  }));
  console.log("cleanResumeData personal =", personal);

  return {
    raw: r,
    personal,
    summaryText,
    skillsList,
    experienceList,
    educationList,
    projectsList,
  };
};
