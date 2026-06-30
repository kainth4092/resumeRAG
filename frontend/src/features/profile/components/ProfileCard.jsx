import { Camera, Edit2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import Field from "./common/Field";
import {
  getProfile,
  updateProfile,
  createProfile,
} from "../services/profileService";

export default function ProfileCard({ setProfileSaved }) {
  const [profile, setProfile] = useState(null);
  const [profileDraft, setProfileDraft] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await getProfile();

      setProfile(response.data);
      setProfileDraft(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        const emptyProfile = {
          full_name: "",
          headline: "",
          phone: "",
          location: "",
          linkedin_url: "",
          github_url: "",
          portfolio_url: "",
          summary: "",
        };

        setProfile(emptyProfile);
        setProfileDraft(emptyProfile);
        setEditingProfile(false);

        return;
      }

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || "Validation error.");
      } else {
        setError(detail || "Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      setProfileSaving(true);

      if (profile?.id) {
        await updateProfile(profileDraft);
      } else {
        await createProfile(profileDraft);
      }
      await loadProfile();
      setEditingProfile(false);

      setProfileSaved(true);

      setTimeout(() => {
        setProfileSaved(false);
      }, 2000);
    } catch (err) {
      if (err.response?.status === 404) {
        const emptyProfile = {
          full_name: "",
          headline: "",
          phone: "",
          location: "",
          linkedin_url: "",
          github_url: "",
          portfolio_url: "",
          summary: "",
        };
        setProfile(emptyProfile);
        setProfileDraft(emptyProfile);
        setEditingProfile(true);
      } else {
        setError(err.response?.data?.detail || "Failed to load profile.");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="h-24 bg-linear-to-r from-primary/20 via-primary/10 to-transparent relative">
        <div className="absolute bottom-0 left-6 translate-y-1/2 flex items-end gap-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border-4 border-card flex items-center justify-center text-primary text-2xl font-bold shadow-md">
              {profile?.full_name
                ? profile.full_name.charAt(0).toUpperCase()
                : "U"}
            </div>

            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Camera size={11} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-12 px-6 pb-5">
        {!editingProfile ? (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-foreground">
                  {profile?.full_name || "No Name"}
                </h2>
                <p className="text-md text-muted-foreground mt-1">
                  {profile?.headline || "No Headline"}
                </p>

                <p className="text-md text-muted-foreground mt-1">
                  {profile?.location || "No Location"}
                </p>

                <div className="flex flex-wrap gap-3 mt-3">
                  {profile?.linkedin_url && (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      LinkedIn
                    </a>
                  )}

                  {profile?.github_url && (
                    <a
                      href={profile.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      GitHub
                    </a>
                  )}

                  {profile?.portfolio_url && (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Portfolio
                    </a>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {profile?.summary || "No summary added yet."}
                </p>
              </div>

              <button
                onClick={() => {
                  setProfileDraft(profile);
                  setEditingProfile(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold"
              >
                <Edit2 size={12} />
                Edit
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Field
              label="Full Name"
              value={profileDraft?.full_name || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  full_name: v,
                })
              }
            />

            <Field
              label="Headline"
              value={profileDraft?.headline || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  headline: v,
                })
              }
            />

            <Field
              label="Phone"
              value={profileDraft?.phone || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  phone: v,
                })
              }
            />

            <Field
              label="Location"
              value={profileDraft?.location || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  location: v,
                })
              }
            />

            <Field
              label="LinkedIn"
              value={profileDraft?.linkedin_url || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  linkedin_url: v,
                })
              }
            />

            <Field
              label="GitHub"
              value={profileDraft?.github_url || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  github_url: v,
                })
              }
            />

            <Field
              label="Portfolio"
              value={profileDraft?.portfolio_url || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  portfolio_url: v,
                })
              }
            />

            <Field
              label="Professional Summary"
              value={profileDraft?.summary || ""}
              onChange={(v) =>
                setProfileDraft({
                  ...profileDraft,
                  summary: v,
                })
              }
              multiline
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setProfileDraft(profile);
                  setEditingProfile(false);
                }}
                className="px-4 py-2 rounded-xl border border-border"
              >
                Cancel
              </button>

              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
