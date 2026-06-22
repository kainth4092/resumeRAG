export default function ResumeTemplate({ resume }) {
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

    const summaryText = r.summary || "";

    const skillsList = (r.skills || []).map((s, idx) =>
        typeof s === "string" ? { id: idx, name: s } : { id: s.id || idx, name: s.name || "" }
    );

    const experienceList = (r.experience || r.work_experience || []).map((e, idx) => ({
        id: e.id || idx,
        role: e.role || "",
        company: e.company || "",
        location: e.location || "",
        startYear: e.startYear || e.start_year || "",
        endYear: e.endYear || e.end_year || "",
        current: e.current || e.endYear === "present" || e.end_year === "present" || false,
        bullets: Array.isArray(e.bullets)
            ? e.bullets
            : (Array.isArray(e.description) ? e.description : (e.description ? [e.description] : [])),
    }));

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
        tech: p.tech || (Array.isArray(p.technologies) ? p.technologies.join(" · ") : p.technologies || ""),
        url: p.url || p.github || p.live || p.link || "",
        desc: p.desc || (Array.isArray(p.description) ? p.description.join("\n") : p.description || ""),
    }));

    const color = r.color || resume.color || "#7C3AED";

    return (
        <div
            className="bg-white text-gray-900 text-[11px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
            style={{ fontFamily: "Inter, sans-serif" }}
        >
            <div className="h-1" style={{ backgroundColor: color }} />
            <div className="p-8">
                <div className="mb-4 pb-4 border-b border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900">
                        {personal.name || "Your Name"}
                    </h1>
                    <p className="text-xs mt-0.5 font-medium" style={{ color }}>
                        {personal.title || "Your Title"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] text-gray-500">
                        {personal.email && <span>{personal.email}</span>}
                        {personal.phone && (
                            <>
                                <span>·</span>
                                <span>{personal.phone}</span>
                            </>
                        )}
                        {personal.location && (
                            <>
                                <span>·</span>
                                <span>{personal.location}</span>
                            </>
                        )}
                        {personal.linkedin && (
                            <>
                                <span>·</span>
                                <span>{personal.linkedin}</span>
                            </>
                        )}
                        {personal.github && (
                            <>
                                <span>·</span>
                                <span>{personal.github}</span>
                            </>
                        )}
                        {personal.website && (
                            <>
                                <span>·</span>
                                <span>{personal.website}</span>
                            </>
                        )}
                    </div>
                </div>

                {summaryText && (
                    <div className="mb-4">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                            style={{ color }}
                        >
                            Summary
                        </p>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {summaryText}
                        </p>
                    </div>
                )}

                {skillsList.length > 0 && (
                    <div className="mb-4">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                            style={{ color }}
                        >
                            Skills
                        </p>
                        <p className="text-gray-700">
                            {skillsList.map((s) => s.name).join(" · ")}
                        </p>
                    </div>
                )}

                {experienceList.length > 0 && (
                    <div className="mb-4">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-2"
                            style={{ color }}
                        >
                            Experience
                        </p>
                        <div className="space-y-3">
                            {experienceList.map((e) => (
                                <div key={e.id}>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {e.role || "Role"}
                                            </p>
                                            <p className="text-gray-600">
                                                {e.company}
                                                {e.location ? ` · ${e.location}` : ""}
                                            </p>
                                        </div>
                                        <p className="text-gray-500 text-right flex-shrink-0">
                                            {e.startYear ? `${e.startYear}` : ""}
                                            {e.endYear
                                                ? ` – ${e.current ? "Present" : e.endYear}`
                                                : ""}
                                        </p>
                                    </div>
                                    <ul className="mt-1 space-y-0.5">
                                        {e.bullets
                                            ?.filter(Boolean)
                                            .map((b, i) => (
                                                <li key={i} className="flex gap-1.5 text-gray-700">
                                                    <span style={{ color }} className="flex-shrink-0">
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
                    <div className="mb-4">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                            style={{ color }}
                        >
                            Projects
                        </p>
                        {projectsList.map((p) => (
                            <div key={p.id} className="mb-2">
                                <p className="font-semibold text-gray-900">
                                    {p.name}{" "}
                                    {p.url && (
                                        <span className="font-normal text-gray-500">— {p.url}</span>
                                    )}
                                </p>
                                {p.tech && <p className="text-gray-600">{p.tech}</p>}
                                {p.desc && (
                                    <p className="text-gray-700 whitespace-pre-line">{p.desc}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {educationList.length > 0 && (
                    <div className="mb-4">
                        <p
                            className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                            style={{ color }}
                        >
                            Education
                        </p>
                        {educationList.map((e) => (
                            <div key={e.id} className="flex items-start justify-between">
                                <div>
                                    <p className="font-semibold text-gray-900">{e.degree}</p>
                                    <p className="text-gray-600">
                                        {e.school}
                                        {e.gpa ? ` · GPA ${e.gpa}` : ""}
                                    </p>
                                </div>
                                <p className="text-gray-500">{e.endYear}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}