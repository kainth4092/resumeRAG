import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../../features/auth/context/AuthContext";
import { EmailModal } from "../../features/email";

export default function Layout() {
  console.log("LAYOUT LOADED");
  const { loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

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
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
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
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        flex flex-col h-full bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-in-out shrink-0 overflow-hidden
        ${collapsed ? "lg:w-[68px]" : "lg:w-[240px]"}
        ${mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full lg:translate-x-0"}
        shadow-lg lg:shadow-none
      `}
      >
        <Sidebar
          collapsed={collapsed}
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

        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
      <EmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
      />
    </div>
  );
}
