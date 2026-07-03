import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./features/auth/context/AuthContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import "./index.css";

window.addEventListener("error", console.error);
window.addEventListener("unhandledrejection", console.error);

const appName = import.meta.env.VITE_APP_NAME || "ResuPilot AI";
document.title = appName;
document.documentElement.dataset.environment =
  import.meta.env.VITE_ENVIRONMENT || "development";

console.log("MAIN LOADED");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
