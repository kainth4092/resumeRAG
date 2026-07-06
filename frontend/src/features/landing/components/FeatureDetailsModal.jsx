import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  Terminal,
} from "lucide-react";
import ScoreRing from "./ScoreRing";

export default function FeatureDetailsModal({
  isOpen,
  onClose,
  featureType,
  onTriggerAuth,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  // Escape key close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Custom data based on features
  const featureContent = {
    "resume-builder": {
      title: "AI Resume Builder",
      tagline: "Generate ATS-optimized resumes in minutes",
      description:
        "A professional drag-and-drop editor that crafts high-impact bullet points and instantly updates layouts to fit industry standards.",
      benefits: [
        "100% ATS-friendly single/double column layouts",
        "AI suggestions using action verbs and quantifiable metrics",
        "PDF, DOCX, and JSON exports instantly",
      ],
      howItWorks: [
        "Select a template optimized for your industry/experience.",
        "Use the editor to add your profile details or import from LinkedIn.",
        "Refine your bullet points with the AI optimizer tool.",
      ],
      ctaText: "Start Building Resume",
      previewComponent: () => {
        const [template, setTemplate] = useState("Modern");
        return (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex gap-2 justify-between items-center border-b border-slate-200 dark:border-slate-850 pb-2">
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                Template Style
              </span>
              <div className="flex gap-1.5">
                {["Modern", "Classic", "Minimalist"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`text-[8px] px-2 py-0.8 rounded-md font-semibold border ${
                      template === t
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Resume Sheet Preview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 rounded-xl text-[7px] text-slate-700 dark:text-slate-350 space-y-2">
              <div className="text-center space-y-0.5">
                <p className="text-[10px] font-extrabold text-slate-900 dark:text-white">
                  JORDAN DUPONT
                </p>
                <p className="text-[7px] text-slate-400 dark:text-slate-500">
                  San Francisco, CA • jordan.d@example.com •
                  linkedin.com/in/jordan
                </p>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-1.5 space-y-1">
                <p className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-0.5">
                  EXPERIENCE
                </p>
                <div>
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>Senior Frontend Engineer — Stripe</span>
                    <span>2024 - Present</span>
                  </div>
                  <ul className="list-disc pl-3 mt-0.5 space-y-0.5">
                    <li>
                      Led migration of billing dashboard to React 19, increasing
                      page load velocity by 34%.
                    </li>
                    <li>
                      Developed responsive component library used by 12+ product
                      teams, saving 40+ engineering hours weekly.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    "ats-analysis": {
      title: "Resume ATS Match Engine",
      tagline: "Uncover missing keywords and layout issues instantly",
      description:
        "Compare your resume against any target job description. The engine simulates parser behavior to flag keyword gaps, bad layouts, and formatting hurdles.",
      benefits: [
        "Identifies hard skills & soft skills gaps",
        "Calculates matching density percentage",
        "Flags tables, textboxes, and invalid font configurations",
      ],
      howItWorks: [
        "Upload your resume file or choose one from your library.",
        "Paste the target job description in the analyzer box.",
        "Review the suggestion report to reach a 90%+ pass rate.",
      ],
      ctaText: "Analyze Resume Now",
      previewComponent: () => {
        const [showReport, setShowReport] = useState(false);
        return (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            {!showReport ? (
              <div className="space-y-3">
                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  Target Job Description
                </p>
                <textarea
                  readOnly
                  value="Looking for a Senior Frontend Engineer with 5+ years of experience in React, TypeScript, and state management frameworks. Experience optimizing performance and building accessible interfaces is required."
                  className="w-full text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 resize-none h-16 outline-none text-slate-655"
                />
                <button
                  onClick={() => setShowReport(true)}
                  className="w-full bg-slate-900 dark:bg-indigo-650 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-[9px] transition-all cursor-pointer"
                >
                  Analyze & Compare Resume
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-extrabold text-slate-800 dark:text-white">
                      ATS Score
                    </p>
                    <p className="text-[8px] text-teal-600 dark:text-teal-400 font-bold">
                      ✓ High Match Potential
                    </p>
                  </div>
                  <ScoreRing value={94} color="#14B8A6" size={40} />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-455">
                    Found Issues
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[8px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded-lg">
                      <AlertCircle size={10} /> Missing Key phrase: "accessible
                      interfaces"
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] text-rose-600 dark:text-rose-455 font-semibold bg-rose-50 dark:bg-rose-950/30 p-1.5 rounded-lg">
                      <AlertCircle size={10} /> Suggested verb update: Change
                      "responsible for coding" to "designed and executed"
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowReport(false)}
                  className="text-[8px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  ← Edit Job Description
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    "interview-prep": {
      title: "AI Interview Simulator",
      tagline: "Practice specific questions with instantaneous AI evaluation",
      description:
        "Build robust answers to difficult coding and behavioral prompts. Our AI acts as the interviewer, evaluating response structures and rating delivery details.",
      benefits: [
        "Tailored to companies like Google, Netflix, and Stripe",
        "Feedback aligned with STAR response methodology",
        "Hints, code tips, and follow-ups available in real time",
      ],
      howItWorks: [
        "Pick a target company, role, or specific question category.",
        "Read or listen to the AI-generated prompt.",
        "Provide your answer and click 'Evaluate' to receive structured recommendations.",
      ],
      ctaText: "Start Prep Session",
      previewComponent: () => {
        const [feedback, setFeedback] = useState(false);
        return (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl">
              <span className="text-[7px] font-bold text-indigo-600 uppercase block mb-1">
                Question
              </span>
              <p className="text-[9px] font-bold text-slate-850 dark:text-white leading-relaxed">
                "How do you optimize render cycles in a complex React list
                component?"
              </p>
            </div>
            {!feedback ? (
              <div className="space-y-2">
                <textarea
                  readOnly
                  value="I would use React.memo to prevent unnecessary updates, and implement useMemo or useCallback for callbacks and objects passed down as props."
                  className="w-full text-[9px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 resize-none h-16 outline-none text-slate-655"
                />
                <button
                  onClick={() => setFeedback(true)}
                  className="w-full bg-slate-900 dark:bg-indigo-650 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-[9px] transition-all cursor-pointer"
                >
                  Evaluate Answer
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2.5 rounded-lg space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles
                        size={10}
                        className="fill-emerald-600 text-emerald-600"
                      />{" "}
                      AI Score: 85/100
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-655 dark:text-slate-350 leading-relaxed">
                    Great start! You correctly mentioned{" "}
                    <strong>React.memo</strong> and hook optimization. To get to
                    95+, mention the <strong>useDeferredValue</strong> hook or
                    list virtualization (like <strong>react-window</strong>) for
                    lists with over 500 entries.
                  </p>
                </div>
                <button
                  onClick={() => setFeedback(false)}
                  className="text-[8px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  ← Try Another Answer
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    "job-discovery": {
      title: "AI Job Match Discovery",
      tagline: "Find opportunities tailored to your capabilities",
      description:
        "Our discovery parser scans your credentials and ranks open developer roles. Explore matching scores, salary listings, and key stack specifications before applying.",
      benefits: [
        "Automatic compatibility rank based on profile experience",
        "Identifies missing stack tools prior to job applications",
        "Direct synchronization into the tracker",
      ],
      howItWorks: [
        "Upload your latest resume to establish target credentials.",
        "Browse matched postings curated from global career portals.",
        "Save and monitor applications dynamically in your personal pipeline.",
      ],
      ctaText: "Discover Live Jobs",
      previewComponent: () => {
        const [saved, setSaved] = useState({});
        const jobs = [
          {
            company: "Stripe",
            role: "Senior Frontend Engineer",
            salary: "$160k - $210k",
            match: 96,
            stack: ["React", "TypeScript", "Tailwind"],
          },
          {
            company: "Linear",
            role: "Product Developer",
            salary: "$140k - $185k",
            match: 91,
            stack: ["Next.js", "GraphQL", "TypeScript"],
          },
        ];
        return (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            {jobs.map((j) => (
              <div
                key={j.company}
                className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl p-3 flex justify-between items-start"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold text-slate-800 dark:text-white">
                      {j.role}
                    </span>
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 font-medium">
                      at {j.company}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {j.stack.map((s) => (
                      <span
                        key={s}
                        className="text-[7px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-[7px] font-semibold text-slate-455">
                    {j.salary}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[8px] font-black text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-1.5 py-0.5 rounded">
                    {j.match}% MATCH
                  </span>
                  <button
                    onClick={() =>
                      setSaved((prev) => ({
                        ...prev,
                        [j.company]: !prev[j.company],
                      }))
                    }
                    className={`text-[8px] font-bold px-2 py-0.8 rounded-md border transition-all cursor-pointer ${
                      saved[j.company]
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950"
                        : "bg-transparent border-slate-250 text-slate-600 hover:border-slate-400 dark:text-slate-400"
                    }`}
                  >
                    {saved[j.company] ? "Saved ✓" : "Save Job"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    "application-tracker": {
      title: "Interactive Application Pipeline",
      tagline: "Track everything in a visual Kanban board",
      description:
        "Throw away scattered spreadsheets. Track recruiter updates, technical assessments, interviews, offer letters, and follow-up deadlines.",
      benefits: [
        "Dynamic column-based pipeline overview",
        "Automated calendar updates for pending interview loops",
        "Save critical notes, contacts, and custom requirements in each card",
      ],
      howItWorks: [
        "Sync details from matched jobs or add columns manually.",
        "Drag and drop cards as you progress through stages.",
        "Add follow-up notes, salary offers, and task checklists.",
      ],
      ctaText: "Open My Tracker",
      previewComponent: () => {
        const [positions, setPositions] = useState([
          { company: "Stripe", role: "Frontend Eng", stage: "Interview" },
          { company: "Vercel", role: "UX Architect", stage: "Applied" },
          { company: "Linear", role: "Software Developer", stage: "Interview" },
        ]);

        const moveStage = (company) => {
          setPositions((prev) =>
            prev.map((p) =>
              p.company === company
                ? {
                    ...p,
                    stage: p.stage === "Interview" ? "Offer" : "Interview",
                  }
                : p,
            ),
          );
        };

        return (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[8px]">
              <div>
                <p className="font-extrabold text-slate-455 mb-1.5 uppercase tracking-wider">
                  Interview (
                  {positions.filter((p) => p.stage === "Interview").length})
                </p>
                <div className="space-y-1.5">
                  {positions
                    .filter((p) => p.stage === "Interview")
                    .map((p) => (
                      <div
                        key={p.company}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-lg space-y-1"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">
                            {p.company}
                          </p>
                          <p className="text-[7px] text-slate-400">{p.role}</p>
                        </div>
                        <button
                          onClick={() => moveStage(p.company)}
                          className="w-full text-[6px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 py-0.8 rounded hover:underline cursor-pointer border-none"
                        >
                          Advance to Offer →
                        </button>
                      </div>
                    ))}
                </div>
              </div>
              <div>
                <p className="font-extrabold text-slate-455 mb-1.5 uppercase tracking-wider">
                  Offer ({positions.filter((p) => p.stage === "Offer").length})
                </p>
                <div className="space-y-1.5">
                  {positions
                    .filter((p) => p.stage === "Offer")
                    .map((p) => (
                      <div
                        key={p.company}
                        className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-2 rounded-lg"
                      >
                        <p className="font-bold text-emerald-800 dark:text-emerald-400">
                          {p.company}
                        </p>
                        <p className="text-[7px] text-emerald-600 dark:text-emerald-500">
                          {p.role}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    "ai-assistant": {
      title: "AI Career Assistant",
      tagline: "Receive custom recommendations to build career momentum",
      description:
        "Chat with your 24/7 assistant to outline compensation arguments, rewrite bullet points, and check code details.",
      benefits: [
        "Rewrite suggestions matching target descriptions",
        "Compensation suggestions matching recent salary surveys",
        "Direct access inside the workspace",
      ],
      howItWorks: [
        "Ask details or upload your recent resume draft.",
        "Select recommendations and modify metrics instantly.",
        "Export final suggestions directly to your live builders.",
      ],
      ctaText: "Start AI Chat",
      previewComponent: () => {
        const prompts = [
          "Suggest dynamic action verbs",
          "Draft compensation email",
          "Identify React 19 keywords",
        ];
        const [response, setResponse] = useState("");

        const handlePrompt = (p) => {
          if (p.includes("verbs")) {
            setResponse(
              "Try words like 'architected', 'spearheaded', 'automated', and 'streamlined' to emphasize impact.",
            );
          } else if (p.includes("compensation")) {
            setResponse(
              "Subject: Salary Proposal - [Name]\n\nDear [Name],\nThank you for the offer. Based on recent market statistics for tech stacks in this area, I propose a base salary of...",
            );
          } else {
            setResponse(
              "Optimizing keywords: Include React Server Components, Suspense APIs, Concurrent features, and Server Actions.",
            );
          }
        };

        return (
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePrompt(p)}
                  className="text-[8px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-1 rounded-lg hover:border-indigo-400 transition-all cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl min-h-16 text-[8px] leading-relaxed text-slate-655 dark:text-slate-350">
              {response ||
                "Click one of the suggested prompts above to see realistic AI responses."}
            </div>
          </div>
        );
      },
    },
  };

  const current = featureContent[featureType];
  if (!current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-850 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                {current.title}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                {current.tagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-850 gap-4 text-xs font-bold pb-2 shrink-0">
            {["overview", "how-it-works", "preview"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-1 capitalize transition-colors cursor-pointer border-b-2 -mb-2 ${
                  activeTab === tab
                    ? "border-indigo-600 text-slate-900 dark:text-white"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Dynamic Content */}
          <div className="space-y-4">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                    {current.description}
                  </p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                      Key Benefits
                    </p>
                    <div className="space-y-2">
                      {current.benefits.map((b) => (
                        <div
                          key={b}
                          className="flex gap-2 text-xs text-slate-655 dark:text-slate-400"
                        >
                          <CheckCircle2
                            size={14}
                            className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5"
                          />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-extrabold text-slate-455 uppercase tracking-widest">
                    Quick Sample Output
                  </p>
                  <current.previewComponent />
                </div>
              </div>
            )}

            {activeTab === "how-it-works" && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
                  Our algorithm guides you at every stage, providing helpful
                  hints before you submit your materials to applications:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {current.howItWorks.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-55/40 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs select-none">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-350">
                  Interact with this simplified dashboard module below. Explore
                  how calculations are processed prior to setting up your
                  account.
                </p>
                <div className="bg-slate-950 text-slate-300 rounded-2xl p-4 font-mono text-[9px] border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2 text-[8px] text-slate-500 font-sans">
                    <Terminal size={10} /> Copilot Engine Diagnostics
                    (Interactive Mock API Console)
                  </div>
                  <p className="text-teal-400">
                    $ fetch resupilot-ai/api/v1/{featureType}/preview-data
                  </p>
                  <p className="text-slate-500">// Response Status: 200 OK</p>
                  <p className="text-indigo-400">
                    {JSON.stringify(current.benefits, null, 2)}
                  </p>
                </div>
                <current.previewComponent />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onClose();
              onTriggerAuth(
                current.title,
                `To use the ${current.title} with your own career data, create a free account.`,
              );
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {current.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
