import { useState } from "react";
import Section from "./common/Section";
import { FolderOpen } from "lucide-react";
import EditableCard from "./common/EditableCard";
import Modal from "./common/Modal";
import Field from "./common/Field";

export default function ProjectSection() {
    const [projects, setProjects] = useState([
        { id: 1, name: "AI Resume Builder", tech: "React, Node.js, OpenAI, PostgreSQL", desc: "Full-stack AI app that generates ATS-optimized resumes. 500+ users.", link: "github.com/jordan/resume-builder" },
    ]);
    const [projModal, setProjModal] = useState(null);
    const [projDraft, setProjDraft] = useState({ id: 0, name: "", tech: "", desc: "", link: "" });
    const [projSaving, setProjSaving] = useState(false);

    const openProjModal = (p) => {
        setProjDraft(p ?? { id: Date.now(), name: "", tech: "", desc: "", link: "" });
        setProjModal(p ?? { id: Date.now(), name: "", tech: "", desc: "", link: "" });
    };
    const saveProj = async () => {
        setProjSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setProjects(prev => prev.some(p => p.id === projDraft.id) ? prev.map(p => p.id === projDraft.id ? projDraft : p) : [...prev, projDraft]);
        setProjSaving(false);
        setProjModal(null);
    };


    return (
        <>
            <Section title="Projects" icon={FolderOpen} onAdd={() => openProjModal()} addLabel="Add Project">
                {projects.length === 0 ? (
                    <div className="py-8 text-center">
                        <FolderOpen size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No projects added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map(p => (
                            <EditableCard key={p.id} onEdit={() => openProjModal(p)} onDelete={() => setProjects(prev => prev.filter(x => x.id !== p.id))}>
                                <div className="pr-16">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-1.5 leading-relaxed">{p.desc}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {p.tech.split(", ").map(t => (
                                            <span key={t} className="text-[10px] px-2 py-0.5 bg-muted border border-border rounded-lg text-muted-foreground">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </EditableCard>
                        ))}
                    </div>
                )}
            </Section>

            {
                projModal && (
                    <Modal title={projects.some(p => p.id === projDraft.id) ? "Edit Project" : "Add Project"} onSave={saveProj} onClose={() => setProjModal(null)} saving={projSaving}>
                        <Field label="Project Name" value={projDraft.name} onChange={v => setProjDraft(d => ({ ...d, name: v }))} placeholder="AI Resume Builder" />
                        <Field label="Technologies" value={projDraft.tech} onChange={v => setProjDraft(d => ({ ...d, tech: v }))} placeholder="React, Node.js, PostgreSQL" />
                        <Field label="Description" value={projDraft.desc} onChange={v => setProjDraft(d => ({ ...d, desc: v }))} placeholder="What did you build and what was the impact?" multiline />
                        <Field label="Link (optional)" value={projDraft.link} onChange={v => setProjDraft(d => ({ ...d, link: v }))} placeholder="github.com/you/project" />
                    </Modal>
                )
            }
        </>
    )
}