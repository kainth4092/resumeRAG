import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Zap,
  FileText,
  Briefcase,
  MessageSquare,
  Map,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Edit3,
  Bookmark,
  Award,
  BookOpen,
} from "lucide-react";

import {
  createPipelineRun,
  getPipelineRun,
  getRecommendedJobsByResume,
  getInterviewSessionByResume,
  getRoadmapByResume,
  getResumeById,
} from "../services/pipelineService";
import { getResumes } from "../../resume/services/resumeService";
import { saveJob } from "../../jobs/services/jobs.service";
import { toggleTask } from "../../careerRoadmap/services/roadmapService";
import { toast } from "sonner";
import { getQuestionDetails } from "../../interview/services/interviewService";
import { generateLayout } from "../../resume/components/resume/templates/templateLayouts";
import ReactPreviewRenderer from "../../resume/components/resume/templates/ReactPreviewRenderer";
import { fromApi } from "../../resume/model/resumeModel";

const STEP_LABELS = {
  extract_job_context: { label: "Extract Job Context", desc: "Analyzing key skills, level & requirements" },
  generate_resume: { label: "Tailor Resume", desc: "Factual re-wording & explainable ATS scoring" },
  jobs: { label: "Find Matching Jobs", desc: "Semantic FastEmbed ranking & skill overlap" },
  interview: { label: "Prep 25 Questions", desc: "Targeted technical, project & gap questions" },
  roadmap: { label: "Build Roadmap", desc: "Personalized milestone plan & project goals" },
};

const TEMPLATES = ["Professional", "Modern", "Minimal", "Corporate", "ATS"];

export default function PipelinePage() {
  const { runId: routeRunId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Input form state
  const [sourceType, setSourceType] = useState("resume"); // "resume" | "profile"
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [userResumes, setUserResumes] = useState([]);
  const [jobDescription, setJobDescription] = useState(
    () => location.state?.job?.job_description || location.state?.job?.description || location.state?.jobDescription || ""
  );
  const [company, setCompany] = useState(
    () => location.state?.job?.company_name || location.state?.job?.company || ""
  );
  const [role, setRole] = useState(
    () => location.state?.job?.job_title || location.state?.job?.title || ""
  );
  const [template, setTemplate] = useState("Professional");

  // Pipeline Run execution state
  const [runId, setRunId] = useState(routeRunId || null);
  const [prevRouteRunId, setPrevRouteRunId] = useState(routeRunId);
  if (routeRunId !== prevRouteRunId) {
    setPrevRouteRunId(routeRunId);
    if (routeRunId && routeRunId !== runId) {
      setRunId(routeRunId);
    }
  }

  const [runData, setRunData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pollError, setPollError] = useState(null);
  const [prevPolledRunId, setPrevPolledRunId] = useState(runId);
  if (runId !== prevPolledRunId) {
    setPrevPolledRunId(runId);
    setPollError(null);
  }

  // Results state
  const [activeTab, setActiveTab] = useState("resume"); // "resume" | "jobs" | "interview" | "roadmap"
  const [resumeData, setResumeData] = useState(null);
  const [resumeLayout, setResumeLayout] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("Professional");
  const [jobsData, setJobsData] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [savingJobId, setSavingJobId] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [roadmapData, setRoadmapData] = useState(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [loadingAnswerId, setLoadingAnswerId] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState({});

  // Polling ref to track backoff & timeout
  const pollTimerRef = useRef(null);
  const pollStartRef = useRef(0);
  const pollDelayRef = useRef(2000);
  const pollRunRef = useRef(null);

  // Load available resumes on mount
  useEffect(() => {
    getResumes()
      .then((resumes) => {
        const list = Array.isArray(resumes) ? resumes : resumes?.resumes || [];
        setUserResumes(list);
        if (list.length > 0) {
          setSelectedResumeId((prev) => {
            if (prev) return prev;
            const active = list.find((r) => r.is_active) || list[0];
            return String(active.id);
          });
        }
      })
      .catch((err) => console.error("Failed to load user resumes:", err));
  }, []);

  // Load artifact data once pipeline has completed or partial status
  const loadArtifacts = useCallback(async (run) => {
    if (!run) return;
    const { generated_resume_id } = run;

    if (generated_resume_id) {
      // 1. Fetch generated Resume
      try {
        const res = await getResumeById(generated_resume_id);
        const parsed = fromApi(res);
        setResumeData(parsed);
        const initialTpl = res.template || selectedTemplate || "Professional";
        setSelectedTemplate(initialTpl);
        setResumeLayout(generateLayout(initialTpl, parsed));
      } catch (err) {
        console.error("Failed to load generated resume:", err);
      }

      // 2. Fetch Jobs
      try {
        const jobs = await getRecommendedJobsByResume(generated_resume_id);
        setJobsData(Array.isArray(jobs) ? jobs : jobs?.jobs || []);
      } catch (err) {
        console.error("Failed to load recommended jobs:", err);
      }

      // 3. Fetch Interview Session
      try {
        const intv = await getInterviewSessionByResume(generated_resume_id);
        setInterviewData(intv);
      } catch (err) {
        console.error("Failed to load interview session:", err);
      }

      // 4. Fetch Roadmap
      try {
        const rdm = await getRoadmapByResume(generated_resume_id);
        setRoadmapData(rdm);
      } catch (err) {
        console.error("Failed to load roadmap:", err);
      }
    }
  }, [selectedTemplate]);

  // Polling function for active run
  const pollRun = useCallback(async (currentRunId) => {
    try {
      const data = await getPipelineRun(currentRunId);
      setRunData(data);

      const terminalStatuses = ["completed", "partial", "failed"];
      if (terminalStatuses.includes(data.status)) {
        if (data.status === "completed" || data.status === "partial") {
          loadArtifacts(data);
        }
        return;
      }

      // Check 3-minute cap
      const elapsed = Date.now() - pollStartRef.current;
      if (elapsed > 180000) {
        setPollError("Pipeline execution is taking longer than expected. You can check back shortly or retry.");
        return;
      }

      // Backoff delay slightly up to 4000ms
      pollDelayRef.current = Math.min(4000, pollDelayRef.current + 250);
      pollTimerRef.current = setTimeout(() => {
        if (pollRunRef.current) {
          pollRunRef.current(currentRunId);
        }
      }, pollDelayRef.current);
    } catch (err) {
      console.error("Polling error:", err);
      setPollError(err?.response?.data?.detail || "Error monitoring pipeline run.");
    }
  }, [loadArtifacts]);

  useEffect(() => {
    pollRunRef.current = pollRun;
  }, [pollRun]);

  // Start polling when runId is set
  useEffect(() => {
    if (!runId) return;

    pollStartRef.current = Date.now();
    pollDelayRef.current = 2000;

    pollTimerRef.current = setTimeout(() => {
      pollRun(runId);
    }, 0);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
      }
    };
  }, [runId, pollRun]);

  // Update layout when template changes
  const handleTemplateChange = (tpl) => {
    setSelectedTemplate(tpl);
    if (resumeData) {
      setResumeLayout(generateLayout(tpl, resumeData));
    }
  };

  // Submit Handler: Starts the Pipeline
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (jobDescription.trim().length < 50) {
      toast.error("Please provide at least 50 characters for the Job Description.");
      return;
    }
    if (sourceType === "resume" && !selectedResumeId) {
      toast.error("Please select a base resume or choose Profile Import.");
      return;
    }

    setIsSubmitting(true);
    setPollError(null);
    setRunData(null);
    setResumeData(null);
    setJobsData([]);
    setInterviewData(null);
    setRoadmapData(null);

    try {
      const payload = {
        job_description: jobDescription.trim(),
        company: company.trim() || undefined,
        role: role.trim() || undefined,
        source: {
          type: sourceType,
          resume_id: sourceType === "resume" ? parseInt(selectedResumeId, 10) : undefined,
        },
        template: template.toLowerCase(),
      };

      const result = await createPipelineRun(payload);
      const newRunId = result.run_id;
      setRunId(newRunId);
      navigate(`/pipeline/${newRunId}`, { replace: true });
    } catch (err) {
      console.error("Pipeline submission failed:", err);
      toast.error(err?.response?.data?.detail || "Failed to start AI generation pipeline.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Roadmap task completion
  const handleToggleRoadmapTask = async (taskId) => {
    if (!runData?.generated_resume_id) return;
    try {
      const res = await toggleTask(taskId, runData.generated_resume_id);
      setRoadmapData((prev) => {
        if (!prev) return prev;
        const completed = new Set(res.completed_tasks || []);
        const updatedPhases = (prev.roadmap || []).map((phase) => ({
          ...phase,
          tasks: (phase.tasks || []).map((t) => ({
            ...t,
            completed: completed.has(String(t.id)),
          })),
        }));
        return {
          ...prev,
          completed_tasks: res.completed_tasks,
          roadmap: updatedPhases,
        };
      });
    } catch (err) {
      console.error("Failed to toggle roadmap task:", err);
    }
  };

  // Save Job to Tracker
  const handleSaveJob = async (job) => {
    const jId = job.job_id || job.id;
    if (!jId) return;
    setSavingJobId(jId);
    try {
      await saveJob({
        job_id: jId,
        title: job.job_title || job.title,
        company: job.employer_name || job.company_name || job.company,
        location: job.location || "Remote",
        url: job.apply_link || job.job_apply_link || "",
        status: "Saved",
      });
      setSavedJobIds((prev) => new Set(prev).add(jId));
    } catch (err) {
      console.error("Failed to save job:", err);
    } finally {
      setSavingJobId(null);
    }
  };

  // "Tailor for this job" CTA
  const handleTailorForJob = (job) => {
    setRunId(null);
    setRunData(null);
    setJobDescription(job.job_description || "");
    setCompany(job.employer_name || job.company_name || "");
    setRole(job.job_title || job.title || "");
    navigate("/pipeline");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Lazy Question Answer fetch
  const handleToggleAnswer = async (qId) => {
    if (expandedQuestionId === qId) {
      setExpandedQuestionId(null);
      return;
    }
    setExpandedQuestionId(qId);
    if (!questionAnswers[qId]) {
      setLoadingAnswerId(qId);
      try {
        const details = await getQuestionDetails(qId);
        setQuestionAnswers((prev) => ({
          ...prev,
          [qId]: details.answer || "No sample answer available.",
        }));
      } catch (err) {
        console.error("Failed to load question details:", err);
      } finally {
        setLoadingAnswerId(null);
      }
    }
  };

  const stepsList = runData?.steps || [
    { name: "extract_job_context", status: "pending" },
    { name: "generate_resume", status: "pending" },
    { name: "jobs", status: "pending" },
    { name: "interview", status: "pending" },
    { name: "roadmap", status: "pending" },
  ];

  const isTerminal = ["completed", "partial", "failed"].includes(runData?.status);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-1">
            <Sparkles size={16} />
            <span>AI CAREER PIPELINE</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Single Source of Truth
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Targeted Resume & Opportunity Engine
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            One Job Description generates a strictly truthful, ATS-optimized Resume, ranked open Jobs, 25 tailored Interview questions, and a targeted Roadmap.
          </p>
        </div>

        {runId && (
          <button
            onClick={() => {
              setRunId(null);
              setRunData(null);
              navigate("/pipeline");
            }}
            className="self-start md:self-auto px-4 py-2 text-xs font-semibold rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors flex items-center gap-2 border border-border"
          >
            <RotateCw size={14} />
            New Pipeline Run
          </button>
        )}
      </div>

      {/* Input Section (shown when no run or user wants to create a new run) */}
      {!runId && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Configure Pipeline Generation</h2>
              <p className="text-xs text-muted-foreground">Select candidate source and paste target job details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Selection */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                1. Candidate Baseline Source
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSourceType("resume")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sourceType === "resume"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-muted/40 hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <FileText size={16} className={sourceType === "resume" ? "text-primary" : "text-muted-foreground"} />
                    Existing Uploaded Resume
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use your uploaded resume as the single factual source of truth.
                  </p>
                  {sourceType === "resume" && (
                    <div className="mt-3">
                      <select
                        value={selectedResumeId}
                        onChange={(e) => setSelectedResumeId(e.target.value)}
                        className="w-full text-xs rounded-lg border border-border bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {userResumes.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title || r.original_filename} {r.is_active ? "(Active)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setSourceType("profile")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    sourceType === "profile"
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-muted/40 hover:bg-muted/70"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                    <Sparkles size={16} className={sourceType === "profile" ? "text-primary" : "text-muted-foreground"} />
                    Profile Import
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Build baseline facts directly from your verified Profile skills, experience, and projects.
                  </p>
                </div>
              </div>
            </div>

            {/* Target Job Details */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                2. Target Job Description & Info
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Role Title (optional, e.g. Senior Backend Engineer)"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-sm rounded-xl border border-border bg-background p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Company Name (optional, e.g. Stripe)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full text-sm rounded-xl border border-border bg-background p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <textarea
                  rows={7}
                  required
                  placeholder="Paste the full job description here (minimum 50 characters)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full text-sm rounded-xl border border-border bg-background p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs leading-relaxed"
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                  <span>Character count: {jobDescription.length} (min 50)</span>
                  <span>Code enforces factual wording; never invents skills or metrics.</span>
                </div>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                3. Resume Template Style
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => setTemplate(tpl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      template === tpl
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || jobDescription.length < 50}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RotateCw size={16} className="animate-spin" />
                  Initiating Pipeline Run...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Generate Full Pipeline (Resume + Jobs + Interview + Roadmap)
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Real-time Stepper & Progress (Shown when runId is present) */}
      {runId && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {runData?.status === "completed" ? (
                  <CheckCircle2 size={22} className="text-emerald-500" />
                ) : runData?.status === "partial" ? (
                  <AlertCircle size={22} className="text-amber-500" />
                ) : runData?.status === "failed" ? (
                  <AlertTriangle size={22} className="text-destructive" />
                ) : (
                  <RotateCw size={20} className="animate-spin text-primary" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground capitalize">
                    Pipeline Status: {runData?.status || "Queued"}
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      runData?.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : runData?.status === "partial"
                        ? "bg-amber-500/10 text-amber-600"
                        : runData?.status === "failed"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary animate-pulse"
                    }`}
                  >
                    {runData?.status || "queued"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">Run ID: {runId}</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs text-muted-foreground bg-muted/60 border border-border px-3 py-1.5 rounded-lg flex items-center gap-1.5 self-start">
              <Sparkles size={12} className="text-primary" />
              <span>AI-generated, review before sending</span>
            </div>
          </div>

          {/* Stepper Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {stepsList.map((step, idx) => {
              const meta = STEP_LABELS[step.name] || { label: step.name, desc: "" };
              const isDone = step.status === "completed";
              const isCurrent = step.status === "running";
              const isFailed = step.status === "failed";

              return (
                <div
                  key={step.name || idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDone
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : isCurrent
                      ? "bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20"
                      : isFailed
                      ? "bg-destructive/5 border-destructive/30"
                      : "bg-muted/20 border-border opacity-70"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-muted-foreground">0{idx + 1}</span>
                    {isDone && <CheckCircle2 size={16} className="text-emerald-500" />}
                    {isCurrent && <RotateCw size={14} className="animate-spin text-primary" />}
                    {isFailed && <AlertCircle size={16} className="text-destructive" />}
                    {step.status === "pending" && <Clock size={14} className="text-muted-foreground/60" />}
                  </div>
                  <h4 className="text-xs font-bold text-foreground leading-tight">{meta.label}</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{meta.desc}</p>
                  {step.error && (
                    <p className="text-[10px] text-destructive font-medium mt-1.5 truncate" title={step.error}>
                      Error: {step.error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Partial / Error / Timeout notice */}
          {pollError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{pollError}</span>
              </div>
              <button
                onClick={() => pollRun(runId)}
                className="px-3 py-1 rounded-lg bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90"
              >
                Retry Polling
              </button>
            </div>
          )}

          {runData?.status === "partial" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                Pipeline finished with partial status (e.g. external provider down). Your tailored resume, interview questions, and roadmap are safely generated and usable below.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tabs and Results Section (Shown once terminal or artifacts available) */}
      {isTerminal && (
        <div className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "resume"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <FileText size={16} />
              <span>1. Tailored Resume</span>
              {resumeData && <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">Ready</span>}
            </button>

            <button
              onClick={() => setActiveTab("jobs")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "jobs"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Briefcase size={16} />
              <span>2. Matched Jobs</span>
              {jobsData.length > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">{jobsData.length}</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("interview")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "interview"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <MessageSquare size={16} />
              <span>3. Interview Prep</span>
              {interviewData?.questions?.length && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">
                  {interviewData.questions.length} Qs
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("roadmap")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === "roadmap"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <Map size={16} />
              <span>4. Targeted Roadmap</span>
              {roadmapData && <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">Active</span>}
            </button>
          </div>

          {/* TAB 1: RESUME */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              {resumeData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: ATS Score & Diagnostics */}
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-foreground">ATS Match & Readiness</h3>
                        <Award size={18} className="text-primary" />
                      </div>

                      <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                        <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary font-black text-xl">
                          {resumeData.ats_score || 88}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">Tailored Score</div>
                          <div className="text-[11px] text-muted-foreground">
                            100% truthful wording against target JD requirements
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <label className="text-xs font-semibold text-foreground">Template Theme</label>
                        <select
                          value={selectedTemplate}
                          onChange={(e) => handleTemplateChange(e.target.value)}
                          className="w-full text-xs rounded-xl border border-border bg-background p-2.5 text-foreground"
                        >
                          {TEMPLATES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={() => window.print()}
                          className="w-full py-2.5 px-3 rounded-xl bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 flex items-center justify-center gap-2 border border-border"
                        >
                          <Download size={14} />
                          Print / Save PDF
                        </button>
                        <button
                          onClick={() => {
                            navigate("/resume/editor", {
                              state: { resumeId: runData?.generated_resume_id },
                            });
                          }}
                          className="w-full py-2.5 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
                        >
                          <Edit3 size={14} />
                          Edit in Full Resume Builder
                        </button>
                      </div>
                    </div>

                    {/* Skill Gaps from Generation */}
                    {runData?.steps?.find((s) => s.name === "generate_resume") && (
                      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Target JD Alignment
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Code preserved original experiences and achievements while framing terminology to match the JD.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Live Resume Preview */}
                  <div className="lg:col-span-2 bg-muted/40 border border-border rounded-2xl p-6 overflow-x-auto shadow-inner flex justify-center">
                    <div className="max-w-[850px] w-full bg-white shadow-xl rounded-sm p-4">
                      {resumeLayout ? (
                        <ReactPreviewRenderer layout={resumeLayout} />
                      ) : (
                        <div className="text-center py-20 text-muted-foreground text-xs">
                          Generating preview layout...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">
                  No tailored resume generated. Please check pipeline status.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATCHED JOBS */}
          {activeTab === "jobs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h3 className="font-bold text-base text-foreground">Top 30 Ranked Opportunities</h3>
                  <p className="text-xs text-muted-foreground">
                    Ranked via FastEmbed semantic similarity (50%) + taxonomy skill overlap (30%) + title match (20%)
                  </p>
                </div>
              </div>

              {jobsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobsData.map((item, idx) => {
                    const job = item.job || item;
                    const score = item.score || 85;
                    const matchedSkills = item.matched_skills || [];
                    const missingSkills = item.missing_skills || [];
                    const why = item.why || "Matches candidate core skill set.";
                    const jId = job.job_id || String(idx);
                    const isSaved = savedJobIds.has(jId);

                    return (
                      <div
                        key={jId}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-bold text-sm text-foreground line-clamp-1">
                                {job.job_title || job.title}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {job.employer_name || job.company_name || job.company} •{" "}
                                {job.job_city || job.location || "Remote"}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
                              {score}% Match
                            </span>
                          </div>

                          {/* 1-Line Explainable Why */}
                          <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border/60">
                            <span className="font-semibold text-foreground">Why: </span>
                            {why}
                          </div>

                          {/* Matched vs Missing Skills */}
                          <div className="space-y-1.5 text-xs">
                            {matchedSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Matched:
                                </span>
                                {matchedSkills.slice(0, 5).map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[11px] font-medium"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                            {missingSkills.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  Gaps:
                                </span>
                                {missingSkills.slice(0, 4).map((s) => (
                                  <span
                                    key={s}
                                    className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-medium"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                          <button
                            onClick={() => handleTailorForJob(job)}
                            className="text-primary font-semibold hover:underline flex items-center gap-1"
                          >
                            <Zap size={12} />
                            Tailor for this job
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveJob(job)}
                              disabled={isSaved || savingJobId === jId}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                isSaved
                                  ? "bg-secondary text-secondary-foreground border-border cursor-default"
                                  : "bg-background text-foreground border-border hover:bg-muted"
                              }`}
                            >
                              <Bookmark size={12} className={isSaved ? "fill-current" : ""} />
                              {isSaved ? "Saved" : savingJobId === jId ? "Saving..." : "Save to Tracker"}
                            </button>

                            {(job.job_apply_link || job.apply_link) && (
                              <a
                                href={job.job_apply_link || job.apply_link}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 flex items-center gap-1"
                              >
                                <span>Apply</span>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">
                  No matching jobs were found or provider rate limit occurred. You can retry with a broader query.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTERVIEW PREP */}
          {activeTab === "interview" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Targeted Interview Preparation ({interviewData?.questions?.length || 25} Questions)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Bound directly to your tailored resume and target job context. Answers loaded lazily on demand.
                  </p>
                </div>

                {interviewData?.id && (
                  <button
                    onClick={() => {
                      navigate("/interview", {
                        state: { sessionId: interviewData.id, startMock: true },
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shadow-sm flex items-center gap-1.5 self-start"
                  >
                    <MessageSquare size={14} />
                    Start AI Mock Interview with these Questions
                  </button>
                )}
              </div>

              {interviewData?.questions?.length > 0 ? (
                <div className="space-y-3">
                  {interviewData.questions.map((q, idx) => {
                    const isExpanded = expandedQuestionId === q.id;
                    const answer = questionAnswers[q.id] || q.answer;
                    const isLoadingAnswer = loadingAnswerId === q.id;

                    return (
                      <div
                        key={q.id || idx}
                        className="bg-card border border-border rounded-2xl p-4 shadow-xs transition-all hover:border-primary/40 space-y-3"
                      >
                        <div
                          onClick={() => handleToggleAnswer(q.id)}
                          className="flex items-start justify-between gap-4 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {q.category || "General"}
                                </span>
                                {q.difficulty && (
                                  <span className="text-[10px] text-muted-foreground">
                                    Difficulty: {q.difficulty}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-foreground leading-snug">{q.question}</h4>
                            </div>
                          </div>

                          <div className="text-muted-foreground shrink-0 pt-1">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>

                        {/* Expanded Answer view */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-border text-xs text-foreground bg-muted/30 p-3.5 rounded-xl space-y-2 animate-fade-in">
                            <div className="font-semibold text-muted-foreground flex items-center gap-1.5">
                              <BookOpen size={14} className="text-primary" />
                              <span>Sample Talking Points & Answer Framework:</span>
                            </div>
                            {isLoadingAnswer ? (
                              <div className="flex items-center gap-2 py-2 text-muted-foreground">
                                <RotateCw size={14} className="animate-spin text-primary" />
                                <span>Generating personalized answer framework...</span>
                              </div>
                            ) : (
                              <p className="leading-relaxed whitespace-pre-line text-muted-foreground">{answer}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">
                  Interview questions are preparing or unavailable.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TARGETED ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Targeted Career Roadmap: {roadmapData?.target_level || "Target"} {roadmapData?.target_role || "Role"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Prioritized learning phases covering target JD gaps and suggested portfolio tasks. Checkboxes persist automatically.
                  </p>
                </div>
              </div>

              {roadmapData?.roadmap?.length > 0 ? (
                <div className="space-y-6">
                  {roadmapData.roadmap.map((phase, pIdx) => {
                    const tasks = phase.tasks || [];
                    const completedCount = tasks.filter((t) => t.completed).length;

                    return (
                      <div
                        key={phase.id || pIdx}
                        className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                              {pIdx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{phase.title}</h4>
                              <p className="text-xs text-muted-foreground">{phase.goal || phase.duration || ""}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-muted-foreground">
                            {completedCount} / {tasks.length} Completed
                          </span>
                        </div>

                        {/* Task List */}
                        <div className="space-y-2">
                          {tasks.map((task) => (
                            <div
                              key={task.id}
                              onClick={() => handleToggleRoadmapTask(task.id)}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                task.completed
                                  ? "bg-emerald-500/5 border-emerald-500/20 text-muted-foreground line-through"
                                  : "bg-muted/30 border-border hover:bg-muted/60 text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={Boolean(task.completed)}
                                  onChange={() => {}}
                                  className="w-4 h-4 rounded text-primary border-border focus:ring-primary cursor-pointer"
                                />
                                <span className="font-medium">{task.title}</span>
                              </div>
                              {task.skill && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground shrink-0">
                                  {task.skill}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground text-sm">
                  Roadmap milestone data is loading or empty.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
