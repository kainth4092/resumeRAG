import { Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import Section from "./common/Section";
import EditableCard from "./common/EditableCard";
import Modal from "./common/Modal";
import Field from "./common/Field";
import Select from "../../resume/components/resume/dashboard/Select";
import {
  createExperience,
  deleteExperience,
  getExperiences,
  updateExperience,
} from "../../resume/services/experienceService";
import { MONTHS } from "../../../data/experienceData";

import { useAuth } from "../../auth/context/AuthContext";

export default function ExperienceSection() {
  const { user } = useAuth();
  const experiencesKey = user?.email ? `profile_experience_${user.email}` : null;

  const [experiences, setExperiences] = useState(() => {
    if (typeof window !== "undefined" && experiencesKey) {
      const cached = localStorage.getItem(experiencesKey);
      try {
        return cached ? JSON.parse(cached) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined" && experiencesKey) {
      return !localStorage.getItem(experiencesKey);
    }
    return true;
  });
  const [expModal, setExpModal] = useState(null);
  const [expDraft, setExpDraft] = useState({
    id: null,
    role: "",
    company: "",
    description: "",
    start_month: "",
    start_year: "",
    end_month: "",
    end_year: "",
    currently_working: false,
  });
  const [expSaving, setExpSaving] = useState(false);
  const [expError, setExpError] = useState(null);

  const loadExperiences = async () => {
    const key = user?.email ? `profile_experience_${user.email}` : null;
    try {
      if (!key || !localStorage.getItem(key)) {
        setLoading(true);
      }
      const response = await getExperiences();
      setExperiences(response.data);
      if (key) {
        localStorage.setItem(key, JSON.stringify(response.data));
      }
    } catch (err) {
      console.error("Failed to load experiences", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const load = async () => {
        await Promise.resolve();
        const key = `profile_experience_${user.email}`;
        const cached = localStorage.getItem(key);
        if (cached) {
          try {
            setExperiences(JSON.parse(cached));
            setLoading(false);
          } catch (err) {
            console.error("Failed to parse cached experience:", err);
          }
        }
        loadExperiences();
      };
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openExpModal = () => {
    setExpDraft({
      id: null,
      role: "",
      company: "",
      description: "",
      start_month: "",
      start_year: "",
      end_month: "",
      end_year: "",
      currently_working: false,
    });
    setExpError(null);
    setExpModal(true);
  };

  const openEditModal = (exp) => {
    setExpDraft({
      id: exp.id,
      role: exp.role || "",
      company: exp.company || "",
      description: exp.description || "",
      start_month: exp.start_month || "",
      start_year: exp.start_year || "",
      end_month: exp.end_month || "",
      end_year: exp.end_year || "",
      currently_working: exp.currently_working || false,
    });
    setExpError(null);
    setExpModal(true);
  };

  const saveExperience = async () => {
    const payload = {
      role: expDraft.role,
      company: expDraft.company,
      description: expDraft.description || null,
      start_month: expDraft.start_month || null,
      start_year: expDraft.start_year ? parseInt(expDraft.start_year) : null,
      currently_working: expDraft.currently_working,
      end_month: expDraft.currently_working ? null : expDraft.end_month || null,
      end_year: expDraft.currently_working
        ? null
        : expDraft.end_year
          ? parseInt(expDraft.end_year)
          : null,
    };

    try {
      setExpSaving(true);
      setExpError(null);
      if (expDraft.id) {
        const response = await updateExperience(expDraft.id, payload);
        setExperiences((prev) => {
          const next = prev.map((item) => (item.id === expDraft.id ? response.data : item));
          if (experiencesKey) {
            localStorage.setItem(experiencesKey, JSON.stringify(next));
          }
          return next;
        });
      } else {
        const response = await createExperience(payload);
        setExperiences((prev) => {
          const next = [...prev, response.data];
          if (experiencesKey) {
            localStorage.setItem(experiencesKey, JSON.stringify(next));
          }
          return next;
        });
      }
      setExpModal(false);
    } catch (err) {
      console.error("Failed to save experience", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setExpError(detail[0]?.msg || "Validation error saving experience.");
      } else {
        setExpError(detail || "Failed to save experience.");
      }
    } finally {
      setExpSaving(false);
    }
  };

  const removeExperience = async (id) => {
    try {
      await deleteExperience(id);
      setExperiences((prev) => {
        const next = prev.filter((item) => item.id !== id);
        if (experiencesKey) {
          localStorage.setItem(experiencesKey, JSON.stringify(next));
        }
        return next;
      });
    } catch (err) {
      console.error("Failed to delete experience", err);
    }
  };

  const formatPeriod = (exp) => {
    const startMonth = exp.start_month ? exp.start_month.slice(0, 3) : "";
    const start = `${startMonth} ${exp.start_year || ""}`.trim();
    const endMonth = exp.end_month ? exp.end_month.slice(0, 3) : "";
    const end = exp.currently_working
      ? "Present"
      : `${endMonth} ${exp.end_year || ""}`.trim();
    if (!start && !end) return "";
    return `${start} – ${end}`;
  };

  const monthOptions = MONTHS.map((m) => ({ value: m, label: m }));

  return (
    <>
      <Section
        title="Work Experience"
        icon={Briefcase}
        onAdd={() => openExpModal()}
        addLabel="Add Experience"
      >
        {loading ? (
          <div className="py-4 text-sm text-muted-foreground">
            Loading experiences...
          </div>
        ) : experiences.length === 0 ? (
          <div className="py-8 text-center">
            <Briefcase
              size={24}
              className="mx-auto mb-2 text-muted-foreground/40"
            />
            <p className="text-sm text-muted-foreground">
              No experience added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((e) => (
              <EditableCard
                key={e.id}
                onEdit={() => openEditModal(e)}
                onDelete={() => removeExperience(e.id)}
              >
                <div className="flex items-start gap-3 pr-16">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Briefcase size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-md font-semibold text-foreground">
                      {e.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {e.company} · {formatPeriod(e)}
                    </p>
                    {e.description && (
                      <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">
                        {e.description}
                      </p>
                    )}
                  </div>
                </div>
              </EditableCard>
            ))}
          </div>
        )}
      </Section>

      {expModal && (
        <Modal
          title={expDraft.id ? "Edit Experience" : "Add Experience"}
          onSave={saveExperience}
          onClose={() => setExpModal(false)}
          saving={expSaving}
          error={expError}
        >
          <Field
            label="Role"
            value={expDraft.role}
            onChange={(v) => setExpDraft((prev) => ({ ...prev, role: v }))}
            placeholder="e.g. Senior Frontend Engineer"
          />
          <Field
            label="Company"
            value={expDraft.company}
            onChange={(v) => setExpDraft((prev) => ({ ...prev, company: v }))}
            placeholder="e.g. Acme Corp"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Start Month
              </label>
              <Select
                options={monthOptions}
                value={expDraft.start_month}
                onChange={(val) => setExpDraft((prev) => ({ ...prev, start_month: val }))}
                placeholder="Select Month"
                size="sm"
              />
            </div>
            <div>
              <Field
                label="Start Year"
                value={expDraft.start_year || ""}
                onChange={(v) =>
                  setExpDraft((prev) => ({ ...prev, start_year: v }))
                }
                placeholder="e.g. 2021"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="currently_working"
              checked={expDraft.currently_working || false}
              onChange={(e) =>
                setExpDraft((prev) => {
                  const checked = e.target.checked;
                  return {
                    ...prev,
                    currently_working: checked,
                    end_month: checked ? "" : prev.end_month,
                    end_year: checked ? "" : prev.end_year,
                  };
                })
              }
              className="rounded border-border text-primary focus:ring-primary/25"
            />
            <label
              htmlFor="currently_working"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer select-none"
            >
              I currently work here
            </label>
          </div>

          {!expDraft.currently_working && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  End Month
                </label>
                <Select
                  options={monthOptions}
                  value={expDraft.end_month}
                  onChange={(val) => setExpDraft((prev) => ({ ...prev, end_month: val }))}
                  placeholder="Select Month"
                  size="sm"
                />
              </div>
              <div>
                <Field
                  label="End Year"
                  value={expDraft.end_year || ""}
                  onChange={(v) =>
                    setExpDraft((prev) => ({ ...prev, end_year: v }))
                  }
                  placeholder="e.g. 2024"
                />
              </div>
            </div>
          )}

          <Field
            label="Description"
            value={expDraft.description}
            onChange={(v) =>
              setExpDraft((prev) => ({ ...prev, description: v }))
            }
            placeholder="Describe your role, responsibilities, and achievements..."
            multiline
          />
        </Modal>
      )}
    </>
  );
}
