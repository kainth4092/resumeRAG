import api from "../../../services/api";

export async function getDashboardData() {
  const localHour = new Date().getHours();

  const response = await api.get("/dashboard", {
    params: {
      local_hour: localHour,
      _timestamp: Date.now(),
    },
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return response.data;
}

export async function getDashboardTasks() {
  const response = await api.get("/dashboard/tasks");
  return response.data;
}

export async function createDashboardTask(title) {
  const response = await api.post("/dashboard/tasks", { title });
  return response.data;
}

export async function updateDashboardTask(id, completed) {
  const response = await api.patch(`/dashboard/tasks/${id}`, { completed });
  return response.data;
}

export async function deleteDashboardTask(id) {
  const response = await api.delete(`/dashboard/tasks/${id}`);
  return response.data;
}

export const dashboardService = {
  getDashboardData,
  getDashboardTasks,
  createDashboardTask,
  updateDashboardTask,
  deleteDashboardTask,
};

export default dashboardService;
