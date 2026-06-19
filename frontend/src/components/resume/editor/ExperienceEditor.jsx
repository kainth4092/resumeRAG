import EditorSection from "./EditorSection";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function ExperienceEditor({ resume, setResume }) {

    const [open, setOpen] = useState(false);
    const updateField = (index, field, value) => {
        const experience = [...resume.experience];
        experience[index][field] = value;
        setResume(prev => ({
            ...prev,
            experience,
        }));
    };
    const addExperience = () => {
        setResume(prev => ({
            ...prev,
            experience: [
                ...prev.experience,
                {
                    company: "",
                    role: "",
                    duration: "",
                    description: [],
                },
            ],
        }));
    };
    const removeExperience = (index) => {
        setResume(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index),
        }));
    };
    return (
        <EditorSection
            title="Experience"
            open={open}
            setOpen={setOpen}
        >
            <div className="space-y-5">
                {resume.experience.map((exp, index) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                    >
                        <input
                            className="w-full border rounded-lg p-2"
                            value={exp.role}
                            placeholder="Role"
                            onChange={(e) =>
                                updateField(index, "role", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={exp.company}
                            placeholder="Company"
                            onChange={(e) =>
                                updateField(index, "company", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={exp.duration}
                            placeholder="Duration"
                            onChange={(e) =>
                                updateField(index, "duration", e.target.value)
                            }
                        />
                        <textarea
                            rows={5}
                            className="w-full border rounded-lg p-3"
                            value={exp.description.join("\n")}
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
                        <button
                            onClick={() => removeExperience(index)}
                            className="text-red-500 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    onClick={addExperience}
                    className="flex items-center gap-2 text-primary"
                >
                    <Plus size={16} />
                    Add Experience
                </button>
            </div>
        </EditorSection>
    );
}