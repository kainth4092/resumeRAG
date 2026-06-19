import EditorSection from "./EditorSection";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function EducationEditor({ resume, setResume }) {

    const [open, setOpen] = useState(false);
    const updateField = (index, field, value) => {
        const education = [...resume.education];
        education[index][field] = value;
        setResume(prev => ({
            ...prev,
            education,
        }));
    };
    const addEducation = () => {
        setResume(prev => ({
            ...prev,
            education: [
                ...prev.education,
                {
                    institution: "",
                    degree: "",
                    start_year: "",
                    end_year: "",
                },
            ],
        }));
    };
    const removeEducation = (index) => {
        setResume(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index),
        }));
    };
    return (
        <EditorSection
            title="Education"
            open={open}
            setOpen={setOpen}
        >
            <div className="space-y-5">
                {resume.education.map((edu, index) => (
                    <div
                        key={index}
                        className="border rounded-lg p-4 space-y-3"
                    >
                        <input
                            className="w-full border rounded-lg p-2"
                            value={edu.institution}
                            placeholder="Institution"
                            onChange={(e) =>
                                updateField(index, "institution", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={edu.degree}
                            placeholder="Degree"
                            onChange={(e) =>
                                updateField(index, "degree", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={edu.start_year}
                            placeholder="Start Year"
                            onChange={(e) =>
                                updateField(index, "start_year", e.target.value)
                            }
                        />
                        <input
                            className="w-full border rounded-lg p-2"
                            value={edu.end_year}
                            placeholder="End Year"
                            onChange={(e) =>
                                updateField(index, "end_year", e.target.value)
                            }
                        />

                        <button
                            onClick={() => removeEducation(index)}
                            className="text-red-500 flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Remove
                        </button>
                    </div>
                ))}
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 text-primary"
                >
                    <Plus size={16} />
                    Add Education
                </button>
            </div>
        </EditorSection>
    );
}