import { PanelLeftClose, PanelLeftOpen, LogOut, Zap } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { NAV_SECTIONS } from "../../data/navigation";

export default function Sidebar({ collapsed, setCollapsed, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();

  const currentPage = location.pathname.split("/")[1] || "dashboard";

  const handleNav = (id) => {
    navigate(`/${id}`);
    setMobileOpen(false);
  };

  const logout = () => {
    if (authLogout) {
      authLogout();
    } else {
      localStorage.removeItem("access_token");
    }
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className={`flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-primary/30">
              <Zap size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-md font-semibold text-sidebar-foreground leading-none truncate">
                ResumeRAG
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
            <Zap size={15} className="text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden lg:flex w-6 h-6 items-center justify-center rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground transition-all"
        >
          {collapsed ? (
            <PanelLeftOpen size={14} />
          ) : (
            <PanelLeftClose size={14} />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-widest">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = currentPage === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`
                                            w-full flex items-center gap-3 rounded-xl text-md transition-all duration-150 group relative
                                            ${collapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
                                            ${
                                              active
                                                ? "bg-primary/10 text-primary font-medium"
                                                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            }
                                        `}
                  >
                    {active && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                    )}
                    <Icon
                      size={16}
                      className={`flex-shrink-0 transition-colors ${active ? "text-primary" : ""}`}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                              item.badge === "New"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                    )}

                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs rounded-xl shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-150">
                        {item.label}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover border-l border-t border-border rotate-[-45deg]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex-shrink-0 p-3 border-t border-sidebar-border">
        {collapsed ? (
          <button className="w-full flex justify-center p-1" onClick={logout}>
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
              {user?.avatar}
            </div>
          </button>
        ) : (
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-all cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
              {user?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1 rounded-lg hover:bg-destructive/10"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
