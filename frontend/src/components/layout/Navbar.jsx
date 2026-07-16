import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Send,
  Sun,
  User,
  Bell,
  Search,
  Zap,
  MessageSquare,
  Briefcase,
  Map,
  Settings,
} from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";

function formatNotificationTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export default function Navbar({
  profileRef,
  setNotifOpen,
  setProfileOpen,
  setMobileOpen,
  profileOpen,
  notifOpen,
  notifRef,
  onEmailClick,
}) {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved;
      return "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    const shouldUseDark =
      theme === "dark" || (theme === "system" && systemPrefersDark);

    root.classList.toggle("dark", shouldUseDark);
    root.style.colorScheme = shouldUseDark ? "dark" : "light";

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event) => {
      const savedTheme =
        event?.detail?.theme || localStorage.getItem("theme") || "light";

      setTheme(savedTheme);
    };

    window.addEventListener("resupilot-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("resupilot-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      setNotificationError("");

      const response = await getNotifications();

      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotificationError("Failed to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationRead(notification.id);

        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item,
          ),
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification.action_url) {
        setNotifOpen(false);
        navigate(notification.action_url);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      await markAllNotificationsRead();

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const logout = () => {
    if (authLogout) {
      authLogout();
    } else {
      localStorage.removeItem("access_token");
    }
    navigate("/");
  };

  const searchItems = [
    {
      label: "Dashboard Overview",
      route: "/dashboard",
      desc: "View main metrics and activity log",
      icon: Zap,
    },
    {
      label: "AI Resume Generator",
      route: "/generator",
      desc: "Build or upload a new ATS-ready resume",
      icon: Zap,
    },
    {
      label: "My Resumes",
      route: "/resumes",
      desc: "Manage generated resumes and versions",
      icon: Zap,
    },
    {
      label: "Mock Interview Prep",
      route: "/interview",
      desc: "Practice behavioral and tech questions",
      icon: MessageSquare,
    },
    {
      label: "Job Tracker Pipeline",
      route: "/tracker",
      desc: "Track interviews, offers, and deadlines",
      icon: Briefcase,
    },
    {
      label: "Resume & Career Insights",
      route: "/analysis",
      desc: "Check missing keywords and skills",
      icon: Map,
    },
    {
      label: "My Profile",
      route: "/profile",
      desc: "Account settings and target roles",
      icon: User,
    },
  ];

  const filteredSearchItems = searchItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSearchNavigate = (route) => {
    navigate(route);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <header className="shrink-0 h-16 flex items-center justify-between gap-3 px-4 md:px-6 border-b border-border bg-card/85 backdrop-blur-xl z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen?.(true)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <Menu size={18} />
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center justify-between gap-2 px-3 py-1.5 bg-muted/60 border border-border hover:border-muted-foreground/30 rounded-xl text-muted-foreground text-xs w-84 hover:bg-muted transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2">
              <Search size={14} className="text-muted-foreground" />
              <span>Search dashboard...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-sans font-bold bg-card border border-border rounded text-muted-foreground/80 leading-none">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mobile search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Search"
          >
            <Search size={16} />
          </button>

          <button
            onClick={onEmailClick}
            className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Send resume"
          >
            <Send size={16} />
          </button>

          {/* Theme switcher */}
          <button
            onClick={() => {
              const isCurrentlyDark =
                document.documentElement.classList.contains("dark");

              const newTheme = isCurrentlyDark ? "light" : "dark";

              setTheme(newTheme);
              localStorage.setItem("theme", newTheme);

              window.dispatchEvent(
                new CustomEvent("resupilot-theme-change", {
                  detail: { theme: newTheme },
                }),
              );
            }}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer overflow-hidden group"
            title={
              document.documentElement.classList.contains("dark")
                ? "Switch to Light Mode"
                : "Switch to Dark Mode"
            }
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <Sun
                size={16}
                className={`absolute transition-all duration-300 transform ${
                  theme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                }`}
              />
              <Moon
                size={16}
                className={`absolute transition-all duration-300 transform ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </div>
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen((open) => !open);
                setProfileOpen(false);
              }}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={17} className="text-muted-foreground" />

              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-background">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-24px)] bg-popover border border-border rounded-2xl shadow-lg z-50 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Notifications
                    </p>

                    {unreadCount > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {unreadCount} unread
                      </p>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-[360px] overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-muted-foreground">
                        Loading notifications...
                      </p>
                    </div>
                  ) : notificationError ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-red-500">
                        {notificationError}
                      </p>

                      <button
                        onClick={fetchNotifications}
                        className="mt-2 text-[10px] font-semibold text-primary cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="px-6 py-10 text-center">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-muted flex items-center justify-center mb-3">
                        <Bell size={17} className="text-muted-foreground" />
                      </div>

                      <p className="text-xs font-semibold text-foreground">
                        No notifications yet
                      </p>

                      <p className="text-[10px] text-muted-foreground mt-1">
                        New updates will appear here.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full p-3 text-left hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50 last:border-b-0 ${
                          !notification.is_read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground leading-snug">
                              {notification.title}
                            </p>

                            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                              {notification.message}
                            </p>

                            <p className="text-[9px] text-muted-foreground/70 mt-1.5">
                              {formatNotificationTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 h-9 pl-1.5 pr-2.5 rounded-xl hover:bg-muted transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-xs font-bold overflow-hidden shrink-0">
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : user?.name ? (
                  user.name[0].toUpperCase()
                ) : (
                  "U"
                )}
              </div>
              <span className="text-xs font-bold text-foreground hidden sm:block">
                {user?.name ? user.name.split(" ")[0] : "Professional"}
              </span>
              <ChevronDown
                size={12}
                className={`text-muted-foreground transition-transform shrink-0 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-2xl shadow-lg z-50 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-xs font-bold text-foreground truncate">
                    {user?.name || "Professional"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors cursor-pointer h-9 text-left font-semibold"
                  >
                    <User size={14} className="text-muted-foreground" />
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-foreground hover:bg-muted transition-colors cursor-pointer h-9 text-left font-semibold"
                  >
                    <Settings size={14} className="text-muted-foreground" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={() => {
                      logout();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-xs text-destructive hover:bg-destructive/5 transition-colors cursor-pointer h-9 text-left font-bold"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 cursor-default"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
          />
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[420px] mx-4 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* Input field */}
            <div className="flex items-center gap-3 px-4 border-b border-border h-12 shrink-0">
              <Search size={16} className="text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pages, tools, and actions..."
                className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder-muted-foreground"
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="text-[10px] px-2 py-1 rounded bg-muted border border-border text-muted-foreground font-bold hover:bg-muted transition-colors cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* List results */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-border/10">
              {filteredSearchItems.length > 0 ? (
                filteredSearchItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSearchNavigate(item.route)}
                      className="w-full text-left p-3 rounded-xl hover:bg-muted flex items-start gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {item.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-muted-foreground font-semibold">
                    No results found for "{searchQuery}"
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    Try searching for resumes, tracker, or mock interviews
                  </p>
                </div>
              )}
            </div>

            {/* Footer tips */}
            <div className="h-9 px-4 border-t border-border flex items-center justify-between bg-muted/30 text-[10px] text-muted-foreground select-none shrink-0 font-medium">
              <span>Use ↑↓ keys to navigate, enter to select</span>
              <span>ResuPilot AI Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
