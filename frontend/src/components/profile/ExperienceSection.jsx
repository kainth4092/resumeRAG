import { Briefcase } from "lucide-react";
import { useState } from "react";
import Section from "./common/Section";
import EditableCard from "./common/EditableCard";
import Modal from "./common/Modal";
import Field from "./common/Field";

export default function ExperienceSection() {
    const [experiences, setExperiences] = useState([
        { id: 1, role: "Senior Frontend Engineer", company: "Acme Corp", period: "2021 – Present", desc: "Architected micro-frontend system serving 2M+ daily users. Reduced bundle size by 40% through code splitting and lazy loading strategies." },
        { id: 2, role: "Software Engineer", company: "TechStartup Inc", period: "2019 – 2021", desc: "Built core product features in React and Node.js. Led migration from Redux to React Query, reducing data-fetching code by 60%." },
    ]);
    const [expModal, setExpModal] = useState(null);
    const [expDraft, setExpDraft] = useState({ id: 0, role: "", company: "", period: "", desc: "" });
    const [expSaving, setExpSaving] = useState(false);

    const openExpModal = (exp) => {
        setExpDraft(exp ?? { id: Date.now(), role: "", company: "", period: "", desc: "" });
        setExpModal(exp ?? { id: Date.now(), role: "", company: "", period: "", desc: "" });
    };
    const saveExp = async () => {
        setExpSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setExperiences(prev => prev.some(e => e.id === expDraft.id) ? prev.map(e => e.id === expDraft.id ? expDraft : e) : [...prev, expDraft]);
        setExpSaving(false);
        setExpModal(null);
    };

    return (
        <>
            <Section title="Work Experience" icon={Briefcase} onAdd={() => openExpModal()} addLabel="Add Experience">
                {experiences.length === 0 ? (
                    <div className="py-8 text-center">
                        <Briefcase size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No experience added yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {experiences.map(e => (
                            <EditableCard key={e.id} onEdit={() => openExpModal(e)} onDelete={() => setExperiences(prev => prev.filter(x => x.id !== e.id))}>
                                <div className="flex items-start gap-3 pr-16">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Briefcase size={14} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{e.role}</p>
                                        <p className="text-xs text-muted-foreground">{e.company} · {e.period}</p>
                                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{e.desc}</p>
                                    </div>
                                </div>
                            </EditableCard>
                        ))}
                    </div>
                )}
            </Section>
            {
                expModal && (
                    <Modal title={experiences.some(e => e.id === expDraft.id) ? "Edit Experience" : "Add Experience"} onSave={saveExp} onClose={() => setExpModal(null)} saving={expSaving}>
                        <Field label="Job Title" value={expDraft.role} onChange={v => setExpDraft(d => ({ ...d, role: v }))} placeholder="Senior Frontend Engineer" />
                        <Field label="Company" value={expDraft.company} onChange={v => setExpDraft(d => ({ ...d, company: v }))} placeholder="Acme Corp" />
                        <Field label="Period" value={expDraft.period} onChange={v => setExpDraft(d => ({ ...d, period: v }))} placeholder="Jan 2022 – Present" />
                        <Field label="Description" value={expDraft.desc} onChange={v => setExpDraft(d => ({ ...d, desc: v }))} placeholder="Describe your role, responsibilities, and achievements..." multiline />
                    </Modal>
                )
            }
        </>
    )
}