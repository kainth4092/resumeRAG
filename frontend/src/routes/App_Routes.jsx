import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import { Profile } from "../pages/profile/Profile";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Layout from "../components/layout/Layout";
import { ResumeGenerator } from "../pages/generator/Generator";
import ResumeEditor from "../pages/resume/ResumeEditor";

import MyResumes from "../pages/resume/MyResumes";
import Templates from "../pages/resume/Templates";

export default function AppRoutes() {
    return (
        <BrowserRouter >
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
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}