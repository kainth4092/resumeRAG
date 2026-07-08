import api from "../../../services/api";

export const getRoadmap = async () => {
  const response = await api.get("/roadmap", {
    headers: { "x-bypass-cache": "true" }
  });
  return response.data;
};

export const updateTargetRole = async (target_role, target_level) => {
  const response = await api.put("/roadmap/target", {
    target_role,
    target_level
  });
  return response.data;
};

export const toggleTask = async (task_text, done) => {
  const response = await api.post("/roadmap/toggle-task", {
    task_text,
    done
  });
  return response.data;
};
