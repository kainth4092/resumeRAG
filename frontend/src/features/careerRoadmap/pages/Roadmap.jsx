import { useState, useEffect, useCallback } from "react";
import RoadmapHeader from "../components/RoadmapHeader";
import TargetRoleBanner from "../components/TargetRoleBanner";
import SkillGapAnalysis from "../components/SkillGapAnalysis";
import TimelineRoadmap from "../components/TimelineRoadmap";
import RecommendationsAndProjects from "../components/RecommendationsAndProjects";
import UpdateRoleModal from "../components/UpdateRoleModal";
import {
  getRoadmap,
  updateTargetRole,
  toggleTask,
} from "../services/roadmapService";
import RoadmapSkeleton from "../../../components/loading/RoadmapSkeleton";

export default function Roadmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const fetchRoadmap = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const response = await getRoadmap();
      setData(response);
    } catch (err) {
      console.error("Error fetching career roadmap:", err);
      setError("Failed to load your career roadmap. Please try again.");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchRoadmap(true);
    };
    load();
  }, [fetchRoadmap]);

  const handleUpdateRole = async (role, level) => {
    setLoading(true);
    setError("");

    try {
      const updated = await updateTargetRole(role, level);
      setData(updated);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating target role:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update target role. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    if (!taskId || isToggling) return;

    setIsToggling(true);
    setError("");

    try {
      const result = await toggleTask(taskId);

      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          completed_tasks: result.completed_tasks,
          roadmap: current.roadmap.map((phase) => ({
            ...phase,
            tasks: phase.tasks.map((task) =>
              task.id === result.task_id
                ? {
                    ...task,
                    completed: result.completed,
                  }
                : task,
            ),
          })),
        };
      });
    } catch (err) {
      console.error("Error toggling roadmap task:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update this roadmap task. Please try again.",
      );
    } finally {
      setIsToggling(false);
    }
  };

  if (loading && !data) {
    return <RoadmapSkeleton />;
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <RoadmapHeader onUpdateClick={() => setIsModalOpen(true)} />

        {data && (
          <>
            <TargetRoleBanner
              targetRole={data.target_role}
              targetLevel={data.target_level}
              readiness={data.readiness}
            />

            <SkillGapAnalysis
              currentSkills={data.current_skills}
              requiredSkills={data.required_skills}
            />

            <TimelineRoadmap
              periods={data.roadmap}
              onToggleTask={handleToggleTask}
              isToggling={isToggling}
            />

            <RecommendationsAndProjects
              recommendations={data.learning_recommendations}
              projects={data.projects_to_build}
            />

            <UpdateRoleModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleUpdateRole}
              initialRole={data.target_role}
              initialLevel={data.target_level}
            />
          </>
        )}
      </div>
    </div>
  );
}
