import React from "react";

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

    // Classify skills into 4 columns matching the reference layout
    const col1 = [];
    const col2 = [];
    const col3 = [];
    const col4 = [];

    skillsList.forEach((s) => {
        const name = s.name.toLowerCase();
        if (
            name.includes("aws") || name.includes("gcp") || name.includes("azure") ||
            name.includes("cloud") || name.includes("pipeline") || name.includes("spark") ||
            name.includes("glue") || name.includes("etl") || name.includes("elt") ||
            name.includes("stream") || name.includes("lake") || name.includes("warehouse")
        ) {
            col1.push(s.name);
        } else if (
            name.includes("python") || name.includes("sql") || name.includes("db") ||
            name.includes("postgres") || name.includes("mongo") || name.includes("redis") ||
            name.includes("java") || name.includes("c#") || name.includes("c++") ||
            name.includes("programming") || name.includes("query") || name.includes("dbt")
        ) {
            col2.push(s.name);
        } else if (
            name.includes("architecture") || name.includes("devops") || name.includes("docker") ||
            name.includes("kubernetes") || name.includes("git") || name.includes("ci/cd") ||
            name.includes("deploy") || name.includes("rest") || name.includes("api") ||
            name.includes("agile") || name.includes("scrum")
        ) {
            col3.push(s.name);
        } else {
            col4.push(s.name);
        }
    });

    const cols = [col1, col2, col3, col4];
    const allAssigned = [...col1, ...col2, ...col3, ...col4];

    // Distribute remaining skills round-robin to keep the table columns balanced
    skillsList.forEach((s) => {
        if (!allAssigned.includes(s.name)) {
            let minIdx = 0;
            let minLen = cols[0].length;
            for (let i = 1; i < 4; i++) {
                if (cols[i].length < minLen) {
                    minLen = cols[i].length;
                    minIdx = i;
                }
            }
            cols[minIdx].push(s.name);
        }
    });

    // Fallbacks if no skills exist
    if (skillsList.length === 0) {
        col1.push("AWS Glue / Glue Studio", "Amazon S3 / Redshift", "Apache Spark / PySpark");
        col2.push("Python Engineering", "Advanced SQL", "PostgreSQL / SQL Server");
        col3.push("Solution Architecture", "Docker / Kubernetes", "CI/CD & GIT");
        col4.push("Data Quality Frameworks", "Data Governance", "Schema Validation");
    }

    const maxRows = Math.max(col1.length, col2.length, col3.length, col4.length);
    const tableRows = Array.from({ length: maxRows });

    const primaryColor = "#224b7a"; // Professional Image Blue

    // Header metadata construction
    const topSkills = skillsList.slice(0, 5).map(s => s.name).join(" | ");
    const infoLine = [
        r.years_experience ? `${r.years_experience}+ Years` : "6.5+ Years",
        personal.title || "Lead Data Engineer",
        topSkills || "AWS Glue | Spark/PySpark | SQL | ETL/ELT | Data Warehousing"
    ].filter(Boolean).join(" | ");

    const contactLine = [
        personal.email,
        personal.phone,
        personal.location,
        personal.linkedin,
        personal.github
    ].filter(Boolean).join(" | ");

    return (
        <div
            className="bg-white text-black text-[10px] leading-relaxed text-left max-w-4xl mx-auto printable-resume shadow-sm border border-border"
            style={{ fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
        >
            <div className="p-10 space-y-5">
                {/* Centered Name and Contact Header */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: primaryColor }}>
                        {personal.name || "Diksha Devi"}
                    </h1>
                    <p className="text-sm font-semibold tracking-wide text-gray-800">
                        {personal.title || "Lead Data Engineer"}
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
                        <h2 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                            PROFILE
                        </h2>
                        <hr className="border-t border-gray-300" />
                        <p className="text-justify text-gray-800 leading-relaxed pt-1">
                            {summaryText}
                        </p>
                    </div>
                )}

                {/* CORE TECHNICAL SKILLS Section */}
                <div className="space-y-1.5">
                    <h2 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                        CORE TECHNICAL SKILLS
                    </h2>
                    <hr className="border-t border-gray-300" />
                    
                    <div className="border border-gray-300 overflow-hidden rounded-sm mt-1">
                        <table className="w-full border-collapse text-[9px] leading-normal">
                            <thead>
                                <tr className="text-white font-bold" style={{ backgroundColor: primaryColor }}>
                                    <th className="border-r border-gray-300 px-2 py-1.5 text-left w-1/4">AWS Cloud & Data Pipelines</th>
                                    <th className="border-r border-gray-300 px-2 py-1.5 text-left w-1/4">Programming, SQL & Databases</th>
                                    <th className="border-r border-gray-300 px-2 py-1.5 text-left w-1/4">Architecture, DevOps & Delivery</th>
                                    <th className="px-2 py-1.5 text-left w-1/4">Governance, Quality & Domain Exposure</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.map((_, rIdx) => (
                                    <tr key={rIdx} className="border-t border-gray-300">
                                        <td className="border-r border-gray-300 px-2 py-1 text-gray-800 valign-top align-top whitespace-pre-wrap">
                                            {col1[rIdx] ? `• ${col1[rIdx]}` : ""}
                                        </td>
                                        <td className="border-r border-gray-300 px-2 py-1 text-gray-800 valign-top align-top whitespace-pre-wrap">
                                            {col2[rIdx] ? `• ${col2[rIdx]}` : ""}
                                        </td>
                                        <td className="border-r border-gray-300 px-2 py-1 text-gray-800 valign-top align-top whitespace-pre-wrap">
                                            {col3[rIdx] ? `• ${col3[rIdx]}` : ""}
                                        </td>
                                        <td className="px-2 py-1 text-gray-800 valign-top align-top whitespace-pre-wrap">
                                            {col4[rIdx] ? `• ${col4[rIdx]}` : ""}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PROFESSIONAL EXPERIENCE Section */}
                {experienceList.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                            PROFESSIONAL EXPERIENCE
                        </h2>
                        <hr className="border-t border-gray-300" />
                        <div className="space-y-3 pt-1">
                            {experienceList.map((e) => (
                                <div key={e.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[10.5px]" style={{ color: primaryColor }}>
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
                                            <li key={i} className="text-justify text-gray-800 leading-relaxed">
                                                {bullet}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PROJECT EXPERIENCE Section */}
                {projectsList.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                            PROJECT EXPERIENCE
                        </h2>
                        <hr className="border-t border-gray-300" />
                        <div className="space-y-3 pt-1">
                            {projectsList.map((p) => (
                                <div key={p.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-[10.5px]" style={{ color: primaryColor }}>
                                            {p.name} {p.tech ? `(${p.tech})` : ""}
                                        </span>
                                        {p.url && <span className="text-[9px] text-gray-500 italic">{p.url}</span>}
                                    </div>
                                    {p.desc && (
                                        <ul className="list-disc pl-4 space-y-1">
                                            {p.desc.split("\n").filter(Boolean).map((line, i) => (
                                                <li key={i} className="text-gray-800 leading-relaxed text-justify">
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
                        <h2 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                            EDUCATION
                        </h2>
                        <hr className="border-t border-gray-300" />
                        <div className="space-y-1.5 pt-1">
                            {educationList.map((e) => (
                                <div key={e.id} className="flex justify-between items-baseline text-gray-800">
                                    <div>
                                        <span className="font-bold text-gray-900">{e.school}</span>
                                        {e.degree ? ` — ${e.degree}` : ""}
                                        {e.gpa ? ` (GPA: ${e.gpa})` : ""}
                                    </div>
                                    <span className="text-[9.5px] font-semibold text-gray-600">{e.endYear}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
