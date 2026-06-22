import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Eye, Download, Plus, Trash2, Edit2, X,
  CheckCircle2, Loader2, Sparkles, Zap,
} from "lucide-react";

import PersonalEditor from "../../components/resume/editor/PersonalEditor";
import SummaryEditor from "../../components/resume/editor/SummaryEditor";
import ExperienceEditor from "../../components/resume/editor/ExperienceEditor";
import EducationEditor from "../../components/resume/editor/EducationEditor";
import SkillsEditor from "../../components/resume/editor/SkillsEditor";
import ProjectsEditor from "../../components/resume/editor/ProjectsEditor";
import LivePreview from "../../components/resume/editor/LivePreview";
import { downloadPDF } from "../../utils/exporter";

const COLORS = ["#7C3AED", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#1e293b"];

export default function ResumeEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [resumeName, setResumeName] = useState("Untitled Resume");
  const [accentColor, setAccentColor] = useState("#7C3AED");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const [personal, setPersonal] = useState({
    name: "", title: "", email: "", phone: "",
    location: "", linkedin: "", github: "", website: "",
  });
  const [summary, setSummary] = useState({ text: "" });
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let activeResume = state?.resume;

    if (activeResume?.id) {
      localStorage.setItem("editing_resume_id", activeResume.id);
    } else {
      const savedId = localStorage.getItem("editing_resume_id");
      if (savedId) {
        const savedList = JSON.parse(localStorage.getItem("saved_resumes") || "[]");
        const found = savedList.find((item) => String(item.id) === String(savedId));
        if (found) {
          activeResume = found;
        }
      }
    }

    if (activeResume) {
      setResumeName(activeResume.name || activeResume.title || "Untitled Resume");
      setAccentColor(activeResume.color || "#7C3AED");
    }

    const r = activeResume?.resume || activeResume || {};
    setPersonal({
      name: r.personal_info?.name || "",
      title: r.headline || r.personal_info?.title || "",
      email: r.personal_info?.email || "",
      phone: r.personal_info?.phone || "",
      location: r.personal_info?.location || "",
      linkedin: r.personal_info?.linkedin || "",
      github: r.personal_info?.github || "",
      website: r.personal_info?.website || "",
    });

    setSummary({
      text: r.summary || "",
    });

    if (r.skills) {
      setSkills(r.skills.map((s, idx) => typeof s === "string" ? { id: idx, name: s, level: 80 } : s));
    } else {
      setSkills([]);
    }

    if (r.experience) {
      setExperience(r.experience.map((exp, idx) => ({
        id: exp.id || idx,
        role: exp.role || "",
        company: exp.company || "",
        location: exp.location || "",
        startMonth: exp.startMonth || "01",
        startYear: exp.startYear || "2021",
        endMonth: exp.endMonth || "12",
        endYear: exp.endYear || "present",
        current: exp.current || exp.endYear === "present" || (exp.duration && exp.duration.toLowerCase().includes("present")) || false,
        bullets: exp.bullets || exp.description || [""],
      })));
    } else {
      setExperience([]);
    }

    if (r.education) {
      setEducation(r.education.map((edu, idx) => ({
        id: edu.id || idx,
        degree: edu.degree || "",
        school: edu.school || edu.institution || "",
        location: edu.location || "",
        startYear: edu.startYear || edu.start_year || "2015",
        endYear: edu.endYear || edu.end_year || "2019",
        gpa: edu.gpa || "",
        honors: edu.honors || "",
      })));
    } else {
      setEducation([]);
    }

    if (r.projects) {
      setProjects(r.projects.map((proj, idx) => ({
        id: proj.id || idx,
        name: proj.name || proj.title || "",
        tech: proj.tech || (Array.isArray(proj.technologies) ? proj.technologies.join(" · ") : proj.technologies || ""),
        url: proj.url || proj.github || proj.live || "",
        desc: proj.desc || (Array.isArray(proj.description) ? proj.description.join("\n") : proj.description || ""),
      })));
    } else {
      setProjects([]);
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const savedList = JSON.parse(localStorage.getItem("saved_resumes") || "[]");

      const resumeId = state?.resume?.id || state?.resume?.resume_id || localStorage.getItem("editing_resume_id") || Date.now().toString();
      localStorage.setItem("editing_resume_id", resumeId);
      const existingIdx = savedList.findIndex((item) => String(item.id) === String(resumeId));

      const existing = existingIdx >= 0 ? savedList[existingIdx] : null;

      const resumeEntry = {
        id: resumeId,
        title: personal.name ? `${personal.name}'s Resume` : "Untitled Resume",
        score: existing ? (existing.score || 85) : (state?.resume?.score || 85),
        status: existing ? (existing.status || "Active") : (state?.resume?.status || "Active"),
        updatedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        template: existing ? (existing.template || "Professional") : (state?.resume?.template || "Professional"),
        color: accentColor,
        starred: existing ? (existing.starred || false) : (state?.resume?.starred || false),
        version: existing ? (existing.version || "v1") : (state?.resume?.version || "v1"),
        pages: existing ? (existing.pages || 1) : (state?.resume?.pages || 1),
        resume: {
          personal_info: {
            name: personal.name,
            title: personal.title,
            email: personal.email,
            phone: personal.phone,
            location: personal.location,
            linkedin: personal.linkedin,
            github: personal.github,
            website: personal.website,
          },
          headline: personal.title,
          summary: summary.text,
          skills: skills.map((s) => s.name),
          experience: experience.map((exp) => ({
            id: exp.id,
            role: exp.role,
            company: exp.company,
            location: exp.location,
            duration: exp.current ? `${exp.startYear} – Present` : `${exp.startYear} – ${exp.endYear}`,
            startMonth: exp.startMonth,
            startYear: exp.startYear,
            endMonth: exp.endMonth,
            endYear: exp.endYear,
            current: exp.current,
            bullets: exp.bullets,
            description: exp.bullets,
          })),
          projects: projects.map((proj) => ({
            id: proj.id,
            name: proj.name,
            title: proj.name,
            tech: proj.tech,
            technologies: proj.tech ? proj.tech.split("·").map((t) => t.trim()) : [],
            url: proj.url,
            github: proj.url,
            desc: proj.desc,
            description: proj.desc ? proj.desc.split("\n") : [],
          })),
          education: education.map((edu) => ({
            id: edu.id,
            degree: edu.degree,
            school: edu.school,
            institution: edu.school,
            location: edu.location,
            startYear: edu.startYear,
            endYear: edu.endYear,
            start_year: edu.startYear,
            end_year: edu.endYear,
            gpa: edu.gpa,
            honors: edu.honors,
          })),
        },
      };

      if (existingIdx >= 0) {
        savedList[existingIdx] = resumeEntry;
      } else {
        savedList.push(resumeEntry);
      }

      localStorage.setItem("saved_resumes", JSON.stringify(savedList));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };


  const handleDownload = () => {
    const el = document.querySelector(".printable-resume");
    downloadPDF(
      {
        personal_info: personal,
        headline: personal.title,
        summary: summary.text,
        skills,
        experience,
        education,
        projects,
      },
      `${resumeName}.pdf`
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">

      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-xl">
        <button
          onClick={() => navigate("/resumes")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          My Resumes
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-semibold text-foreground truncate max-w-xs">{resumeName}</span>

        <div className="flex items-center gap-2 ml-auto">

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground">Accent:</span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                className="w-5 h-5 rounded-full transition-transform hover:scale-125 cursor-pointer"
                style={{
                  backgroundColor: c,
                  outline: accentColor === c ? "2px solid var(--primary)" : "none",
                  outlineOffset: "1px",
                }}
              />
            ))}
          </div>

          <div className="flex items-center bg-muted/50 border border-border rounded-xl p-1 gap-0.5">
            {["edit", "preview"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {t === "preview" ? (
                  <>
                    <Eye size={11} className="inline mr-1" />
                    Preview
                  </>
                ) : (
                  <>
                    <Edit2 size={11} className="inline mr-1" />
                    Edit
                  </>
                )}
              </button>
            ))}
          </div>



          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.97] disabled:opacity-70 cursor-pointer ${saved
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20"
              }`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>

          <button
            onClick={handleDownload}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Print Resume"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">

        {activeTab === "edit" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 lg:max-w-2xl lg:border-r lg:border-border">
            <PersonalEditor personal={personal} onChange={setPersonal} />
            <SummaryEditor
              summary={summary}
              onChange={setSummary}
            />
            <SkillsEditor skills={skills} onChange={setSkills} />
            <ExperienceEditor
              experience={experience}
              onChange={setExperience}
              accentColor={accentColor}
            />
            <ProjectsEditor projects={projects} onChange={setProjects} />
            <EducationEditor education={education} onChange={setEducation} />
          </div>
        )}

        <div
          className={`${activeTab === "edit" ? "hidden lg:flex" : "flex"
            } flex-1 flex-col overflow-hidden bg-gray-100 dark:bg-gray-900`}
        >
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Live Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 printable-area">
            <div className="max-w-[640px] mx-auto shadow-[var(--shadow-lg)] rounded-xl overflow-hidden border border-black/10">
              <LivePreview
                personal={personal}
                summary={summary}
                skills={skills}
                experience={experience}
                education={education}
                projects={projects}
                color={accentColor}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
