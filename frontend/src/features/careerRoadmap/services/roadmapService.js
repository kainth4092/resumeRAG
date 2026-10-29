import api from "../../../services/api";

export const getRoadmap = async (resumeId = null) => {
  const params = resumeId ? { resume_id: resumeId } : {};
  const response = await api.get("/roadmap", { params });
  return response.data;
};

export async function updateTargetRole(targetRole, targetLevel, resumeId = null) {
  const response = await api.put("/roadmap/target", {
    target_role: targetRole,
    target_level: targetLevel,
    resume_id: resumeId,
  });
  return response.data;
}

export async function toggleTask(taskId, resumeId = null) {
  const response = await api.post("/roadmap/toggle-task", {
    task_id: taskId,
    resume_id: resumeId,
  });
  return response.data;
}