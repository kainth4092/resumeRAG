import { Navigate, Outlet } from "react-router-dom";

export default function PublicOnlyRoute() {
  const token = localStorage.getItem("access_token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
