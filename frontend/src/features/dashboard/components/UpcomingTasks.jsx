import { useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";

export default function UpcomingTasks({ data }) {
  const userId = data?.user_id || "current";
  const taskStorageKey = `resupilot_dashboard_tasks_${userId}`;
  const [customTasks, setCustomTasks] = useState(() => {
    const saved = localStorage.getItem(taskStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((t) => !t.isDynamic);
      } catch (err) {
        console.error("Failed to parse custom tasks:", err);
        return [];
      }
    }
    return [];
  });

  const [doneDynamicIds, setDoneDynamicIds] = useState(() => {
    const saved = localStorage.getItem(taskStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.filter((t) => t.isDynamic && t.done).map((t) => t.id);
      } catch (err) {
        console.error("Failed to parse done dynamic tasks:", err);
        return [];
      }
    }
    return [];
  });

  const [input, setInput] = useState("");

  const dynamicTasks = [];
  const hasResumes = (data?.resume_history?.length || 0) > 0;
  const hasJobs = (data?.total_tracked_jobs || 0) > 0;
  const hasInterviews = (data?.total_interviews || 0) > 0;

  if (hasResumes) {
    const latestResume = data.resume_history[0];
    dynamicTasks.push({
      id: "res-1",
      text: `Review ATS suggestions for ${latestResume.title || "Resume"}`,
      done: doneDynamicIds.includes("res-1"),
      isDynamic: true,
    });
  } else {
    dynamicTasks.push({
      id: "res-0",
      text: "Upload or generate your first AI Resume",
      done: doneDynamicIds.includes("res-0"),
      isDynamic: true,
    });
  }

  if (hasJobs) {
    dynamicTasks.push({
      id: "job-1",
      text: "Track status updates and follow-ups in Job Tracker",
      done: doneDynamicIds.includes("job-1"),
      isDynamic: true,
    });
  } else {
    dynamicTasks.push({
      id: "job-0",
      text: "Add a target role application to Job Tracker",
      done: doneDynamicIds.includes("job-0"),
      isDynamic: true,
    });
  }

  if (hasInterviews) {
    dynamicTasks.push({
      id: "int-1",
      text: "Practice tailored questions for upcoming interviews",
      done: doneDynamicIds.includes("int-1"),
      isDynamic: true,
    });
  } else {
    dynamicTasks.push({
      id: "int-0",
      text: "Complete a custom Mock Interview session",
      done: doneDynamicIds.includes("int-0"),
      isDynamic: true,
    });
  }

  const tasks = [...dynamicTasks, ...customTasks];

  const saveTasksToStorage = (updatedCustom, updatedDoneDynamic) => {
    const all = [
      ...dynamicTasks.map((dt) => ({
        ...dt,
        done: updatedDoneDynamic.includes(dt.id),
      })),
      ...updatedCustom,
    ];
    localStorage.setItem(taskStorageKey, JSON.stringify(all));
  };

  const toggleTask = (id) => {
    const isDynamic =
      id.startsWith("res-") || id.startsWith("job-") || id.startsWith("int-");
    if (isDynamic) {
      const nextDoneDynamic = doneDynamicIds.includes(id)
        ? doneDynamicIds.filter((x) => x !== id)
        : [...doneDynamicIds, id];
      setDoneDynamicIds(nextDoneDynamic);
      saveTasksToStorage(customTasks, nextDoneDynamic);
    } else {
      const nextCustom = customTasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t,
      );
      setCustomTasks(nextCustom);
      saveTasksToStorage(nextCustom, doneDynamicIds);
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    // eslint-disable-next-line react-hooks/purity
    const newTask = { id: String(Date.now()), text: input.trim(), done: false };
    const nextCustom = [...customTasks, newTask];
    setCustomTasks(nextCustom);
    saveTasksToStorage(nextCustom, doneDynamicIds);
    setInput("");
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
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6">
            <p className="text-xs text-muted-foreground">
              All caught up! Add a custom task below.
            </p>
          </div>
        ) : (
          tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors text-left group"
            >
              {t.done ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle
                  size={16}
                  className="text-muted-foreground group-hover:text-foreground shrink-0"
                />
              )}
              <span
                className={`text-xs font-medium text-foreground ${
                  t.done ? "line-through text-muted-foreground" : ""
                }`}
              >
                {t.text}
              </span>
            </button>
          ))
        )}
      </div>

      <form
        onSubmit={addTask}
        className="flex gap-2 border-t border-border pt-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted border border-border focus:outline-none focus:border-primary/50 text-foreground"
        />
        <button
          type="submit"
          className="w-8 h-8 rounded-xl bg-primary text-white hover:bg-primary/95 flex items-center justify-center cursor-pointer shrink-0 active:scale-[0.95] transition-all"
        >
          <Plus size={14} />
        </button>
      </form>
    </div>
  );
}
