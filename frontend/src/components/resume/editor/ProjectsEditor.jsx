import { FolderOpen, Trash2, Plus } from "lucide-react";
import EditorSection, { Label, Input, Textarea } from "./EditorSection";

export default function ProjectsEditor({ projects = [], onChange }) {
  const addProject = () => onChange([...projects, {
    id: Date.now(), name: "", tech: "", url: "", desc: "",
  }]);

  const updateProj = (id, key, val) =>
    onChange(projects.map(p => p.id === id ? { ...p, [key]: val } : p));

  return (
    <EditorSection title="Projects" icon={FolderOpen} badge={`${projects.length}`} defaultOpen={false}>
      <div className="space-y-4 text-left">
        {projects.map(p => (
          <div key={p.id} className="p-4 border border-border rounded-xl bg-background/50 space-y-3 relative group">
            <button
              onClick={() => onChange(projects.filter(x => x.id !== p.id))}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
            <div>
              <Label>Project Name</Label>
              <Input value={p.name} onChange={v => updateProj(p.id, "name", v)} placeholder="AI Resume Builder" />
            </div>
            <div>
              <Label>Technologies</Label>
              <Input value={p.tech} onChange={v => updateProj(p.id, "tech", v)} placeholder="React · Node.js · PostgreSQL" />
            </div>
            <div>
              <Label>URL (optional)</Label>
              <Input value={p.url} onChange={v => updateProj(p.id, "url", v)} placeholder="github.com/you/project" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={p.desc} onChange={v => updateProj(p.id, "desc", v)} placeholder="Describe the project and its impact…" rows={2} />
            </div>
          </div>
        ))}
        <button onClick={addProject} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/3 transition-all cursor-pointer">
          <Plus size={14} /> Add Project
        </button>
      </div>
    </EditorSection>
  );
}