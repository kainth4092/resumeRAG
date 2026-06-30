import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { estimatePageCount } from "../../../utils/resumeUtils";

export function useResumeEditor() {
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setSaving(false);
    }
  };

  const getFullResumeObject = () => {
    return {
      personal_info: personal,
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
        bullets: exp.bullets,
      })),
      projects: projects.map((proj) => ({
        id: proj.id,
        name: proj.name,
        tech: proj.tech,
        url: proj.url,
        desc: proj.desc,
      })),
      education: education.map((edu) => ({
        id: edu.id,
        degree: edu.degree,
        school: edu.school,
        location: edu.location,
        startYear: edu.startYear,
        endYear: edu.endYear,
        gpa: edu.gpa,
        honors: edu.honors,
      })),
    };
  };

  return {
    navigate,
    state,
    resumeName,
    setResumeName,
    saving,
    saved,
    activeTab,
    setActiveTab,
    activeTemplate,
    setActiveTemplate,
    personal,
    setPersonal,
    summary,
    setSummary,
    skills,
    setSkills,
    experience,
    setExperience,
    education,
    setEducation,
    projects,
    setProjects,
    handleSave,
    getFullResumeObject,
  };
}
