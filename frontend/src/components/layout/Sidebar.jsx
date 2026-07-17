import { useState, useEffect } from "react";
import {
  Zap,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Briefcase,
  User,
  Star,
  Settings,
  Map as MapIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/context/AuthContext";
import { getTrackedJobs } from "../../features/jobs/services/jobs.service";

const NAV_GROUPS = [
  {
    title: "Overview",
    items: [
      {
        id: "dashboard",
        icon: LayoutDashboard,
        label: "Home",
        route: "/dashboard",
      },
    ],
  },
  {
    title: "Resume",
    items: [
      {
        id: "generator",
        icon: Zap,
        label: "AI Generator",
        route: "/generator",
        badge: "AI",
      },
      { id: "resumes", icon: FileText, label: "Resumes", route: "/resumes" },
    ],
  },
  {
    title: "Interview",
    items: [
      {
        id: "interview",
        icon: MessageSquare,
        label: "Interview Prep",
        route: "/interview",
      },
    ],
  },
  {
    title: "Jobs",
    items: [
      {
        id: "tracker",
        icon: Briefcase,
        label: "Job Tracker",
        route: "/tracker",
        badge: "count",
      },
    ],
  },
  {
    title: "Career",
    items: [
      {
        id: "roadmap",
        icon: MapIcon,
        label: "Career Roadmap",
        route: "/roadmap",
      },
      // {
      //   id: "analytics",
      //   icon: BarChart3,
      //   label: "Analytics",
      //   route: "/analysis",
      // },
    ],
  },
  {
    title: "Account",
    items: [
      { id: "profile", icon: User, label: "Profile", route: "/profile" },
      { id: "settings", icon: Settings, label: "Settings", route: "/settings" },
    ],
  },
];

export default function Sidebar({ collapsed, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [jobCount, setJobCount] = useState(null);

  useEffect(() => {
    const fetchCount = () => {
      getTrackedJobs()
        .then((data) => {
          if (data) setJobCount(data.length);
        })
        .catch(() => {});
    };

    fetchCount();
    const interval = setInterval(fetchCount, 15000);

    const handleUpdate = (e) => {
      setJobCount(e.detail);
    };
    window.addEventListener("tracker-updated", handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("tracker-updated", handleUpdate);
    };
  }, []);

  const handleNav = (route) => {
    navigate(route);
    setMobileOpen(false);
  };

  const isRouteActive = (route) => {
    if (route === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (route === "/generator") {
      return (
        location.pathname.startsWith("/generator") ||
        location.pathname.startsWith("/analysis") ||
        (location.pathname.startsWith("/resumes") &&
          location.search.includes("view=new"))
      );
    }
    if (route === "/resumes") {
      return (
        location.pathname.startsWith("/resumes") &&
        !location.search.includes("view=new")
      );
    }
    return location.pathname.startsWith(route);
  };

  const workspaceName = user?.name
    ? `${user.name.split(" ")[0]}'s Workspace`
    : "My Workspace";

  return (
    <div className="flex flex-col h-full bg-card border-r border-border text-foreground transition-all duration-300">
      <div
        className={`flex items-center h-16 px-4 border-b border-border shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/30">
            <Zap size={16} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-md font-bold leading-none truncate bg-linear-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              ResuPilot AI
            </span>
          )}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none mb-1.5">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isRouteActive(item.route);
                const Icon = item.icon;
                const displayBadge =
                  item.badge === "count"
                    ? jobCount > 0
                      ? jobCount
                      : null
                    : item.badge;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.route)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-3 rounded-xl text-md transition-all duration-150 group relative cursor-pointer
                      ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
                      ${
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreround"
                      }
                    `}
                  >
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                    )}
                    <Icon
                      size={15}
                      className={`shrink-0 ${active ? "text-primary animate-pulse" : ""}`}
                    />

                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {displayBadge !== null &&
                          displayBadge !== undefined && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                item.badge === "AI"
                                  ? "bg-primary text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {displayBadge}
                            </span>
                          )}
                      </>
                    )}

                    {collapsed && displayBadge && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Pro membership */}
      <div className="p-3 border-t border-border shrink-0">
        {collapsed ? (
          <div className="flex justify-center">
            <div
              className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary cursor-pointer hover:scale-105 transition-transform"
              title="Pro Workspace"
            >
              <Star size={14} className="fill-primary text-primary" />
            </div>
          </div>
        ) : (
          <div className="bg-linear-to-br from-primary/5 to-indigo-500/5 border border-primary/10 p-3 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Star size={11} className="fill-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-foreground truncate leading-none">
                  {workspaceName}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/settings")}
              className="w-full py-1.5 bg-primary hover:bg-primary/95 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-[0.98]"
            >
              Manage Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
