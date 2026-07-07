import { useState } from "react";
import { Globe, GitBranch, Briefcase } from "lucide-react";
import { useAuth } from "../../auth/context/AuthContext";

export default function IntegrationSettings() {
  const { user } = useAuth();
  const [connections, setConnections] = useState({
    google: user?.provider === "google",
    github: false,
    linkedin: false,
  });

  const handleToggle = (provider) => {
    setConnections((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const Row = ({ label, desc, providerKey, icon: Icon, colorClass }) => {
    const isConnected = connections[providerKey];
    return (
      <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl bg-card border border-border ${colorClass}`}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </div>
        </div>
        <button
          onClick={() => handleToggle(providerKey)}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
            isConnected
              ? "bg-muted text-foreground border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20"
              : "bg-primary text-white border-primary hover:bg-primary/95"
          }`}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div>
        <h3 className="text-foreground font-bold text-sm">Linked Accounts</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Connect your social profiles to enable fast sign-in and import profile
          details.
        </p>
      </div>

      <div className="space-y-3">
        <Row
          label="Google Account"
          desc="Log in and import your email address and profile picture."
          providerKey="google"
          icon={Globe}
          colorClass="text-emerald-500 dark:text-emerald-400"
        />
        <Row
          label="GitHub Profile"
          desc="Sync repositories, projects, and contributions directly into your portfolio."
          providerKey="github"
          icon={GitBranch}
          colorClass="text-foreground"
        />
        <Row
          label="LinkedIn Profile"
          desc="Export work history, educational achievements, and endorsements."
          providerKey="linkedin"
          icon={Briefcase}
          colorClass="text-blue-500"
        />
      </div>
    </div>
  );
}
