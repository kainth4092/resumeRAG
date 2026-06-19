import { useState } from "react";

import EditorSection from "./EditorSection";
import ExperienceEditor from "./ExperienceEditor";
import ProjectsEditor from "./ProjectsEditor";
import EducationEditor from "./EducationEditor";

export default function ResumeEditorForm({
    resume,
    setResume,
}) {
    const [personalOpen, setPersonalOpen] = useState(true);
    const [summaryOpen, setSummaryOpen] = useState(false);
    const [skillsOpen, setSkillsOpen] = useState(false);
    const [experienceOpen, setExperienceOpen] = useState(false);
    const [projectsOpen, setProjectsOpen] = useState(false);
    const [educationOpen, setEducationOpen] = useState(false);

    const updatePersonal = (field, value) => {
        setResume(prev => ({
            ...prev,
            personal_info: {
                ...prev.personal_info,
                [field]: value,
            },
        }));
    };
    return (
        <div className="p-5 space-y-4">
            <EditorSection
                title="Personal Information"
                open={personalOpen}
                setOpen={setPersonalOpen}
            >
                <div className="space-y-3">
                    <input
                        className="w-full border rounded-lg p-2"
                        value={resume.personal_info.name}
                        onChange={(e) => updatePersonal("name", e.target.value)}
                        placeholder="Full Name"
                    />
                    <input
                        className="w-full border rounded-lg p-2"
                        value={resume.personal_info.email}
                        onChange={(e) => updatePersonal("email", e.target.value)}
                        placeholder="Email"
                    />
                    <input
                        className="w-full border rounded-lg p-2"
                        value={resume.personal_info.phone}
                        onChange={(e) => updatePersonal("phone", e.target.value)}
                        placeholder="Phone"
                    />
                    <input
                        className="w-full border rounded-lg p-2"
                        value={resume.personal_info.location}
                        onChange={(e) => updatePersonal("location", e.target.value)}
                        placeholder="Location"
                    />
                    <input
                        className="w-full border rounded-lg p-2"
                        value={resume.personal_info.linkedin}
                        onChange={(e) => updatePersonal("linkedin", e.target.value)}
                        placeholder="LinkedIn"
                    />
                    <input
                        className="w-full border rounded-lg p-2"
                        value={resume.personal_info.github}
                        onChange={(e) => updatePersonal("github", e.target.value)}
                        placeholder="GitHub"
                    />
                </div>
            </EditorSection>

            <EditorSection
                title="Professional Summary"
                open={summaryOpen}
                setOpen={setSummaryOpen}
            >
                <textarea
                    rows={6}
                    className="w-full border rounded-lg p-3"
                    value={resume.summary}
                    onChange={(e) =>
                        setResume(prev => ({
                            ...prev,
                            summary: e.target.value
                        }))
                    }
                />

            </EditorSection>

            <EditorSection
                title="Skills"
                open={skillsOpen}
                setOpen={setSkillsOpen}
            >
                <textarea
                    rows={5}
                    className="w-full border rounded-lg p-3"
                    value={resume.skills.join(", ")}
                />

            </EditorSection>

            <ExperienceEditor
                resume={resume}
                setResume={setResume}
            />

            <ProjectsEditor
                resume={resume}
                setResume={setResume}
            />

            <EducationEditor
                resume={resume}
                setResume={setResume}
            />
        </div>
    );
}