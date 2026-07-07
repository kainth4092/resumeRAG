import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Monitor,
  Zap,
  Shield,
  Settings as SettingsIcon,
} from "lucide-react";
import AccountSettings from "../components/AccountSettings";
import SecuritySettings from "../components/SecuritySettings";
import NotificationSettings from "../components/NotificationSettings";
import AppearanceSettings from "../components/AppearanceSettings";
import IntegrationSettings from "../components/IntegrationSettings";
import PrivacySettings from "../components/PrivacySettings";

const TABS = [
  { id: "account", icon: User, label: "Account", component: AccountSettings },
  {
    id: "security",
    icon: Lock,
    label: "Security",
    component: SecuritySettings,
  },
  {
    id: "notifications",
    icon: Bell,
    label: "Notifications",
    component: NotificationSettings,
  },
  {
    id: "appearance",
    icon: Monitor,
    label: "Appearance",
    component: AppearanceSettings,
  },
  {
    id: "integrations",
    icon: Zap,
    label: "Integrations",
    component: IntegrationSettings,
  },
  {
    id: "data",
    icon: Shield,
    label: "Data & Privacy",
    component: PrivacySettings,
  },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState("account");

  const ActiveComponent =
    TABS.find((t) => t.id === activeTab)?.component || AccountSettings;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            <SettingsIcon size={22} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">
              Settings
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your personal settings, password changes, notifications,
              and subscriptions.
            </p>
          </div>
        </div>

        {/* Tabbed Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-60 bg-card border shrink-0 rounded-2xl p-2 space-y-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-md shadow-primary/15"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      isActive ? "text-white" : "text-muted-foreground"
                    }
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Tab Body */}
          <div className="flex-1 w-full animate-in fade-in duration-200">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
