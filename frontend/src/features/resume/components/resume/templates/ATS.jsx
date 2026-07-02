import ResumeSkillRenderer from "./ResumeSkillRenderer";

export default function ATS({ resume }) {
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

  const contactInfo = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.website,
  ]
    .filter(Boolean)
    .join("  |  ");

  return (
    <div
      className="bg-white text-black text-[11px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <div className="p-10 space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold uppercase tracking-tight text-black">
            {personal.name || "YOUR NAME"}
          </h1>
          {personal.title && (
            <p className="text-xs font-semibold tracking-wide uppercase text-gray-800">
              {personal.title}
            </p>
          )}
          <p className="text-[10px] text-gray-700">{contactInfo}</p>
        </div>

        {/* Summary */}
        {summaryText && (
          <div className="space-y-1">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Professional Summary
            </h2>
            <p className="text-justify text-gray-900 leading-normal">
              {summaryText}
            </p>
          </div>
        )}

        {/* Skills */}
        <ResumeSkillRenderer resume={r} variant="ats" />

        {/* Experience */}
        {experienceList.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experienceList.map((e) => (
                <div key={e.id} className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold">
                    <span>
                      {e.company}
                      {e.location ? `, ${e.location}` : ""} —{" "}
                      <span className="font-normal italic">{e.role}</span>
                    </span>
                    <span className="text-[10px] font-normal">
                      {e.startYear} – {e.current ? "Present" : e.endYear}
                    </span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {e.bullets?.filter(Boolean).map((bullet, i) => (
                      <li
                        key={i}
                        className="text-justify text-gray-950 leading-normal"
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

        {/* Projects */}
        {projectsList.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Academic & Personal Projects
            </h2>
            <div className="space-y-2">
              {projectsList.map((p) => (
                <div key={p.id} className="space-y-0.5">
                  <div className="flex justify-between items-baseline font-bold">
                    <span>
                      {p.name} {p.tech ? `(${p.tech})` : ""}
                    </span>
                    {p.url && (
                      <span className="text-[9.5px] font-normal italic">
                        {p.url}
                      </span>
                    )}
                  </div>
                  {p.desc && (
                    <ul className="list-disc pl-5 space-y-0.5">
                      {p.desc
                        .split("\n")
                        .filter(Boolean)
                        .map((line, i) => (
                          <li key={i} className="text-gray-950 leading-normal">
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

        {/* Education */}
        {educationList.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5">
              Education
            </h2>
            <div className="space-y-1.5">
              {educationList.map((e) => (
                <div key={e.id} className="flex justify-between items-baseline">
                  <div>
                    <span className="font-bold">{e.school}</span>
                    {e.degree ? ` — ${e.degree}` : ""}
                    {e.gpa ? ` (GPA: ${e.gpa})` : ""}
                  </div>
                  <span className="text-[10px] font-semibold">{e.endYear}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
