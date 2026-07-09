import api from "../../../services/api";

export const getRoadmap = async () => {
  const response = await api.get("/roadmap");
  return response.data;
};

export async function updateTargetRole(targetRole, targetLevel) {
  const response = await api.put("/roadmap/target", {
    target_role: targetRole,
    target_level: targetLevel,
  });
  return response.data;
}

export async function toggleTask(taskId) {
  const response = await api.post("/roadmap/toggle-task", {
    task_id: taskId,
  });
  return response.data;
}
