import React from "react";
import { getTechnicalSkills } from "../../../utils/skills.utils";

export const SkillCategory = ({ category, skills, variant, primaryColor }) => {
  if (variant === "minimal") {
    return (
      <div className="space-y-0.5">
        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          {category}
        </h4>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-slate-600 font-sans text-[9.5px] leading-relaxed">
          {skills.map((skill, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 select-none">•</span>}
              <span>{skill}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "corporate") {
    return (
      <div className="space-y-1">
        <h4
          className="text-[10px] font-bold text-slate-700 uppercase tracking-wider"
          style={{ color: primaryColor }}
        >
          {category}
        </h4>
        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-slate-600 font-sans text-[10px] leading-relaxed">
          {skills.map((skill, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-300 select-none">•</span>}
              <span>{skill}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "ats") {
    return (
      <p className="leading-normal text-gray-950 text-[10px]">
        <span className="font-bold">{category}: </span>
        {skills.join(" • ")}
      </p>
    );
  }

  // Default (Professional)
  return (
    <div className="space-y-1">
      <h4
        className="font-bold text-[9.5px] uppercase tracking-wider"
        style={{ color: primaryColor || "#224b7a" }}
      >
        {category}
      </h4>
      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-slate-700 font-sans text-[9.5px] leading-relaxed">
        {skills.map((skill, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-slate-300 select-none">•</span>}
            <span>{skill}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const SkillSection = ({ children, variant, primaryColor }) => {
  if (variant === "minimal") {
    return (
      <div className="grid grid-cols-4 gap-4 border-t border-slate-50 pt-4">
        <div className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
          Expertise
        </div>
        <div className="col-span-3 space-y-3">{children}</div>
      </div>
    );
  }

  if (variant === "corporate") {
    return (
      <div className="space-y-3">
        <h2
          className="text-xs font-black uppercase tracking-wider border-b border-slate-100 pb-1"
          style={{ color: primaryColor || "#334155" }}
        >
          Key Expertise
        </h2>
        <div className="space-y-4">{children}</div>
      </div>
    );
  }

  if (variant === "ats") {
    return (
      <div className="space-y-1">
        <h2 className="text-[11px] font-bold uppercase tracking-wider border-b border-black pb-0.5">
          Technical Skills
        </h2>
        <div className="space-y-1 pt-0.5">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h2
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: primaryColor || "#224b7a" }}
      >
        CORE TECHNICAL SKILLS
      </h2>
      <hr className="border-t border-gray-300" />
      <div className="space-y-2 pt-1">{children}</div>
    </div>
  );
};

export default function ResumeSkillRenderer({
  resume,
  variant,
  primaryColor,
  accentColor,
  bodyColor,
}) {
  const technicalSkills = getTechnicalSkills(resume);

  if (technicalSkills.length === 0) return null;

  return (
    <SkillSection variant={variant} primaryColor={primaryColor}>
      {technicalSkills.map((cat, idx) => (
        <SkillCategory
          key={idx}
          category={cat.category}
          skills={cat.skills}
          variant={variant}
          primaryColor={primaryColor}
          accentColor={accentColor}
          bodyColor={bodyColor}
        />
      ))}
    </SkillSection>
  );
}
