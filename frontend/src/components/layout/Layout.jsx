import { useState, useEffect, useRef, Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FloatingAI from "./FloatingAI";
import { useAuth } from "../../features/auth/context/AuthContext";
import { EmailModal } from "../../features/email";
import DashboardSkeleton from "../loading/DashboardSkeleton";
import ProfileSkeleton from "../loading/ProfileSkeleton";
import ResumeSkeleton from "../loading/ResumeSkeleton";
import JobSkeleton from "../loading/JobSkeleton";
import InterviewSkeleton from "../loading/InterviewSkeleton";
import PageLoader from "../loading/PageLoader";
import AIResumeSuiteShimmer from "../../features/resume/components/ai-workspace/AIResumeSuiteShimmer";

const ActivePageSkeleton = () => {
  const location = useLocation();
  const path = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const view = searchParams.get("view");

  if (path === "/dashboard") {
    return <DashboardSkeleton />;
  }
  if (path === "/profile") {
    return <ProfileSkeleton />;
  }
  if (path === "/resume/editor") {
    return <ResumeSkeleton mode="builder" />;
  }
  if (path === "/resumes") {
    if (view === "new") {
      return <AIResumeSuiteShimmer />;
    }
    return <ResumeSkeleton mode="list" />;
  }
  if (path === "/analysis") {
    return <AIResumeSuiteShimmer />;
  }
  if (path === "/interview") {
    return <InterviewSkeleton mode="list" />;
  }
  if (path === "/tracker") {
    return <JobSkeleton mode="discovery" />;
  }
  return <DashboardSkeleton />;
};

export default function Layout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(true);
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!loading && user && !user.onboarded) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="flex w-full h-full overflow-hidden">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        onMouseEnter={() => {
          if (collapsed) setHoverExpanded(true);
        }}
        onMouseLeave={() => {
          setHoverExpanded(false);
        }}
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        flex flex-col h-full bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        ${collapsed && !hoverExpanded ? "lg:w-[68px]" : "lg:w-[240px]"}
        ${mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full lg:translate-x-0"}
        shadow-lg lg:shadow-none
      `}
      >
        <Sidebar
          collapsed={mobileOpen ? false : collapsed && !hoverExpanded}
          isBaseCollapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          notifRef={notifRef}
          notifOpen={notifOpen}
          profileOpen={profileOpen}
          profileRef={profileRef}
          setNotifOpen={setNotifOpen}
          setProfileOpen={setProfileOpen}
          setMobileOpen={setMobileOpen}
          onEmailClick={() => setEmailModalOpen(true)}
        />

        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-background">
          <Suspense fallback={<ActivePageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <EmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
      <FloatingAI />
    </div>
  );
}
