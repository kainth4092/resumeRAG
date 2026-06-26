import { useState } from "react";
import { Code2, X, Plus } from "lucide-react";
import EditorSection from "./EditorSection";

export default function SkillsEditor({ skills = [], onChange }) {
  const [newSkill, setNewSkill] = useState("");

  const handleAdd = () => {
    if (newSkill.trim()) {
      onChange([...skills, { id: Date.now(), name: newSkill.trim(), level: 75 }]);
      setNewSkill("");
    }
  };

  return (
    <EditorSection title="Skills" icon={Code2} badge={`${skills.length}`} defaultOpen={false}>
      <div className="text-left">
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map(s => (
            <span key={s.id} className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-muted border border-border rounded-xl text-xs font-semibold text-foreground hover:border-primary/30 transition-all">
              {s.name}
              <button
                type="button"
                onClick={() => onChange(skills.filter(x => x.id !== s.id))}
                className="opacity-50 group-hover:opacity-100 hover:text-destructive transition-all cursor-pointer"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Type a skill and press Enter…"
            className="flex-1 h-10 px-3.5 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newSkill.trim()}
            className="px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </EditorSection>
  );
}
