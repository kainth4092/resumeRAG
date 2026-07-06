import api from "../../../services/api";

export const dashboardService = {
  getDashboardData: async (localHour, bypassCache = false) => {
    const params = {};
    if (localHour !== undefined && localHour !== null) {
      params.local_hour = localHour;
    }
    const response = await api.get("/dashboard", { params, bypassCache });
    return response.data;
  }
};
