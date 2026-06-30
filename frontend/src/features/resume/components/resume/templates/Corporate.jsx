import React from "react";
import ResumeSkillRenderer from "./ResumeSkillRenderer";

export default function Corporate({ resume }) {
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

    const primaryColor = "#0f172a";
    const accentColor = "#0369a1";

    return (
        <div
            className="bg-white text-slate-800 text-[10.5px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
            <div className="p-9 space-y-5">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
                            {personal.name || "Your Name"}
                        </h1>
                        <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: accentColor }}>
                            {personal.title || "Your Title"}
                        </p>
                    </div>
                    <div className="text-right text-[9.5px] text-slate-500 space-y-0.5">
                        {personal.email && <p className="font-medium">{personal.email}</p>}
                        {personal.phone && <p>{personal.phone}</p>}
                        {personal.location && <p>{personal.location}</p>}
                        {(personal.linkedin || personal.github) && (
                            <p className="text-slate-400">
                                {personal.linkedin ? "LinkedIn" : ""} {personal.linkedin && personal.github ? "·" : ""} {personal.github ? "GitHub" : ""}
                            </p>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {summaryText && (
                    <div className="space-y-1.5">
                        <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: primaryColor }}>
                            Executive Summary
                        </h2>
                        <p className="text-slate-600 text-justify">
                            {summaryText}
                        </p>
                    </div>
                )}

                {/* Skills */}
                <ResumeSkillRenderer resume={r} variant="corporate" primaryColor={primaryColor} accentColor={accentColor} />


                {/* Experience */}
                {experienceList.length > 0 && (
                    <div className="space-y-3">
                        <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: primaryColor }}>
                            Professional Experience
                        </h2>
                        <div className="space-y-4">
                            {experienceList.map((e) => (
                                <div key={e.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline font-bold">
                                        <span className="text-[11px]" style={{ color: primaryColor }}>
                                            {e.role} <span className="font-medium text-slate-400">| {e.company}</span>
                                        </span>
                                        <span className="text-[9px] text-slate-400 shrink-0">
                                            {e.startYear} – {e.current ? "Present" : e.endYear}
                                        </span>
                                    </div>
                                    <ul className="space-y-1 pl-3 list-disc text-slate-600 text-justify">
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
                    <div className="space-y-3">
                        <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: primaryColor }}>
                            Selected Projects
                        </h2>
                        <div className="space-y-3">
                            {projectsList.map((p) => (
                                <div key={p.id} className="space-y-0.5">
                                    <p className="font-bold text-[10.5px]" style={{ color: primaryColor }}>
                                        {p.name} {p.tech && <span className="font-normal text-slate-400">({p.tech})</span>}
                                    </p>
                                    {p.desc && <p className="text-slate-600 text-justify">{p.desc}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {educationList.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-xs font-black uppercase tracking-wider" style={{ color: primaryColor }}>
                            Education
                        </h2>
                        <div className="space-y-2">
                            {educationList.map((e) => (
                                <div key={e.id} className="flex justify-between items-baseline text-slate-600">
                                    <p>
                                        <span className="font-bold text-slate-900">{e.degree}</span>
                                        {e.school ? ` / ${e.school}` : ""}
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
