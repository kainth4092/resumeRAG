import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  console.log("PROTECTED ROUTE LOADED");
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
