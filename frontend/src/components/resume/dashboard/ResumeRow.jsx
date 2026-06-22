export default function ResumePreviewContent({ resume }) {
  const r = resume?.resume || {};
  const personalInfo = r.personal_info || {};

  const name = personalInfo.name || resume?.name || "Untitled Resume";
  const role = r.headline || personalInfo.title || resume?.role || "Software Engineer";
  const email = personalInfo.email || "";
  const location = personalInfo.location || "";
  const phone = personalInfo.phone || "";
  const linkedin = personalInfo.linkedin || "";
  const github = personalInfo.github || "";

  const summary = r.summary || "";

  const experienceList = r.experience || [];
  const skillsList = r.skills || [];
  const educationList = r.education || [];
  const projectsList = r.projects || [];

  const themeColor = resume?.color || "#7C3AED";

  return (
    <div
      className="bg-white text-gray-900 min-h-[900px] font-sans text-left printable-resume"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="h-1.5" style={{ backgroundColor: themeColor }} />

      <div className="p-10">

        <div className="mb-6 pb-5 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {name}
          </h1>
          <p className="text-base mt-1 font-semibold" style={{ color: themeColor }}>
            {role}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-gray-500">
            {email && <span>{email}</span>}
            {phone && (
              <>
                {email && <span>·</span>}
                <span>{phone}</span>
              </>
            )}
            {location && (
              <>
                {(email || phone) && <span>·</span>}
                <span>{location}</span>
              </>
            )}
            {linkedin && (
              <>
                {(email || phone || location) && <span>·</span>}
                <span>{linkedin}</span>
              </>
            )}
            {github && (
              <>
                {(email || phone || location || linkedin) && <span>·</span>}
                <span>{github}</span>
              </>
            )}
          </div>
        </div>

        {summary && (
          <div className="mb-6">
            <h2
              className="text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ color: themeColor }}
            >
              Summary
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {summary}
            </p>
          </div>
        )}

        {skillsList.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: themeColor }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((s) => (
                <span
                  key={s}
                  className="text-[11px] px-2.5 py-1 rounded-md text-gray-700 bg-gray-100 border border-gray-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {experienceList.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ color: themeColor }}
            >
              Experience
            </h2>
            <div className="space-y-4">
              {experienceList.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {exp.role}
                      </p>
                      <p className="text-xs text-gray-600">{exp.company}</p>
                    </div>
                    <span className="text-[11px] text-gray-500 flex-shrink-0 mt-0.5">
                      {exp.duration || `${exp.start_year || ""} – ${exp.end_year || "Present"}`}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {(Array.isArray(exp.description) ? exp.description : [exp.description]).filter(Boolean).map((b, i) => (
                      <li key={i} className="text-xs text-gray-700 flex gap-2">
                        <span
                          className="flex-shrink-0 mt-0.5"
                          style={{ color: themeColor }}
                        >
                          •
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {projectsList.length > 0 && (
          <div className="mb-6">
            <h2
              className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: themeColor }}
            >
              Projects
            </h2>
            <div className="space-y-3">
              {projectsList.map((project, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {project.title}
                    </p>
                    {(project.github || project.live || project.link) && (
                      <a
                        href={project.github || project.live || project.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] hover:underline"
                        style={{ color: themeColor }}
                      >
                        {project.github || project.live || project.link}
                      </a>
                    )}
                  </div>
                  {project.technologies?.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1 mb-1">
                      <strong>Tech Stack:</strong> {Array.isArray(project.technologies) ? project.technologies.join(", ") : project.technologies}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {(Array.isArray(project.description) ? project.description : [project.description]).filter(Boolean).map((d, i) => (
                      <li key={i} className="text-xs text-gray-700 leading-relaxed">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {educationList.length > 0 && (
          <div>
            <h2
              className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
              style={{ color: themeColor }}
            >
              Education
            </h2>
            <div className="space-y-3">
              {educationList.map((edu, idx) => (
                <div key={idx} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {edu.degree}
                    </p>
                    <p className="text-xs text-gray-600">{edu.institution || edu.school}</p>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {edu.duration || `${edu.start_year || ""} – ${edu.end_year || ""}`}
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
