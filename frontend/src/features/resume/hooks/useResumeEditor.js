import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { estimatePageCount } from "../../../utils/resumeUtils";
import { updateResume } from "../services/resumeService";
import { fromApi, toApi } from "../model/resumeModel";
import { toast } from "sonner";

export function useResumeEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const resumesKey = user?.email
    ? `saved_resumes_${user.email}`
    : "saved_resumes";
  const editingResumeIdKey = user?.email
    ? `editing_resume_id_${user.email}`
    : "editing_resume_id";

  const getInitialActiveResume = () => {
    let activeResume = state?.resume;
    if (!activeResume && typeof window !== "undefined") {
      const savedId = localStorage.getItem(editingResumeIdKey);
      if (savedId) {
        const savedList = JSON.parse(localStorage.getItem(resumesKey) || "[]");
        const found = savedList.find(
          (item) => String(item.id) === String(savedId),
        );
        if (found) {
          activeResume = found;
        }
      }
    }
    return activeResume;
  };

  const formatDocState = (doc, resume) => ({
    name: resume?.name || resume?.title || "Untitled Resume",
    template: resume?.template || "Professional",
    personal: doc?.personal || {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },
    summary: { text: doc?.summary || "" },
    skills: doc?.skillsList || [],
    experience: (doc?.experience || []).map((exp, idx) => ({
      id: exp.id ?? idx,
      role: exp.role || "",
      company: exp.company || "",
      location: exp.location || "",
      start: exp.start || null,
      end: exp.end || null,
      startMonth:
        exp.start && exp.start.includes("-") ? exp.start.split("-")[1] : "",
      startYear: exp.start ? exp.start.split("-")[0] : "",
      endMonth:
        exp.end && exp.end.includes("-") ? exp.end.split("-")[1] : "",
      endYear: exp.current
        ? "present"
        : exp.end
          ? exp.end.split("-")[0]
          : "",
      current: Boolean(exp.current),
      bullets: exp.bullets && exp.bullets.length > 0 ? exp.bullets : [""],
    })),
    education: (doc?.education || []).map((edu, idx) => ({
      id: edu.id ?? idx,
      degree: edu.degree || "",
      school: edu.institution || edu.school || "",
      location: edu.location || "",
      start: edu.start || null,
      end: edu.end || null,
      startYear: edu.start ? String(edu.start).split("-")[0] : "",
      endYear: edu.end ? String(edu.end).split("-")[0] : "",
      gpa: edu.grade || edu.gpa || "",
      honors: edu.honors || "",
    })),
    projects: (doc?.projects || []).map((proj, idx) => ({
      id: proj.id ?? idx,
      name: proj.title || proj.name || "",
      tech: proj.tech || "",
      url: proj.url || "",
      desc: proj.desc || "",
      bullets: proj.bullets || [],
      technologies: proj.technologies || [],
    })),
    parseWarnings: doc?.parse_warnings || [],
  });

  const initialResume = getInitialActiveResume();
  const initialDoc = fromApi(initialResume);
  const initialFormatted = formatDocState(initialDoc, initialResume);

  const [resumeName, setResumeName] = useState(() => initialFormatted.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [activeTemplate, setActiveTemplate] = useState(() => initialFormatted.template);

  const [personal, setPersonal] = useState(() => initialFormatted.personal);
  const [summary, setSummary] = useState(() => initialFormatted.summary);
  const [skills, setSkills] = useState(() => initialFormatted.skills);
  const [experience, setExperience] = useState(() => initialFormatted.experience);
  const [education, setEducation] = useState(() => initialFormatted.education);
  const [projects, setProjects] = useState(() => initialFormatted.projects);
  const [parseWarnings, setParseWarnings] = useState(() => initialFormatted.parseWarnings);

  const resumeKey = state?.resume?.id || state?.resume?.title || "none";
  const [prevResumeKey, setPrevResumeKey] = useState(resumeKey);
  if (resumeKey !== prevResumeKey) {
    setPrevResumeKey(resumeKey);
    const updatedResume = getInitialActiveResume();
    const updatedDoc = fromApi(updatedResume);
    const formatted = formatDocState(updatedDoc, updatedResume);
    setResumeName(formatted.name);
    setActiveTemplate(formatted.template);
    setPersonal(formatted.personal);
    setSummary(formatted.summary);
    setSkills(formatted.skills);
    setExperience(formatted.experience);
    setEducation(formatted.education);
    setProjects(formatted.projects);
    setParseWarnings(formatted.parseWarnings);
  }

  const locationResume = state?.resume;
  useEffect(() => {
    if (!user) return;
    if (locationResume?.id) {
      localStorage.setItem(editingResumeIdKey, locationResume.id);
    } else if (locationResume) {
      localStorage.removeItem(editingResumeIdKey);
    }
  }, [user, locationResume, editingResumeIdKey]);

  const buildEditorState = () => ({
    personal,
    headline: personal.title,
    summary: summary.text,
    skills,
    experience: experience.map((exp) => {
      let start = exp.start || null;
      if (exp.startYear) {
        start = exp.startMonth
          ? `${exp.startYear}-${exp.startMonth}`
          : String(exp.startYear);
      }
      let end = exp.end || null;
      if (exp.current) {
        end = null;
      } else if (exp.endYear && exp.endYear !== "present") {
        end = exp.endMonth
          ? `${exp.endYear}-${exp.endMonth}`
          : String(exp.endYear);
      }
      return {
        company: exp.company,
        role: exp.role,
        location: exp.location,
        start,
        end,
        current: Boolean(exp.current),
        bullets: exp.bullets,
      };
    }),
    projects: projects.map((proj) => ({
      title: proj.name,
      tech: proj.tech,
      url: proj.url,
      desc: proj.desc,
      technologies: proj.technologies,
      bullets: proj.bullets,
    })),
    education: education.map((edu) => ({
      institution: edu.school,
      degree: edu.degree,
      start: edu.start || edu.startYear || null,
      end: edu.end || edu.endYear || null,
      grade: edu.gpa || "",
    })),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedList = JSON.parse(localStorage.getItem(resumesKey) || "[]");

      const resumeId =
        state?.resume?.id ||
        state?.resume?.resume_id ||
        localStorage.getItem(editingResumeIdKey) ||
        Date.now().toString();
      const existingIdx = savedList.findIndex(
        (item) => String(item.id) === String(resumeId),
      );

      const existing = existingIdx >= 0 ? savedList[existingIdx] : null;
      const editorState = buildEditorState();
      const newResumeObj = toApi(editorState);

      let newVersion = "v1";
      if (existing) {
        const changed =
          JSON.stringify(existing.resume) !== JSON.stringify(newResumeObj);
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
        title: personal.name || "Untitled Resume",
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

      const numericId = state?.resume?.id ?? state?.resume?.resume_id ?? null;
      let backendSaved = true;
      if (numericId !== null) {
        try {
          await updateResume(numericId, {
            title: resumeEntry.title,
            template: resumeEntry.template,
            version: resumeEntry.version,
            ats_score: resumeEntry.score,
            resume_json: newResumeObj,
          });
        } catch (err) {
          backendSaved = false;
          console.error("Failed to sync resume save to backend:", err);
        }
      }
      if (!backendSaved) {
        toast.error("Failed to save resume. Please try again.");
        return;
      }
      if (existingIdx >= 0) {
        savedList[existingIdx] = resumeEntry;
      } else {
        savedList.push(resumeEntry);
      }
      localStorage.setItem(editingResumeIdKey, resumeId);
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
    return toApi(buildEditorState());
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
    parseWarnings,
    handleSave,
    getFullResumeObject,
  };
}

