import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import PublicOnlyRoute from "../components/layout/PublicOnlyRoute";
import Layout from "../components/layout/Layout";
import { lazy, Suspense } from "react";
import PageLoader from "../components/loading/PageLoader";

const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));
const LandingPage = lazy(() => import("../features/landing/pages/LandingPage"));
const Onboarding = lazy(() => import("../features/onboarding/pages/Onboarding"));
const TermsPage = lazy(() => import("../features/auth/pages/TermsPage"));
const PrivacyPage = lazy(() => import("../features/auth/pages/PrivacyPage"));

const Dashboard = lazy(() => import("../features/dashboard/pages/Dashboard"));
const Profile = lazy(() =>
  import("../features/profile/pages/Profile").then((m) => ({
    default: m.Profile,
  })),
);
const ResumeEditor = lazy(
  () => import("../features/resume/pages/ResumeEditor"),
);
const MyResumes = lazy(() => import("../features/resume/pages/MyResumes"));
const ResumeAnalysis = lazy(
  () => import("../features/resume/pages/ResumeAnalysis"),
);
const InterviewPrep = lazy(
  () => import("../features/interview/pages/InterviewPrep"),
);
const JobsPage = lazy(() => import("../features/jobs/pages/JobsPage"));

export default function AppRoutes() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/index.html" element={<Navigate to="/" replace />} />

            <Route path="/" element={<LandingPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
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
        </Suspense>
      </BrowserRouter>
    </>
  );
}
