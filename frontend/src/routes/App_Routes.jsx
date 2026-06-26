import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Layout components (shared infrastructure)
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Layout from "../components/layout/Layout";

// Auth feature
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

// Dashboard feature
import Dashboard from "../features/dashboard/pages/Dashboard";

// Profile feature
import { Profile } from "../features/profile/pages/Profile";

// Resume feature
import { ResumeGenerator } from "../features/resume/pages/Generator";
import ResumeEditor from "../features/resume/pages/ResumeEditor";
import MyResumes from "../features/resume/pages/MyResumes";
import Templates from "../features/resume/pages/Templates";

// Interview feature
import InterviewPrep from "../features/interview/pages/InterviewPrep";

// Jobs feature
import JobsPage from "../features/jobs/pages/JobsPage";

export default function AppRoutes() {
    return (
        <>
            <Toaster richColors position="top-right" />
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/generator" element={<ResumeGenerator />} />
                            <Route path="/resume/editor" element={<ResumeEditor />} />
                            <Route path="/resumes" element={<MyResumes />} />
                            <Route path="/templates" element={<Templates />} />
                            <Route path="/interview" element={<InterviewPrep />} />
                            <Route path="/tracker" element={<JobsPage />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}
