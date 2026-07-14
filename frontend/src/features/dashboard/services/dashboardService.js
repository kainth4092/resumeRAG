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

export const dashboardService = {
  getDashboardData,
};

export default dashboardService;
