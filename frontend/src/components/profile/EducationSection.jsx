import { useState } from "react";
import Section from "./common/Section";
import { GraduationCap } from "lucide-react";
import EditableCard from "./common/EditableCard";
import Modal from "./common/Modal";
import Field from "./common/Field";

export default function EducationSection() {
    const [education, setEducation] = useState([
        { id: 1, degree: "B.S. Computer Science", school: "UC Berkeley", year: "2019", gpa: "3.8" },
    ]);
    const [eduModal, setEduModal] = useState(null);
    const [eduDraft, setEduDraft] = useState({ id: 0, degree: "", school: "", year: "", gpa: "" });
    const [eduSaving, setEduSaving] = useState(false);

    const openEduModal = (edu) => {
        setEduDraft(edu ?? { id: Date.now(), degree: "", school: "", year: "", gpa: "" });
        setEduModal(edu ?? { id: Date.now(), degree: "", school: "", year: "", gpa: "" });
    };
    const saveEdu = async () => {
        setEduSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setEducation(prev => prev.some(e => e.id === eduDraft.id) ? prev.map(e => e.id === eduDraft.id ? eduDraft : e) : [...prev, eduDraft]);
        setEduSaving(false);
        setEduModal(null);
    };

    return (
        <>
            <Section title="Education" icon={GraduationCap} onAdd={() => openEduModal()} addLabel="Add Education">
                {education.length === 0 ? (
                    <div className="py-8 text-center">
                        <GraduationCap size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No education added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {education.map(e => (
                            <EditableCard key={e.id} onEdit={() => openEduModal(e)} onDelete={() => setEducation(prev => prev.filter(x => x.id !== e.id))}>
                                <div className="flex items-start gap-3 pr-16">
                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                        <GraduationCap size={14} className="text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{e.degree}</p>
                                        <p className="text-xs text-muted-foreground">{e.school} · {e.year} {e.gpa && `· GPA: ${e.gpa}`}</p>
                                    </div>
                                </div>
                            </EditableCard>
                        ))}
                    </div>
                )}
            </Section>
            {
                eduModal && (
                    <Modal title={education.some(e => e.id === eduDraft.id) ? "Edit Education" : "Add Education"} onSave={saveEdu} onClose={() => setEduModal(null)} saving={eduSaving}>
                        <Field label="Degree" value={eduDraft.degree} onChange={v => setEduDraft(d => ({ ...d, degree: v }))} placeholder="B.S. Computer Science" />
                        <Field label="School" value={eduDraft.school} onChange={v => setEduDraft(d => ({ ...d, school: v }))} placeholder="MIT" />
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Graduation Year" value={eduDraft.year} onChange={v => setEduDraft(d => ({ ...d, year: v }))} placeholder="2022" />
                            <Field label="GPA (optional)" value={eduDraft.gpa} onChange={v => setEduDraft(d => ({ ...d, gpa: v }))} placeholder="3.9" />
                        </div>
                    </Modal>
                )
            }
        </>
    )
}