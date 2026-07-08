import { useEffect, useState } from "react";
import { Code2, Plus, X } from "lucide-react";
import Section from "./common/Section";
import {
  createSkill,
  deleteSkill,
  getSkills,
} from "../../resume/services/skillService";
import { useAuth } from "../../auth/context/AuthContext";

export default function SkillSection() {
  const { user } = useAuth();
  const skillsKey = user?.email ? `profile_skills_${user.email}` : null;

  const [skills, setSkills] = useState(() => {
    if (typeof window !== "undefined" && skillsKey) {
      const cached = localStorage.getItem(skillsKey);
      try {
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [newSkill, setNewSkill] = useState("");
  const [skillError, setSkillError] = useState(null);

  const loadSkills = async () => {
    const key = user?.email ? `profile_skills_${user.email}` : null;
    try {
      const response = await getSkills();
      setSkills(response.data);
      if (key) {
        localStorage.setItem(key, JSON.stringify(response.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      const load = async () => {
        await Promise.resolve();
        const key = `profile_skills_${user.email}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            setSkills(JSON.parse(cached));
          } catch (err) {
            console.error("Failed to parse cached skills:", err);
          }
        }
        loadSkills();
      };
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    try {
      setSkillError(null);
      const response = await createSkill({
        skill_name: newSkill,
      });
      setSkills((prev) => {
        const next = [...prev, response.data];
        if (skillsKey) {
          localStorage.setItem(skillsKey, JSON.stringify(next));
        }
        return next;
      });
      setNewSkill("");
    } catch (err) {
      console.error(err);
      setSkillError("Failed to add skill. Please try again.");
    }
  };

  const handleDeleteSkill = async (id) => {
    await deleteSkill(id);

    setSkills((prev) => {
      const next = prev.filter((skill) => skill.id !== id);
      if (skillsKey) {
        localStorage.setItem(skillsKey, JSON.stringify(next));
      }
      return next;
    });
  };

  return (
    <Section title="Skills & Technologies" icon={Code2}>
      {skillError && (
        <p className="text-xs text-red-500 mb-2 font-medium">{skillError}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        {skills.map((s) => (
          <span
            key={s.id}
            className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-muted border border-border rounded-xl text-xs font-medium text-foreground hover:border-destructive/30 transition-all"
          >
            {s.skill_name}
            <button
              onClick={() => handleDeleteSkill(s.id)}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          placeholder="Add a skill and press Enter..."
          className="flex-1 px-3 py-2 text-sm bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
        />
        <button
          onClick={handleAddSkill}
          disabled={!newSkill.trim()}
          className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 disabled:opacity-40 transition-all"
        >
          <Plus size={15} />
        </button>
      </div>
    </Section>
  );
}
