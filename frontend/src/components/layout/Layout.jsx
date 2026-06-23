import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { notifications } from "../../data/navigation";


export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    useEffect(() => {
        const handler = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);


    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="flex w-full h-full overflow-hidden">
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        flex flex-col h-full bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden
        ${collapsed ? "lg:w-[68px]" : "lg:w-[240px]"}
        ${mobileOpen ? "translate-x-0 w-[240px]" : "-translate-x-full lg:translate-x-0"}
        shadow-lg lg:shadow-none
      `}>
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                    setMobileOpen={setMobileOpen} />
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                <Navbar
                    notifRef={notifRef}
                    notifOpen={notifOpen}
                    unreadCount={unreadCount}
                    profileOpen={profileOpen}
                    profileRef={profileRef}
                    setNotifOpen={setNotifOpen}
                    setProfileOpen={setProfileOpen}
                    setMobileOpen={setMobileOpen} />

                <main className="flex-1 overflow-y-auto bg-background">
                    <Outlet />
                </main>
            </div>

            {/* <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
            <EmailModal open={emailOpen} onClose={() => setEmailOpen(false)} /> */}
        </div>
    );
}
