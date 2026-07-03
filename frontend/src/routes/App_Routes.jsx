import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import PublicOnlyRoute from "../components/layout/PublicOnlyRoute";
import Layout from "../components/layout/Layout";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import Dashboard from "../features/dashboard/pages/Dashboard";
import { Profile } from "../features/profile/pages/Profile";
import ResumeEditor from "../features/resume/pages/ResumeEditor";
import MyResumes from "../features/resume/pages/MyResumes";
import ResumeAnalysis from "../features/resume/pages/ResumeAnalysis";
import InterviewPrep from "../features/interview/pages/InterviewPrep";
import JobsPage from "../features/jobs/pages/JobsPage";

export default function AppRoutes() {
  console.log("ROUTES LOADED");
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route element={<PublicOnlyRoute />}>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/generator"
                element={<Navigate to="/resumes?view=new" replace />}
              />
              <Route path="/resume/editor" element={<ResumeEditor />} />
              <Route path="/resumes" element={<MyResumes />} />
              <Route path="/analysis" element={<ResumeAnalysis />} />
              <Route
                path="/templates"
                element={<Navigate to="/resumes" replace />}
              />
              <Route path="/interview" element={<InterviewPrep />} />
              <Route path="/tracker" element={<JobsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
