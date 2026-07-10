import api from "./api";

export const getNotifications = () => {
  return api.get("/notifications");
};

export const markNotificationRead = (notificationId) => {
  return api.patch(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsRead = () => {
  return api.patch("/notifications/read-all");
};
