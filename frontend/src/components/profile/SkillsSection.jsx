import { useState } from "react";
import { Code2, Plus, X } from "lucide-react";
import Section from "./common/Section";

export default function SkillSection() {
    const [skills, setSkills] = useState(["React", "TypeScript", "Node.js", "PostgreSQL", "GraphQL", "Docker", "Git", "AWS"]);
    const [newSkill, setNewSkill] = useState("");
    const addSkill = () => { if (newSkill.trim() && !skills.includes(newSkill.trim())) { setSkills(s => [...s, newSkill.trim()]); setNewSkill(""); } };


    return (
        <Section title="Skills & Technologies" icon={Code2}>
            <div className="flex flex-wrap gap-2 mb-3">
                {skills.map(s => (
                    <span key={s} className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium text-foreground hover:border-destructive/30 transition-all">
                        {s}
                        <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all">
                            <X size={11} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSkill()}
                    placeholder="Add a skill and press Enter..."
                    className="flex-1 px-3 py-2 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
                />
                <button onClick={addSkill} disabled={!newSkill.trim()} className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 disabled:opacity-40 transition-all">
                    <Plus size={15} />
                </button>
            </div>
        </Section>
    )
}