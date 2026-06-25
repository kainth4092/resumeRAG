import { useEffect, useState } from "react";
import Section from "./common/Section";
import { GraduationCap } from "lucide-react";
import EditableCard from "./common/EditableCard";
import Modal from "./common/Modal";
import Field from "./common/Field";
import {
  createEducation,
  deleteEducation,
  getEducation,
  updateEducation,
} from "../../services/educationService";

export default function EducationSection() {
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eduModal, setEduModal] = useState(null);
  const [eduDraft, setEduDraft] = useState({
    id: null,
    degree: "",
    institution: "",
    start_year: "",
    end_year: "",
  });
  const [eduSaving, setEduSaving] = useState(false);
  const [eduError, setEduError] = useState(null);

  const loadEducations = async () => {
    try {
      setLoading(true);
      const response = await getEducation();
      setEducation(response.data);
    } catch (err) {
      console.error("Failed to load education", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadEducations();
  }, []);

  const openEduModal = () => {
    setEduDraft({
      id: null,
      degree: "",
      institution: "",
      start_year: "",
      end_year: "",
    });
    setEduError(null);
    setEduModal(true);
  };
  const openEditModal = (edu) => {
    setEduDraft({
      id: edu.id,
      degree: edu.degree || "",
      institution: edu.institution || "",
      start_year: edu.start_year || "",
      end_year: edu.end_year || "",
    });
    setEduError(null);
    setEduModal(true);
  };

  const saveEducation = async () => {
    const payload = {
      degree: eduDraft.degree,
      institution: eduDraft.institution,
      start_year: eduDraft.start_year ? parseInt(eduDraft.start_year) : null,
      end_year: eduDraft.end_year ? parseInt(eduDraft.end_year) : null,
    };

    try {
      setEduSaving(true);
      setEduError(null);
      if (eduDraft.id) {
        const response = await updateEducation(eduDraft.id, payload);
        setEducation((prev) =>
          prev.map((item) => (item.id === eduDraft.id ? response.data : item)),
        );
      } else {
        const response = await createEducation(payload);
        setEducation((prev) => [...prev, response.data]);
      }
      setEduModal(false);
    } catch (err) {
      console.error("Failed to save education", err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setEduError(detail[0]?.msg || "Validation error saving education.");
      } else {
        setEduError(detail || "Failed to save education.");
      }
    } finally {
      setEduSaving(false);
    }
  };

  const removeEducation = async (id) => {
    try {
      await deleteEducation(id);
      setEducation((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete education", err);
    }
  };

  const formatPeriod = (edu) => {
    const start = edu.start_year || "";
    const end = edu.end_year || "";
    if (!start && !end) return "";
    return `${start} – ${end}`;
  };

  return (
    <>
      <Section
        title="Education"
        icon={GraduationCap}
        onAdd={() => openEduModal()}
        addLabel="Add Education"
      >
        {loading ? (
          <div className="py-4 text-sm text-muted-foreground">
            Loading education...
          </div>
        ) : education.length === 0 ? (
          <div className="py-8 text-center">
            <GraduationCap
              size={24}
              className="mx-auto mb-2 text-muted-foreground/40"
            />
            <p className="text-sm text-muted-foreground">
              No education added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {education.map((e) => (
              <EditableCard
                key={e.id}
                onEdit={() => openEditModal(e)}
                onDelete={() => removeEducation(e.id)}
              >
                <div className="flex items-start gap-3 pr-16">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={14} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-md font-semibold text-foreground">
                      {e.degree}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {e.institution} · {formatPeriod(e)}{" "}
                    </p>
                  </div>
                </div>
              </EditableCard>
            ))}
          </div>
        )}
      </Section>

      {eduModal && (
        <Modal
          title={eduDraft.id ? "Edit Education" : "Add Education"}
          onSave={saveEducation}
          onClose={() => setEduModal(null)}
          saving={eduSaving}
          error={eduError}
        >
          <Field
            label="Degree"
            value={eduDraft.degree}
            onChange={(v) => setEduDraft((d) => ({ ...d, degree: v }))}
            placeholder="B.S. Computer Science"
          />
          <Field
            label="institution"
            value={eduDraft.institution}
            onChange={(v) => setEduDraft((d) => ({ ...d, institution: v }))}
            placeholder="MIT"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Start Year"
              value={eduDraft.start_year}
              onChange={(v) => setEduDraft((d) => ({ ...d, start_year: v }))}
              placeholder="e.g 2022"
            />
            <Field
              label="End Year"
              value={eduDraft.end_year}
              onChange={(v) => setEduDraft((d) => ({ ...d, end_year: v }))}
              placeholder="e.g 2026"
            />
          </div>
        </Modal>
      )}
    </>
  );
}
