import { Bell, Mail, Menu, Moon, Search, X } from "lucide-react";
import { notifications } from "../../data/navigation";


export default function Navbar({ notifRef, unreadCount, notifOpen, profileRef, setNotifOpen, setProfileOpen, setMobileOpen }) {
    return (
        <header className="flex-shrink-0 h-16 flex items-center gap-3 px-4 md:px-6 border-b border-border bg-card/80 backdrop-blur-xl z-30 shadow-[var(--shadow-sm)]">

            <button
                onClick={() => setMobileOpen?.(true)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            >
                <Menu size={18} />
            </button>

            <button
                className="flex items-center gap-2.5 flex-1 max-w-xs h-9 px-3.5 bg-input-background border border-border rounded-xl text-sm text-muted-foreground hover:border-primary/40 hover:bg-accent/50 transition-all group"
            >
                <Search size={14} className="flex-shrink-0" />
                <span className="flex-1 text-left text-muted-foreground/70 hidden sm:block">Search anything...</span>
                <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] bg-muted text-muted-foreground/70 px-1.5 py-0.5 rounded-md border border-border font-mono ml-auto">
                    ⌘K
                </kbd>
            </button>

            <div className="flex items-center gap-1.5 ml-auto">

                <button
                    className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title="Send resume"
                >
                    <Mail size={17} />
                </button>

                <button
                    className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title="Toggle dark mode"
                >
                    <Moon size={17} />
                </button>

                <div ref={notifRef} className="relative">
                    <button
                        onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
                        className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    >
                        <Bell size={17} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    {notifOpen && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <span className="text-sm font-semibold text-foreground">Notifications</span>
                                <div className="flex items-center gap-2">
                                    <button className="text-[11px] text-primary hover:text-primary/80 font-medium">Mark all read</button>
                                    <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground w-5 h-5 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                                        <X size={13} />
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.map(n => (
                                    <div key={n.id} className={`flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 cursor-pointer hover:bg-muted/40 transition-colors ${n.unread ? "bg-primary/3" : ""}`}>
                                        <span className="text-lg leading-none mt-0.5 flex-shrink-0">{n.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold text-foreground ${n.unread ? "" : "opacity-70"}`}>{n.title}</p>
                                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{n.body}</p>
                                            <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                                        </div>
                                        {n.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                                <button className="text-xs text-primary hover:text-primary/80 font-medium w-full text-center transition-colors">View all notifications →</button>
                            </div>
                        </div>
                    )}
                </div>

                <div ref={profileRef} className="relative">
                    <button
                        onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
                        className="flex items-center gap-2.5 h-9 pl-1.5 pr-3 rounded-xl hover:bg-muted transition-all"
                    >
                        {/* <div className="w-7 h-7 rounded-xl bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                            {user?.avatar}
                        </div> */}
                        {/* <span className="text-sm font-medium text-foreground hidden md:block">{user?.name.split(" ")[0]}</span>
                        <ChevronDown size={12} className={`text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} /> */}
                    </button>
                    {/* {profileOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-2xl shadow-[var(--shadow-lg)] z-50 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3.5 border-b border-border">
                                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-semibold">
                                        <span className="w-1 h-1 rounded-full bg-primary" /> Pro Plan
                                    </span>
                                </div>
                            </div>
                            <div className="py-1">
                                {[
                                    { icon: User, label: "Profile", page: "profile" },
                                    { icon: BarChart3, label: "Analytics", page: "analytics" },
                                    { icon: CreditCard, label: "Billing", page: "settings" },
                                    { icon: HelpCircle, label: "Help & Support", page: null },
                                ].map(item => (
                                    <button
                                        key={item.label}
                                        onClick={() => { if (item.page) { navigate(item.page); } setProfileOpen(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                    >
                                        <item.icon size={14} className="text-muted-foreground" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                            <div className="border-t border-border py-1">
                                <button
                                    onClick={() => { logout(); setProfileOpen(false); }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>
        </header >
    )
}