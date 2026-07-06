import { useState, useEffect } from "react";
import { ChevronDown, LogOut, Menu, Moon, Send, Sun, User } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar({
  profileRef,
  setNotifOpen,
  setProfileOpen,
  setMobileOpen,
  profileOpen,
  onEmailClick,
}) {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();

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
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const logout = () => {
    if (authLogout) {
      authLogout();
    } else {
      localStorage.removeItem("access_token");
    }
    navigate("/");
  };

  return (
    <header className="shrink-0 h-16 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-xl z-30 shadow-(--shadow-sm)">
      <button
        onClick={() => setMobileOpen?.(true)}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={onEmailClick}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Send resume"
        >
          <Send size={17} />
        </button>

        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer overflow-hidden group"
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Sun
              size={17}
              className={`absolute transition-all duration-300 transform ${
                theme === "dark"
                  ? "rotate-90 scale-0 opacity-0"
                  : "rotate-0 scale-100 opacity-100"
              }`}
            />
            <Moon
              size={17}
              className={`absolute transition-all duration-300 transform ${
                theme === "dark"
                  ? "rotate-0 scale-100 opacity-100"
                  : "-rotate-90 scale-0 opacity-0"
              }`}
            />
          </div>
        </button>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 h-9 pl-1.5 pr-3 rounded-xl hover:bg-muted transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-xs font-bold overflow-hidden">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user?.avatar
              )}
            </div>
            <span className="text-md font-semibold text-foreground hidden md:block">
              {user?.name.split(" ")[0]}
            </span>
            <ChevronDown
              size={12}
              className={`text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>
          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-2xl shadow-(--shadow-lg) z-50 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
              <div className="px-4 py-3.5 border-b border-border">
                <p className="text-md font-semibold text-foreground">
                  {user?.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>
              <div className="py-1">
                {[{ icon: User, label: "Profile", page: "/profile" }].map(
                  (item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        if (item.page) {
                          navigate(item.page);
                        }
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-md text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      <item.icon size={14} className="text-muted-foreground" />
                      {item.label}
                    </button>
                  ),
                )}
              </div>
              <div className="border-t border-border py-1">
                <button
                  onClick={() => {
                    logout();
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-md text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
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
  );
}
