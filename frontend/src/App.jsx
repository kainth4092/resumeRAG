import { useEffect } from "react";
import AppRoutes from "./routes/App_Routes";
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const root = document.documentElement;

    if (savedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
      if (!savedTheme) {
        localStorage.setItem("theme", "light");
      }
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppRoutes />
    </GoogleOAuthProvider>
  );
}
