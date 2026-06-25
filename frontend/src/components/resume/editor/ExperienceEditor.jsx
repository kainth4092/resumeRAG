import { Briefcase, Trash2, Plus, X } from "lucide-react";
import EditorSection, { Label, Input } from "./EditorSection";
import { Select, MONTHS, YEARS } from "./Select";

export default function ExperienceEditor({ experience = [], onChange, accentColor }) {
  const addExperience = () => onChange([...experience, {
    id: Date.now(), role: "", company: "", location: "", startMonth: "01", startYear: "2023",
    endMonth: "12", endYear: "present", current: false, bullets: [""],
  }]);

  const updateExp = (id, key, val) =>
    onChange(experience.map(e => e.id === id ? { ...e, [key]: val } : e));

  const updateBullet = (expId, idx, val) =>
    onChange(experience.map(e =>
      e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? val : b) } : e
    ));

  const addBullet = (expId) =>
    onChange(experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e));

  const removeBullet = (expId, idx) =>
    onChange(experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e));

  return (
    <EditorSection title="Work Experience" icon={Briefcase} badge={`${experience.length}`} defaultOpen={false}>
      <div className="space-y-5 text-left">
        {experience.map((exp) => (
          <div key={exp.id} className="p-4 border border-border rounded-xl bg-background/50 space-y-3 relative group">
            <button
              onClick={() => onChange(experience.filter(e => e.id !== exp.id))}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Job Title</Label><Input value={exp.role} onChange={v => updateExp(exp.id, "role", v)} placeholder="Senior Frontend Engineer" /></div>
              <div><Label>Company</Label><Input value={exp.company} onChange={v => updateExp(exp.id, "company", v)} placeholder="Acme Corp" /></div>
              <div><Label>Location</Label><Input value={exp.location} onChange={v => updateExp(exp.id, "location", v)} placeholder="San Francisco, CA" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <div className="flex gap-2">
                  <Select options={MONTHS} value={exp.startMonth} onChange={v => updateExp(exp.id, "startMonth", v)} size="sm" />
                  <Select options={YEARS(2000)} value={exp.startYear} onChange={v => updateExp(exp.id, "startYear", v)} size="sm" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>End Date</Label>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={exp.current} onChange={e => updateExp(exp.id, "current", e.target.checked)} className="rounded border-border text-primary focus:ring-primary/25" />
                    Present
                  </label>
                </div>
                {!exp.current && (
                  <div className="flex gap-2">
                    <Select options={MONTHS} value={exp.endMonth} onChange={v => updateExp(exp.id, "endMonth", v)} size="sm" />
                    <Select options={YEARS(2000)} value={exp.endYear} onChange={v => updateExp(exp.id, "endYear", v)} size="sm" />
                  </div>
                )}
                {exp.current && <div className="h-9 flex items-center px-3.5 bg-muted/50 border border-border rounded-xl text-xs text-muted-foreground">Present</div>}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Bullet Points</Label>
                <button onClick={() => addBullet(exp.id)} className="text-[11px] text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                  <Plus size={10} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {exp.bullets.map((b, bi) => (
                  <div key={bi} className="flex items-start gap-2">
                    <span className="mt-2.5 text-muted-foreground/50 flex-shrink-0" style={{ color: accentColor }}>•</span>
                    <input
                      value={b}
                      onChange={e => updateBullet(exp.id, bi, e.target.value)}
                      placeholder="Describe a key achievement or responsibility…"
                      className="flex-1 h-9 px-3 text-xs bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {exp.bullets.length > 1 && (
                      <button onClick={() => removeBullet(exp.id, bi)} className="mt-2.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0 cursor-pointer">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button onClick={addExperience} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-all cursor-pointer">
          <Plus size={14} /> Add Experience
        </button>
      </div>
    </EditorSection>
  );
}