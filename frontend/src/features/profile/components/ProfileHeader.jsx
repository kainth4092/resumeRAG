import { useState, useRef } from "react";
import { CheckCircle2, Loader2, Sparkles, User } from "lucide-react";
import { uploadResume } from "../../resume/services/resumeService";
import { extractProfileFromResume } from "../services/profileService";

export default function ProfileHeader({ profileSaved, onRefresh }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await uploadResume(formData);
      const resumeId = uploadRes.data?.resume_id;
      const profileExtracted = uploadRes.data?.profile_extracted;

      if (!resumeId) {
        throw new Error("Failed to upload file. Please try again.");
      }

      if (!profileExtracted) {
        await extractProfileFromResume(resumeId);
      }

      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to extract profile details.",
      );
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 bg-muted/30 border border-border/80 rounded-2xl">
      <div className="flex items-center gap-3 text-left">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shrink-0">
          <User className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Profile Data</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your professional profile powers all AI resume generation.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto">
        {profileSaved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-xl font-semibold transition-all">
            <CheckCircle2 size={13} /> Changes saved
          </span>
        )}

        {error && (
          <span className="text-xs text-red-500 font-semibold bg-red-500/5 border border-red-500/15 px-2.5 py-1.5 rounded-xl">
            {error}
          </span>
        )}

        <button
          onClick={handleButtonClick}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Extracting Profile...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>Import from Resume</span>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
