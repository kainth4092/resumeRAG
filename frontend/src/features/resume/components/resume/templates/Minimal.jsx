import ResumeSkillRenderer from "./ResumeSkillRenderer";

export default function Minimal({ resume }) {
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

    const contactFields = [
        personal.email,
        personal.phone,
        personal.location,
        personal.linkedin ? "linkedin.com/in/" + personal.linkedin.split("/").pop() : null,
        personal.github ? "github.com/" + personal.github.split("/").pop() : null
    ].filter(Boolean);

    return (
        <div
            className="bg-white text-slate-700 text-[10px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
            style={{ fontFamily: 'Georgia, serif' }}
        >
            <div className="p-10 space-y-6">
                {/* Header */}
                <div className="border-b border-slate-100 pb-5 space-y-2">
                    <h1 className="text-2xl font-normal tracking-wide text-slate-900">
                        {personal.name || "Your Name"}
                    </h1>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        {personal.title || "Your Title"}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-400 font-sans mt-2">
                        {contactFields.map((f, i) => (
                            <span key={i}>{f}</span>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                {summaryText && (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                            About
                        </div>
                        <div className="col-span-3 text-slate-600 text-justify font-sans leading-relaxed">
                            {summaryText}
                        </div>
                    </div>
                )}

                {/* Skills */}
                <ResumeSkillRenderer resume={r} variant="minimal" />


                {/* Experience */}
                {experienceList.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 border-t border-slate-50 pt-4">
                        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                            Experience
                        </div>
                        <div className="col-span-3 space-y-4">
                            {experienceList.map((e) => (
                                <div key={e.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-bold text-slate-900 text-[10.5px]">
                                            {e.role} <span className="font-normal text-slate-400">at {e.company}</span>
                                        </p>
                                        <span className="text-[9px] text-slate-400 font-sans shrink-0">
                                            {e.startYear} – {e.current ? "Present" : e.endYear}
                                        </span>
                                    </div>
                                    <ul className="space-y-1 mt-1 pl-3 list-disc list-outside font-sans text-slate-600 text-justify">
                                        {e.bullets?.filter(Boolean).map((bullet, i) => (
                                            <li key={i}>{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projectsList.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 border-t border-slate-50 pt-4">
                        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                            Projects
                        </div>
                        <div className="col-span-3 space-y-3 font-sans">
                            {projectsList.map((p) => (
                                <div key={p.id} className="space-y-0.5">
                                    <p className="font-bold text-slate-900 text-[10px]">
                                        {p.name} {p.tech && <span className="font-normal text-slate-400">({p.tech})</span>}
                                    </p>
                                    {p.desc && <p className="text-slate-600 text-justify leading-relaxed">{p.desc}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {educationList.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 border-t border-slate-50 pt-4">
                        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                            Education
                        </div>
                        <div className="col-span-3 space-y-2 font-sans">
                            {educationList.map((e) => (
                                <div key={e.id} className="flex justify-between items-baseline text-slate-600">
                                    <p>
                                        <span className="font-bold text-slate-900">{e.degree}</span>
                                        {e.school ? ` — ${e.school}` : ""}
                                    </p>
                                    <span className="text-[9px] text-slate-400 shrink-0">{e.endYear}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
