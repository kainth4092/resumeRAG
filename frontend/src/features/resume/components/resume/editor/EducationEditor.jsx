import { GraduationCap, Trash2, Plus } from "lucide-react";
import EditorSection, { Label, Input } from "./EditorSection";
import { Select, YEARS, CURRENT_YEARS } from "./Select";

export default function EducationEditor({ education = [], onChange }) {
  const addEducation = () => onChange([...education, {
    id: Date.now(), degree: "", school: "", location: "", startYear: "2018", endYear: "2022", gpa: "", honors: "",
  }]);

  const updateEdu = (id, key, val) =>
    onChange(education.map(e => e.id === id ? { ...e, [key]: val } : e));

  return (
    <EditorSection title="Education" icon={GraduationCap} badge={`${education.length}`} defaultOpen={false}>
      <div className="space-y-4 text-left">
        {education.map((edu) => (
          <div key={edu.id} className="p-4 border border-border rounded-xl bg-background/50 space-y-3 relative group">
            <button
              onClick={() => onChange(education.filter(e => e.id !== edu.id))}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Degree</Label>
                <Input value={edu.degree} onChange={v => updateEdu(edu.id, "degree", v)} placeholder="B.S. Computer Science" />
              </div>
              <div>
                <Label>School</Label>
                <Input value={edu.school} onChange={v => updateEdu(edu.id, "school", v)} placeholder="UC Berkeley" />
              </div>
              <div>
                <Label>GPA (optional)</Label>
                <Input value={edu.gpa} onChange={v => updateEdu(edu.id, "gpa", v)} placeholder="3.8" />
              </div>
              <div>
                <Label>Start Year</Label>
                <Select options={YEARS(1990)} value={edu.startYear} onChange={v => updateEdu(edu.id, "startYear", v)} size="md" />
              </div>
              <div>
                <Label>End Year</Label>
                <Select options={CURRENT_YEARS()} value={edu.endYear} onChange={v => updateEdu(edu.id, "endYear", v)} size="md" />
              </div>
            </div>
          </div>
        ))}
        <button onClick={addEducation} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-all cursor-pointer">
          <Plus size={14} /> Add Education
        </button>
      </div>
    </EditorSection>
  );
}