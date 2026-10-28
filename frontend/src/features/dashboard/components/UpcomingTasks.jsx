import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import {
  getDashboardTasks,
  createDashboardTask,
  updateDashboardTask,
  deleteDashboardTask,
} from "../services/dashboardService";

export default function UpcomingTasks({ data }) {
  const [backendTasks, setBackendTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadTasks() {
      try {
        setLoading(true);
        const tasks = await getDashboardTasks();
        if (mounted) {
          setBackendTasks(tasks);
        }
      } catch (err) {
        console.error("Failed to load dashboard tasks:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadTasks();
    return () => {
      mounted = false;
    };
  }, []);

  const hasResumes =
    (data?.stats_summary?.resumes_count || 0) > 0 ||
    (data?.resume_history?.length || 0) > 0;
  const hasJobs = (data?.total_tracked_jobs || 0) > 0;
  const hasInterviews = (data?.total_interviews || 0) > 0;

  const dynamicTasks = [
    {
      id: "dyn-resume",
      text: hasResumes
        ? "Review ATS analysis on your latest resume"
        : "Upload or generate your first AI resume",
      done: hasResumes,
      isDynamic: true,
    },
    {
      id: "dyn-jobs",
      text: hasJobs
        ? "Track status updates and follow-ups in Job Tracker"
        : "Save a target job listing to your Job Tracker",
      done: hasJobs,
      isDynamic: true,
    },
    {
      id: "dyn-interview",
      text: hasInterviews
        ? "Practice tailored questions for upcoming interviews"
        : "Start your first personalized interview prep session",
      done: hasInterviews,
      isDynamic: true,
    },
  ];

  const handleToggleBackendTask = async (task) => {
    const nextCompleted = !task.completed;
    setBackendTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: nextCompleted } : t))
    );
    try {
      await updateDashboardTask(task.id, nextCompleted);
    } catch (err) {
      console.error("Failed to update task:", err);
      // Rollback
      setBackendTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !nextCompleted } : t))
      );
    }
  };

  const handleDeleteBackendTask = async (e, taskId) => {
    e.stopPropagation();
    setBackendTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await deleteDashboardTask(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setInput("");
    try {
      const created = await createDashboardTask(text);
      setBackendTasks((prev) => [...prev, created]);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-bold text-foreground">Upcoming Tasks</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Keep track of your job search progress
        </p>
      </div>

      <div className="space-y-2.5 my-4 flex-1">
        {dynamicTasks.map((t) => (
          <div
            key={t.id}
            className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 text-left select-none"
          >
            {t.done ? (
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            ) : (
              <Circle size={16} className="text-muted-foreground shrink-0" />
            )}
            <span
              className={`text-xs font-medium text-foreground ${
                t.done ? "line-through text-muted-foreground" : ""
              }`}
            >
              {t.text}
            </span>
          </div>
        ))}

        {backendTasks.map((t) => (
          <div
            key={t.id}
            onClick={() => handleToggleBackendTask(t)}
            className="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              {t.completed ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle
                  size={16}
                  className="text-muted-foreground group-hover:text-foreground shrink-0"
                />
              )}
              <span
                className={`text-xs font-medium text-foreground truncate ${
                  t.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {t.title}
              </span>
            </div>
            <button
              onClick={(e) => handleDeleteBackendTask(e, t.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive text-muted-foreground transition-opacity"
              title="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}

        {backendTasks.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Add your own custom milestones below.
          </p>
        )}
      </div>

      <form onSubmit={handleAddTask} className="flex gap-2 border-t border-border pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new milestone or task..."
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:border-primary/50 text-foreground"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="w-8 h-8 rounded-xl bg-primary text-white hover:bg-primary/95 disabled:opacity-40 flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.95] transition-all"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
