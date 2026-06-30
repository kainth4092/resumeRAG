import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Eye,
  Download,
  Edit2,
  CheckCircle2,
  Loader2,
  Printer,
  FileText,
} from "lucide-react";

import PersonalEditor from "../components/resume/editor/PersonalEditor";
import SummaryEditor from "../components/resume/editor/SummaryEditor";
import ExperienceEditor from "../components/resume/editor/ExperienceEditor";
import EducationEditor from "../components/resume/editor/EducationEditor";
import SkillsEditor from "../components/resume/editor/SkillsEditor";
import ProjectsEditor from "../components/resume/editor/ProjectsEditor";
import LivePreview from "../components/resume/editor/LivePreview";
import { downloadPDF, downloadDOCX, printResume } from "../exporters";
import { useAuth } from "../../../context/AuthContext";
import { estimatePageCount } from "../../../utils/resumeUtils";

export default function ResumeEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const resumesKey = user?.email ? `saved_resumes_${user.email}` : "saved_resumes";
  const editingResumeIdKey = user?.email ? `editing_resume_id_${user.email}` : "editing_resume_id";

  const [resumeName, setResumeName] = useState("Untitled Resume");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [activeTemplate, setActiveTemplate] = useState("Professional");

  const [personal, setPersonal] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  });
  const [summary, setSummary] = useState({ text: "" });
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user) return;
    let activeResume = state?.resume;

    if (activeResume) {
      if (activeResume.id) {
        localStorage.setItem(editingResumeIdKey, activeResume.id);
      } else {
        localStorage.removeItem(editingResumeIdKey);
      }
    } else {
      const savedId = localStorage.getItem(editingResumeIdKey);
      if (savedId) {
        const savedList = JSON.parse(
          localStorage.getItem(resumesKey) || "[]",
        );
        const found = savedList.find(
          (item) => String(item.id) === String(savedId),
        );
        if (found) {
          activeResume = found;
        }
      }
    }

    if (activeResume) {
      setResumeName(
        activeResume.name || activeResume.title || "Untitled Resume",
      );
      if (activeResume.template) {
        setActiveTemplate(activeResume.template);
      }
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
      setSkills(
        r.skills.map((s, idx) =>
          typeof s === "string" ? { id: idx, name: s, level: 80 } : s,
        ),
      );
    } else {
      setSkills([]);
    }

    if (r.experience) {
      setExperience(
        r.experience.map((exp, idx) => ({
          id: exp.id || idx,
          role: exp.role || "",
          company: exp.company || "",
          location: exp.location || "",
          startMonth: exp.startMonth || "01",
          startYear: exp.startYear || "2021",
          endMonth: exp.endMonth || "12",
          endYear: exp.endYear || "present",
          current:
            exp.current ||
            exp.endYear === "present" ||
            (exp.duration && exp.duration.toLowerCase().includes("present")) ||
            false,
          bullets: exp.bullets || exp.description || [""],
        })),
      );
    } else {
      setExperience([]);
    }

    if (r.education) {
      setEducation(
        r.education.map((edu, idx) => ({
          id: edu.id || idx,
          degree: edu.degree || "",
          school: edu.school || edu.institution || "",
          location: edu.location || "",
          startYear: edu.startYear || edu.start_year || "2015",
          endYear: edu.endYear || edu.end_year || "2019",
          gpa: edu.gpa || "",
          honors: edu.honors || "",
        })),
      );
    } else {
      setEducation([]);
    }

    if (r.projects) {
      setProjects(
        r.projects.map((proj, idx) => ({
          id: proj.id || idx,
          name: proj.name || proj.title || "",
          tech:
            proj.tech ||
            (Array.isArray(proj.technologies)
              ? proj.technologies.join(" · ")
              : proj.technologies || ""),
          url: proj.url || proj.github || proj.live || "",
          desc:
            proj.desc ||
            (Array.isArray(proj.description)
              ? proj.description.join("\n")
              : proj.description || ""),
        })),
      );
    } else {
      setProjects([]);
    }
  }, [user, resumesKey, editingResumeIdKey, state?.resume]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      const savedList = JSON.parse(
        localStorage.getItem(resumesKey) || "[]",
      );

      const resumeId =
        state?.resume?.id ||
        state?.resume?.resume_id ||
        localStorage.getItem(editingResumeIdKey) ||
        Date.now().toString();
      localStorage.setItem(editingResumeIdKey, resumeId);
      const existingIdx = savedList.findIndex(
        (item) => String(item.id) === String(resumeId),
      );

      const existing = existingIdx >= 0 ? savedList[existingIdx] : null;

      const newResumeObj = {
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
          duration: exp.current
            ? `${exp.startYear} – Present`
            : `${exp.startYear} – ${exp.endYear}`,
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
          technologies: proj.tech
            ? proj.tech.split("·").map((t) => t.trim())
            : [],
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
      };

      let newVersion = "v1";
      if (existing) {
        const changed = JSON.stringify(existing.resume) !== JSON.stringify(newResumeObj);
        if (changed) {
          const currentVer = existing.version || "v1";
          const match = currentVer.match(/v(\d+)/);
          if (match) {
            newVersion = `v${parseInt(match[1], 10) + 1}`;
          } else {
            newVersion = "v2";
          }
        } else {
          newVersion = existing.version || "v1";
        }
      } else if (state?.resume?.version) {
        newVersion = state.resume.version;
      }

      const estimatedPages = estimatePageCount(newResumeObj);

      const resumeEntry = {
        id: resumeId,
        title: personal.name ? `${personal.name}'s Resume` : "Untitled Resume",
        score: state?.resume?.score || (existing ? existing.score : 85),
        status: existing
          ? existing.status || "Active"
          : state?.resume?.status || "Active",
        updatedAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        template: activeTemplate,
        starred: existing
          ? existing.starred || false
          : state?.resume?.starred || false,
        version: newVersion,
        pages: estimatedPages,
        resume: newResumeObj,
      };

      if (existingIdx >= 0) {
        savedList[existingIdx] = resumeEntry;
      } else {
        savedList.push(resumeEntry);
      }

      localStorage.setItem(resumesKey, JSON.stringify(savedList));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/80 backdrop-blur-xl">
        <button
          onClick={() => navigate("/resumes")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          My Resumes
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-sm font-semibold text-foreground truncate max-w-xs">
          {resumeName}
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={activeTemplate}
            onChange={(e) => setActiveTemplate(e.target.value)}
            className="h-9 px-2.5 rounded-xl border border-border text-xs bg-card font-semibold cursor-pointer"
          >
            {["Professional", "ATS", "Minimal", "Corporate"].map((name) => (
              <option key={name} value={name}>
                {name} Template
              </option>
            ))}
          </select>

          <div className="flex items-center bg-muted/50 border border-border rounded-xl p-1 gap-0.5">
            {["edit", "preview"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize cursor-pointer ${activeTab === t
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
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
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>

          <button
            onClick={() => printResume()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Print Resume"
          >
            <Printer size={14} />
          </button>

          <button
            onClick={() => downloadPDF({
              personal_info: personal,
              headline: personal.title,
              summary: summary.text,
              skills,
              experience,
              education,
              projects,
            }, `${resumeName}.pdf`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Download PDF"
          >
            <Download size={14} />
          </button>

          <button
            onClick={() => downloadDOCX({
              personal_info: personal,
              headline: personal.title,
              summary: summary.text,
              skills,
              experience,
              education,
              projects,
            }, `${resumeName}.docx`, activeTemplate)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Download DOCX"
          >
            <FileText size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {activeTab === "edit" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 lg:max-w-2xl lg:border-r lg:border-border">
            <PersonalEditor personal={personal} onChange={setPersonal} />
            <SummaryEditor summary={summary} onChange={setSummary} />
            <SkillsEditor skills={skills} onChange={setSkills} />
            <ProjectsEditor projects={projects} onChange={setProjects} />
            <EducationEditor education={education} onChange={setEducation} />
          </div>
        )}

        <div
          className={`${activeTab === "edit" ? "hidden lg:flex" : "flex"
            } flex-1 flex-col overflow-hidden bg-gray-100 dark:bg-gray-900`}
        >
          <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Live Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                Live
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 printable-area">
            <div className="max-w-[640px] mx-auto shadow-(--shadow-lg) rounded-xl overflow-hidden border border-black/10">
              <LivePreview
                personal={personal}
                summary={summary}
                skills={skills}
                experience={experience}
                education={education}
                projects={projects}
                templateName={activeTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
