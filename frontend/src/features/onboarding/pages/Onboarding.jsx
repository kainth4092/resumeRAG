import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Upload,
  Sparkles,
  Zap,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Laptop,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";
import { createProfile, updateProfile } from "../../profile/services/profileService";
import { uploadResume } from "../../resume/services/resumeService";
import ProgressBar from "../components/ProgressBar";
import SelectCard from "../components/SelectCard";
import Chip from "../components/Chip";
import { AuthInput } from "../../auth/pages/AuthComponents";

const TOTAL_STEPS = 7;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [resumePref, setResumePref] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const fileInputRef = useRef(null);

  const roleSuggestions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Product Manager",
    "Data Analyst",
  ];
  const skillSuggestions = [
    "React",
    "JavaScript",
    "Python",
    "Node.js",
    "SQL",
    "Docker",
    "AWS",
    "Git",
  ];

  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleNext = async () => {
    if (step === 5) {
      if (resumePref === "upload") {
        setStep(6);
      } else {
        await handleFinishOnboarding();
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Save onboarding profile data
      setLoadingText("Configuring your career profile...");
      try {
        await createProfile({
          full_name: user?.name || "Career Professional",
          headline: `${experience} ${role || "Professional"}`,
          summary: `Career Goal: ${goal}. Specialized in: ${skills.join(", ")}.`,
        });
      } catch (profileErr) {
        if (profileErr.response?.status === 409) {
          console.warn("Profile already exists, updating existing profile.");
          await updateProfile({
            full_name: user?.name || "Career Professional",
            headline: `${experience} ${role || "Professional"}`,
            summary: `Career Goal: ${goal}. Specialized in: ${skills.join(", ")}.`,
          });
        } else {
          throw profileErr;
        }
      }

      // 2. Upload file if uploaded
      if (resumePref === "upload" && file) {
        setLoadingText("Parsing and indexing your resume...");
        const formData = new FormData();
        formData.append("file", file);
        await uploadResume(formData);
      }

      setLoadingText("Finalizing your workspace...");
      if (user?.email) {
        localStorage.setItem(`onboarded_${user.email}`, "true");
      }
      await fetchUser(true);
      setStep(7);
    } catch (err) {
      console.error("Onboarding failed", err);
      // Fallback: still fetch user status to break any redirect loops
      try {
        await fetchUser(true);
      } catch (fetchErr) {
        console.error("Failed to fetch user in fallback", fetchErr);
      }
      setStep(7);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Background radial gradient & blurs */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main glassmorphism container */}
      <div className="w-full max-w-2xl bg-card/75 backdrop-blur-md border border-border/80 rounded-3xl p-8 shadow-xl space-y-8 relative overflow-hidden z-10 flex flex-col justify-between min-h-[500px]">
        {step < 7 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
              <span className="uppercase tracking-wider">
                Onboarding Journey
              </span>
              <span>
                Step {step} of {TOTAL_STEPS - 1}
              </span>
            </div>
            <ProgressBar step={step} totalSteps={TOTAL_STEPS - 1} />
          </div>
        )}

        {/* Step 1: Goal */}
        {step === 1 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                What is your primary career goal right now?
              </h1>
              <p className="text-sm text-muted-foreground">
                Tell us what you hope to achieve with ResuPilot AI.
              </p>
            </div>
            <div className="space-y-4">
              <SelectCard
                icon={TrendingUp}
                label="Land a New Job"
                desc="Explore active listings, optimize keywords, and pass resume checks."
                selected={goal === "job-hunt"}
                onClick={() => setGoal("job-hunt")}
              />
              <SelectCard
                icon={Briefcase}
                label="Transition Career Path"
                desc="Translate your skills into a new role or industry sector."
                selected={goal === "career-pivot"}
                onClick={() => setGoal("career-pivot")}
              />
              <SelectCard
                icon={GraduationCap}
                label="Build a Professional Portfolio"
                desc="Refine your resume and structure achievements for review."
                selected={goal === "portfolio"}
                onClick={() => setGoal("portfolio")}
              />
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Select your professional experience level
              </h1>
              <p className="text-sm text-muted-foreground">
                This helps customize the structure of your AI resumes.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectCard
                icon={Laptop}
                label="Entry Level"
                desc="0-2 years of experience"
                selected={experience === "Entry-level"}
                onClick={() => setExperience("Entry-level")}
              />
              <SelectCard
                icon={Laptop}
                label="Mid Career"
                desc="2-5 years of experience"
                selected={experience === "Mid-career"}
                onClick={() => setExperience("Mid-career")}
              />
              <SelectCard
                icon={Laptop}
                label="Senior Level"
                desc="5+ years of experience"
                selected={experience === "Senior"}
                onClick={() => setExperience("Senior")}
              />
              <SelectCard
                icon={Laptop}
                label="Executive"
                desc="Lead / Management roles"
                selected={experience === "Executive"}
                onClick={() => setExperience("Executive")}
              />
            </div>
          </div>
        )}

        {/* Step 3: Target Role */}
        {step === 3 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                What role are you targeting next?
              </h1>
              <p className="text-sm text-muted-foreground">
                We will tailor job findings and recommendations to this title.
              </p>
            </div>
            <div className="space-y-4">
              <AuthInput
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                icon={<Briefcase size={16} />}
              />
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Suggested Roles
                </p>
                <div className="flex flex-wrap gap-2">
                  {roleSuggestions.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      selected={role === r}
                      onClick={() => setRole(r)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Skills */}
        {step === 4 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Add your core technical and professional skills
              </h1>
              <p className="text-sm text-muted-foreground">
                Add at least one skill to build a strong profile (recommend
                three).
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <AuthInput
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddSkill(skillInput)
                    }
                    placeholder="Type a skill and press Enter"
                    icon={<Plus size={16} />}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="bg-primary hover:bg-primary/95 text-primary-foreground px-5 rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-[0.98] text-sm font-semibold"
                >
                  Add
                </button>
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/40 rounded-xl border border-border">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="hover:text-destructive cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Suggested Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      selected={skills.includes(s)}
                      onClick={() => handleAddSkill(s)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Resume preference */}
        {step === 5 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                How would you like to set up your resume?
              </h1>
              <p className="text-sm text-muted-foreground">
                Choose whether to import your history or draft a fresh version.
              </p>
            </div>
            <div className="space-y-4">
              <SelectCard
                icon={Upload}
                label="Upload Existing PDF/DOCX"
                desc="We will extract your work experience, education, and skills instantly."
                selected={resumePref === "upload"}
                onClick={() => setResumePref("upload")}
              />
              <SelectCard
                icon={Sparkles}
                label="Create Fresh Resume with AI"
                desc="Build from scratch using our guided step-by-step editor."
                selected={resumePref === "fresh"}
                onClick={() => setResumePref("fresh")}
              />
            </div>
          </div>
        )}

        {/* Step 6: File Dropzone (if chosen upload) */}
        {step === 6 && (
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Upload your current resume
              </h1>
              <p className="text-sm text-muted-foreground">
                Supports PDF and DOCX formats up to 5MB.
              </p>
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 bg-card hover:bg-primary/5 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all text-center group shadow-sm hover:shadow"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Upload size={22} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {file ? file.name : "Click to select or drag file here"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or DOCX (Max 5MB)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay for step 6 processing / finishing */}
        {loading && (
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50 animate-in fade-in">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-semibold text-foreground">
              {loadingText}
            </p>
          </div>
        )}

        {/* Step 7: Completed screen */}
        {step === 7 && (
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Workspace is ready!
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We've customized your Copilot workspace based on your target
                goals and experience level.
              </p>
            </div>
            <div className="w-full max-w-xs mx-auto text-left bg-muted/30 border border-border p-4 rounded-2xl space-y-2.5">
              <div className="flex gap-2.5 text-xs font-semibold text-foreground/80">
                <Zap size={14} className="text-primary shrink-0 mt-0.5" />
                <span>Targeting {role || "Professional"} roles</span>
              </div>
              <div className="flex gap-2.5 text-xs font-semibold text-foreground/80">
                <Zap size={14} className="text-primary shrink-0 mt-0.5" />
                <span>{skills.length} skills tracked</span>
              </div>
              <div className="flex gap-2.5 text-xs font-semibold text-foreground/80">
                <Zap size={14} className="text-primary shrink-0 mt-0.5" />
                <span>Default {experience} path configured</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-2xl shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Control Footer */}
        {step < 7 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                step === 1
                  ? "text-muted-foreground/40 cursor-not-allowed"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {step === 6 ? (
              <button
                type="button"
                onClick={handleFinishOnboarding}
                disabled={!file}
                className="bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Upload & Finish <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={
                  (step === 1 && !goal) ||
                  (step === 2 && !experience) ||
                  (step === 3 && !role) ||
                  (step === 4 && skills.length < 1) ||
                  (step === 5 && !resumePref)
                }
                className="bg-primary hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Continue <ArrowRight size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
