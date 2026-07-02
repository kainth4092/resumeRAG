import { useEffect, useState } from "react";
import Section from "./common/Section";
import { FolderOpen } from "lucide-react";
import EditableCard from "./common/EditableCard";
import Modal from "./common/Modal";
import Field from "./common/Field";
import {
  createProject,
  deleteProject,
  getProject,
  updateProject,
} from "../../resume/services/projectService";

export default function ProjectSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projModal, setProjModal] = useState(null);
  const [projDraft, setProjDraft] = useState({
    id: null,
    title: "",
    description: "",
    tech_stack: "",
    github_url: "",
    live_url: "",
  });
  const [projSaving, setProjSaving] = useState(false);
  const [projError, setProjError] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await getProject();
      setProjects(response.data);
    } catch (err) {
      console.error("Failed to load project", err);
    } finally {
      setLoading(false);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadProjects();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const openProjModal = () => {
    setProjDraft({
      id: null,
      title: "",
      description: "",
      tech_stack: "",
      github_url: "",
      live_url: "",
    });
    setProjError(null);
    setProjModal(true);
  };
  const openEditModal = (pro) => {
    setProjDraft({
      id: pro.id,
      title: pro.title || "",
      description: pro.description || "",
      tech_stack: pro.tech_stack || "",
      github_url: pro.github_url || "",
      live_url: pro.live_url || "",
    });
    setProjError(null);
    setProjModal(true);
  };

  const saveProject = async () => {
    const payload = {
      title: projDraft.title,
      description: projDraft.description,
      tech_stack: projDraft.tech_stack,
      github_url: projDraft.github_url,
      live_url: projDraft.live_url,
    };

    try {
      setProjSaving(true);
      setProjError(null);
      if (projDraft.id) {
        const response = await updateProject(projDraft.id, payload);
        setProjects((prev) =>
          prev.map((item) => (item.id === projDraft.id ? response.data : item)),
        );
      } else {
        const response = await createProject(payload);
        setProjects((prev) => [...prev, response.data]);
      }
      setProjModal(false);
    } catch (err) {
      console.error("Failed to save project", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setProjError(detail[0]?.msg || "Validation error saving project.");
      } else {
        setProjError(detail || "Failed to save project.");
      }
    } finally {
      setProjSaving(false);
    }
  };

  const removeProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete project", err);
    }
  };

  return (
    <>
      <Section
        title="Projects"
        icon={FolderOpen}
        onAdd={() => openProjModal()}
        addLabel="Add Project"
      >
        {loading ? (
          <div className="py-4 text-sm text-muted-foreground">
            Loading education...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center">
            <FolderOpen
              size={24}
              className="mx-auto mb-2 text-muted-foreground/40"
            />
            <p className="text-sm text-muted-foreground">
              No projects added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <EditableCard
                key={p.id}
                onEdit={() => openEditModal(p)}
                onDelete={() => removeProject(p.id)}
              >
                <div className="flex items-start gap-3 pr-16">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 ">
                    <FolderOpen size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-md font-semibold text-foreground">
                      {p.title}
                    </p>

                    <p className="text-sm text-muted-foreground mb-1.5 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {p.tech_stack.split(", ").map((t) => (
                        <span
                          key={t}
                          className="text-[12px] px-2 py-0.5 bg-muted border border-border rounded-lg text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </EditableCard>
            ))}
          </div>
        )}
      </Section>

      {projModal && (
        <Modal
          title={projDraft.id ? "Edit Project" : "Add Project"}
          onSave={saveProject}
          onClose={() => setProjModal(null)}
          saving={projSaving}
          error={projError}
        >
          <Field
            label="Project Name"
            value={projDraft.title}
            onChange={(v) => setProjDraft((d) => ({ ...d, title: v }))}
            placeholder="AI Resume Builder"
          />
          <Field
            label="Technologies"
            value={projDraft.tech_stack}
            onChange={(v) => setProjDraft((d) => ({ ...d, tech_stack: v }))}
            placeholder="React, Node.js, PostgreSQL"
          />
          <Field
            label="Description"
            value={projDraft.description}
            onChange={(v) => setProjDraft((d) => ({ ...d, description: v }))}
            placeholder="What did you build and what was the impact?"
            multiline
          />
          <Field
            label="Github Link (optional)"
            value={projDraft.github_url}
            onChange={(v) => setProjDraft((d) => ({ ...d, github_url: v }))}
            placeholder="github.com/you/project"
          />
          <Field
            label="Live Link (optional)"
            value={projDraft.live_url}
            onChange={(v) => setProjDraft((d) => ({ ...d, live_url: v }))}
            placeholder="Live Link"
          />
        </Modal>
      )}
    </>
  );
}
