import EditorSection from "./EditorSection";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ProjectsEditor({ resume, setResume }) {

    const [open, setOpen] = useState(false);
    const updateField = (index, field, value) => {
        const projects = [...resume.project];
        projects[index][field] = value;
        setResume(prev => ({
            ...prev,
            projects,
        }));
    };
    const addProject = () => {
        setResume(prev => ({
            ...prev,
            projects: [
                ...prev.projects,
                {
                    title: "",
                    technologies: [],
                    description: [],
                    github: "",
                    live: ""
                },
            ],
        }));
    };
    const removeProject = (index) => {
        setResume(prev => ({
            ...prev,
            project: prev.project.filter((_, i) => i !== index),
        }));
    };
    return (
        <EditorSection
            title="Project"
            open={open}
            setOpen={setOpen}
        >
            <div className="space-y-5">
                {resume.projects.map((pro, index) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                    >
                        <input
                            className="w-full border rounded-lg p-2"
                            value={pro.title}
                            placeholder="Title"
                            onChange={(e) =>
                                updateField(index, "title", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={pro.technologies.join(",")}
                            placeholder="Technologies"
                            onChange={(e) =>
                                updateField(
                                    index,
                                    "technologies",
                                    e.target.value
                                        .split(",")
                                        .map(item => item.trim())
                                        .filter(Boolean)
                                )
                            }
                        />
                        <textarea
                            rows={5}
                            className="w-full border rounded-lg p-3"
                            value={pro.description.join("\n")}
                            onChange={(e) =>
                                updateField(
                                    index,
                                    "description",
                                    e.target.value
                                        .split("\n")
                                        .filter(Boolean)
                                )
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={pro.github}
                            placeholder="Github"
                            onChange={(e) =>
                                updateField(index, "github", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={pro.live}
                            placeholder="Live"
                            onChange={(e) =>
                                updateField(index, "live", e.target.value)
                            }
                        />
                        <button
                            onClick={() => removeProject(index)}
                            className="text-red-500 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    onClick={addProject}
                    className="flex items-center gap-2 text-primary"
                >
                    <Plus size={16} />
                    Add Project
                </button>
            </div>
        </EditorSection>
    );
}