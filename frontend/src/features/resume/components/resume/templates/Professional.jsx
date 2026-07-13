import ResumeSkillRenderer from "./ResumeSkillRenderer";

export default function Professional({ resume }) {
  if (!resume) return null;

  const r = resume.resume || resume;
  const personalInfo = r.personal_info || {};
  const personal = {
    name: personalInfo.name || resume.name || "",
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

  const primaryColor = "#224b7a"; // Professional Image Blue

  // Header metadata construction
  const topSkills = skillsList
    .slice(0, 5)
    .map((s) => s.name)
    .join(" | ");
  const infoLine = [
    r.years_experience ? `${r.years_experience}+ Years` : "",
    personal.title || r.headline || "",
    topSkills || "",
  ]
    .filter(Boolean)
    .join(" | ");

  const contactLine = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
  ]
    .filter(Boolean)
    .join(" | ");

  return (
    <div
      className="bg-white text-black text-[10px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
      style={{
        fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
      }}
    >
      <div className="p-10 space-y-5">
        {/* Centered Name and Contact Header */}
        <div className="text-center space-y-1">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: primaryColor }}
          >
            {personal.name || "Your Name"}
          </h1>
          <p className="text-sm font-semibold tracking-wide text-gray-800">
            {personal.title || r.headline || "Professional"}
          </p>
          <p className="text-[9px] font-medium text-gray-700 max-w-3xl mx-auto leading-normal">
            {infoLine}
          </p>
          <p className="text-[9.5px] font-medium text-gray-600">
            {contactLine}
          </p>
        </div>

        {/* PROFILE Section */}
        {summaryText && (
          <div className="space-y-1">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              PROFILE
            </h2>
            <hr className="border-t border-gray-300" />
            <p className="text-justify text-gray-800 leading-relaxed pt-1">
              {summaryText}
            </p>
          </div>
        )}

        {/* CORE TECHNICAL SKILLS Section */}
        <ResumeSkillRenderer
          resume={r}
          variant="professional"
          primaryColor={primaryColor}
        />

        {experienceList.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              PROFESSIONAL EXPERIENCE
            </h2>
            <hr className="border-t border-gray-300" />
            <div className="space-y-3 pt-1">
              {experienceList.map((e) => (
                <div key={e.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span
                      className="font-bold text-[10.5px]"
                      style={{ color: primaryColor }}
                    >
                      {e.company} {e.location ? `— ${e.location}` : ""}
                    </span>
                    <span className="text-[9px] font-semibold text-gray-600">
                      {e.startYear} – {e.current ? "Present" : e.endYear}
                    </span>
                  </div>
                  <div className="font-bold text-[10px] text-gray-900 italic">
                    {e.role}
                  </div>
                  <ul className="list-disc pl-4 space-y-1">
                    {e.bullets?.filter(Boolean).map((bullet, i) => (
                      <li
                        key={i}
                        className="text-justify text-gray-800 leading-relaxed"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {projectsList.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              PROJECT EXPERIENCE
            </h2>
            <hr className="border-t border-gray-300" />
            <div className="space-y-3 pt-1">
              {projectsList.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span
                      className="font-bold text-[10.5px]"
                      style={{ color: primaryColor }}
                    >
                      {p.name} {p.tech ? `(${p.tech})` : ""}
                    </span>
                    {p.url && (
                      <span className="text-[9px] text-gray-500 italic">
                        {p.url}
                      </span>
                    )}
                  </div>
                  {p.desc && (
                    <ul className="list-disc pl-4 space-y-1">
                      {p.desc
                        .split("\n")
                        .filter(Boolean)
                        .map((line, i) => (
                          <li
                            key={i}
                            className="text-gray-800 leading-relaxed text-justify"
                          >
                            {line}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION Section */}
        {educationList.length > 0 && (
          <div className="space-y-2">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: primaryColor }}
            >
              EDUCATION
            </h2>
            <hr className="border-t border-gray-300" />
            <div className="space-y-1.5 pt-1">
              {educationList.map((e) => (
                <div
                  key={e.id}
                  className="flex justify-between items-baseline text-gray-800"
                >
                  <div>
                    <span className="font-bold text-gray-900">{e.school}</span>
                    {e.degree ? ` — ${e.degree}` : ""}
                    {e.gpa ? ` (GPA: ${e.gpa})` : ""}
                  </div>
                  <span className="text-[9.5px] font-semibold text-gray-600">
                    {e.endYear}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
