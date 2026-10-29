import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { estimatePageCount } from "../../../utils/resumeUtils";
import { updateResume } from "../services/resumeService";
import { fromApi, toApi } from "../model/resumeModel";

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
  const [parseWarnings, setParseWarnings] = useState([]);

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
        const savedList = JSON.parse(localStorage.getItem(resumesKey) || "[]");
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

    const doc = fromApi(activeResume);
    if (doc) {
      setPersonal(doc.personal);
      setSummary({ text: doc.summary });
      setSkills(doc.skillsList);
      setExperience(
        doc.experience.map((exp, idx) => ({
          id: exp.id ?? idx,
          role: exp.role || "",
          company: exp.company || "",
          location: exp.location || "",
          start: exp.start || null,
          end: exp.end || null,
          startMonth:
            exp.start && exp.start.includes("-")
              ? exp.start.split("-")[1]
              : "",
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
      );
      setEducation(
        doc.education.map((edu, idx) => ({
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
      );
      setProjects(
        doc.projects.map((proj, idx) => ({
          id: proj.id ?? idx,
          name: proj.title || proj.name || "",
          tech: proj.tech || "",
          url: proj.url || "",
          desc: proj.desc || "",
          bullets: proj.bullets || [],
          technologies: proj.technologies || [],
        })),
      );
      setParseWarnings(doc.parse_warnings || []);
    } else {
      setPersonal({
        name: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
      });
      setSummary({ text: "" });
      setSkills([]);
      setExperience([]);
      setEducation([]);
      setProjects([]);
      setParseWarnings([]);
    }
  }, [user, resumesKey, editingResumeIdKey, state?.resume]);

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
        alert("Failed to save resume. Please try again.");
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

