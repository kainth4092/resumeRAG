import { User } from "lucide-react";
import EditorSection, { Label, Input } from "./EditorSection";

export default function PersonalEditor({ personal = {}, onChange }) {
  const setP = (k) => (v) => onChange({ ...personal, [k]: v });

  return (
    <EditorSection title="Personal Information" icon={User} defaultOpen>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        <div className="sm:col-span-2">
          <Label>Full Name</Label>
          <Input value={personal.name} onChange={setP("name")} placeholder="Jordan Davis" />
        </div>
        <div className="sm:col-span-2">
          <Label>Professional Title</Label>
          <Input value={personal.title} onChange={setP("title")} placeholder="Senior Software Engineer" />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={personal.email} onChange={setP("email")} placeholder="you@example.com" type="email" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={personal.phone} onChange={setP("phone")} placeholder="+1 (415) 555-0000" />
        </div>
        <div>
          <Label>Location</Label>
          <Input value={personal.location} onChange={setP("location")} placeholder="San Francisco, CA" />
        </div>
        <div>
          <Label>Website</Label>
          <Input value={personal.website} onChange={setP("website")} placeholder="yoursite.com" />
        </div>
        <div>
          <Label>LinkedIn</Label>
          <Input value={personal.linkedin} onChange={setP("linkedin")} placeholder="linkedin.com/in/you" />
        </div>
        <div>
          <Label>GitHub</Label>
          <Input value={personal.github} onChange={setP("github")} placeholder="github.com/you" />
        </div>
      </div>
    </EditorSection>
  );
}
