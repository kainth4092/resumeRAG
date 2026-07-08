import { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  BarChart3,
  Briefcase,
  Wrench,
  CheckSquare,
  FileText,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Square,
} from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-extrabold text-foreground">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

function formatBotMessage(text) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-xs text-left">
      {lines.map((line, idx) => {
        let content = line;

        // Custom tags parser
        if (content.startsWith("[trend] ")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <TrendingUp size={13} className="text-emerald-500 shrink-0" />
              <span>{renderBold(content.replace("[trend] ", ""))}</span>
            </div>
          );
        }
        if (content.startsWith("[doc] ")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <FileText size={13} className="text-indigo-500 shrink-0" />
              <span>{renderBold(content.replace("[doc] ", ""))}</span>
            </div>
          );
        }
        if (content.startsWith("[warning] ")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <AlertTriangle size={13} className="text-amber-500 shrink-0" />
              <span>{renderBold(content.replace("[warning] ", ""))}</span>
            </div>
          );
        }
        if (content.startsWith("[tip] ")) {
          return (
            <div
              key={idx}
              className="flex items-start gap-1.5 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              <Lightbulb
                size={13}
                className="text-yellow-500 shrink-0 mt-0.5"
              />
              <span>{renderBold(content.replace("[tip] ", ""))}</span>
            </div>
          );
        }
        if (content.startsWith("[briefcase] ")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <Briefcase size={13} className="text-blue-500 shrink-0" />
              <span>{renderBold(content.replace("[briefcase] ", ""))}</span>
            </div>
          );
        }
        if (content.startsWith("[wrench] ")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <Wrench size={13} className="text-amber-500 shrink-0" />
              <span>{renderBold(content.replace("[wrench] ", ""))}</span>
            </div>
          );
        }
        if (content.startsWith("[checklist] ")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <CheckSquare size={13} className="text-indigo-500 shrink-0" />
              <span>{renderBold(content.replace("[checklist] ", ""))}</span>
            </div>
          );
        }

        // Checklist items: - [x] or - [ ]
        if (content.startsWith("- [x] ") || content.startsWith("- [x]")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 pl-2 py-0.5 text-[11px] font-semibold text-foreground"
            >
              <CheckSquare size={13} className="text-emerald-500 shrink-0" />
              <span>{renderBold(content.replace(/- \[[xX]\]\s*/, ""))}</span>
            </div>
          );
        }
        if (content.startsWith("- [ ] ") || content.startsWith("- [ ]")) {
          return (
            <div
              key={idx}
              className="flex items-center gap-1.5 pl-2 py-0.5 text-[11px] font-medium text-muted-foreground"
            >
              <Square size={13} className="text-muted-foreground shrink-0" />
              <span>{renderBold(content.replace(/- \[\s*\]\s*/, ""))}</span>
            </div>
          );
        }

        // Bullet items: - or *
        if (content.startsWith("- ") || content.startsWith("* ")) {
          const itemText = content.replace(/^[-*]\s+/, "");
          return (
            <div
              key={idx}
              className="flex items-start gap-1.5 pl-3 py-0.5 text-[11px]"
            >
              <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>{renderBold(itemText)}</span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-[11px] leading-relaxed py-0.5">
            {renderBold(content)}
          </p>
        );
      })}
    </div>
  );
}

export default function FloatingAI() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi there! I'm your Live Career Copilot. I can pull real-time updates directly from this app. Try clicking one of the suggestions below to ask me about your stats!",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const getAppData = () => {
    if (!user?.email) return null;

    let dashboard = null;
    let profile = null;
    let skills = [];
    let experiences = [];
    let education = [];
    let projects = [];

    try {
      const dbCached = localStorage.getItem(`dashboard_data_${user.email}`);
      if (dbCached) dashboard = JSON.parse(dbCached);

      const profCached = localStorage.getItem(`profile_data_${user.email}`);
      if (profCached) profile = JSON.parse(profCached);

      const skillsCached = localStorage.getItem(`profile_skills_${user.email}`);
      if (skillsCached) skills = JSON.parse(skillsCached) || [];

      const expCached = localStorage.getItem(
        `profile_experience_${user.email}`,
      );
      if (expCached) experiences = JSON.parse(expCached) || [];

      const eduCached = localStorage.getItem(`profile_education_${user.email}`);
      if (eduCached) education = JSON.parse(eduCached) || [];

      const projCached = localStorage.getItem(`profile_projects_${user.email}`);
      if (projCached) projects = JSON.parse(projCached) || [];
    } catch (e) {
      console.error("Error reading cache in FloatingAI:", e);
    }

    return { dashboard, profile, skills, experiences, education, projects };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open]);

  const triggerQuery = (queryText) => {
    if (!queryText.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: queryText }]);
    setInput("");

    setTimeout(() => {
      let reply = "";
      const textLower = queryText.toLowerCase();
      const appData = getAppData();

      if (
        textLower.includes("ats") ||
        textLower.includes("score") ||
        textLower.includes("health") ||
        textLower.includes("resume")
      ) {
        if (!appData?.dashboard || !appData.dashboard.stats_summary) {
          reply =
            "I couldn't load your dashboard stats yet. Please upload or generate your resume to calculate your ATS scores!";
        } else {
          const stats = appData.dashboard.stats_summary;
          const resumes = appData.dashboard.resume_history || [];
          const activeResume = resumes.find((r) => r.is_active) || resumes[0];

          reply = `You have generated **${stats.resumes_count} resumes** in your workspace.\n\n[trend] **Average ATS Score:** **${stats.ats_score}/100** (${stats.ats_trend})\n`;
          if (activeResume) {
            reply += `[doc] **Latest Active Resume:** *${activeResume.title}* (Score: **${activeResume.ats_score}/100**)\n`;
          }

          const insights = appData.dashboard.resume_insights;
          if (
            insights &&
            insights.missing_skills &&
            insights.missing_skills.length > 0
          ) {
            reply += `\n[warning] **Key Missing Keywords:**\n- ${insights.missing_skills.slice(0, 3).join(", ")}`;
          }
        }
      } else if (
        textLower.includes("job") ||
        textLower.includes("track") ||
        textLower.includes("apply") ||
        textLower.includes("find")
      ) {
        if (!appData?.dashboard || appData.dashboard.total_tracked_jobs === 0) {
          reply =
            "You are not tracking any job applications yet! Go to the **Job Tracker** page to add roles you are targeting.";
        } else {
          const count = appData.dashboard.total_tracked_jobs;
          reply = `[briefcase] You are tracking **${count} job applications** in your pipeline.\n\n[tip] *Tip: Keep application deadlines updated in your Job Tracker dashboard!*`;
        }
      } else if (textLower.includes("skill")) {
        const skills = appData?.skills || [];
        const missing =
          appData?.dashboard?.resume_insights?.missing_skills || [];

        reply = `[wrench] **Your Profile Skills (${skills.length}):**\n`;
        if (skills.length > 0) {
          const skillNames = skills.map((s) => s.name || s).slice(0, 8);
          reply += `- ${skillNames.join(", ")}\n`;
        } else {
          reply += `- No profile skills added yet. Go to Profile to add them!\n`;
        }

        if (missing.length > 0) {
          reply += `\n[warning] **Key Missing ATS Keywords:**\n- ${missing.slice(0, 4).join(", ")}\n\n[tip] *Incorporate these keywords to improve your score.*`;
        }
      } else if (
        textLower.includes("task") ||
        textLower.includes("todo") ||
        textLower.includes("next")
      ) {
        let savedTasks = [];
        try {
          const saved = localStorage.getItem("resupilot_dashboard_tasks");
          if (saved) savedTasks = JSON.parse(saved);
        } catch (err) {
          console.error("Failed to parse tasks in FloatingAI:", err);
        }

        if (savedTasks.length === 0) {
          const hasResumes =
            (appData?.dashboard?.resume_history?.length || 0) > 0;
          const hasJobs = (appData?.dashboard?.total_tracked_jobs || 0) > 0;
          const hasInterviews = (appData?.dashboard?.total_interviews || 0) > 0;

          savedTasks = [
            {
              id: "res-0",
              text: hasResumes
                ? "Review ATS suggestions for active resume"
                : "Upload or generate your first AI Resume",
              done: hasResumes,
            },
            {
              id: "job-0",
              text: hasJobs
                ? "Track status updates in Job Tracker"
                : "Add a target role application to Job Tracker",
              done: hasJobs,
            },
            {
              id: "int-0",
              text: hasInterviews
                ? "Practice tailored questions"
                : "Complete a custom Mock Interview session",
              done: hasInterviews,
            },
          ];
        }

        reply = "[checklist] **Your Real-Time Tasks:**\n";
        savedTasks.forEach((t) => {
          reply += `${t.done ? "- [x]" : "- [ ]"} ${t.text}\n`;
        });
      } else if (
        textLower.includes("completeness") ||
        textLower.includes("overview") ||
        textLower.includes("experience") ||
        textLower.includes("project") ||
        textLower.includes("education")
      ) {
        const skillsCount = appData?.skills?.length || 0;
        const expCount = appData?.experiences?.length || 0;
        const eduCount = appData?.education?.length || 0;
        const projCount = appData?.projects?.length || 0;

        reply = `[doc] **Profile Database Status:**\n- **Experience:** ${expCount} entries\n- **Education:** ${eduCount} entries\n- **Projects:** ${projCount} projects\n- **Skills:** ${skillsCount} skills\n\n`;
        reply += `[checklist] **Completeness Checklist:**\n`;
        reply += `- [${skillsCount > 0 ? "x" : " "}] Skills (${skillsCount} added)\n`;
        reply += `- [${expCount > 0 ? "x" : " "}] Experience (${expCount} added)\n`;
        reply += `- [${eduCount > 0 ? "x" : " "}] Education (${eduCount} added)\n`;
        reply += `- [${projCount > 0 ? "x" : " "}] Projects (${projCount} added)`;
      } else if (textLower.includes("hello") || textLower.includes("hi")) {
        reply =
          "Hello! Ask me about your **ATS score**, **tracked jobs**, **skills**, **upcoming tasks**, or **profile overview** for live updates!";
      } else {
        reply =
          "I'm your workspace Career Copilot. Try asking me about 'how to improve my ATS score', 'how to track job applications', or 'suggest missing skills'.";
      }

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    triggerQuery(input.trim());
  };

  const quickQuestions = [
    {
      label: "ATS Score",
      icon: BarChart3,
      query: "What is my average ATS score?",
    },
    { label: "My Jobs", icon: Briefcase, query: "What jobs am I tracking?" },
    {
      label: "My Skills",
      icon: Wrench,
      query: "What skills are on my profile?",
    },
    {
      label: "Next Tasks",
      icon: CheckSquare,
      query: "What are my upcoming tasks?",
    },
    {
      label: "Completeness",
      icon: FileText,
      query: "What is my profile completeness?",
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/95 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-50 animate-bounce"
        title="AI Career Copilot"
      >
        {open ? <X size={22} /> : <Bot size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[340px] h-[450px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-linear-to-r from-primary to-indigo-700 px-4 py-3.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles size={18} className="text-indigo-200 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <p className="text-sm items-center gap-1.5 font-bold leading-none">
                  Career Copilot
                </p>
                <div className="flex flex-row items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-[10px] font-medium">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-indigo-200 hover:text-white transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 items-start ${
                  m.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.sender === "user"
                      ? "bg-indigo-150 text-primary dark:bg-indigo-950/40"
                      : "bg-primary text-white"
                  }`}
                >
                  {m.sender === "user" ? <User size={13} /> : <Bot size={13} />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[78%] leading-relaxed ${
                    m.sender === "user"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  {m.sender === "user" ? m.text : formatBotMessage(m.text)}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chips suggestions */}
          <div className="flex gap-1.5 overflow-x-auto px-3 py-1.5 border-t border-border bg-muted/10 scrollbar-none shrink-0">
            {quickQuestions.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => triggerQuery(q.query)}
                  className="px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary/40 text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0 active:scale-95 flex items-center gap-1"
                >
                  <Icon size={10} className="shrink-0" />
                  <span>{q.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-border flex gap-2 bg-card shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your ATS score, tasks, etc..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:border-primary/50 text-foreground"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-xl bg-primary text-white hover:bg-primary/95 flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.95] transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
