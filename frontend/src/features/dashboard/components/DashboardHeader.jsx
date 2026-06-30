import { RefreshCw, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../context/AuthContext";

export default function DashboardHeader({ onRefresh, refreshing, greeting }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-foreground">
          {greeting || `${getGreeting()}${user?.name ? `, ${user.name}` : ""}`} 👋
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Here's how your job search is performing.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
        <button
          onClick={() => navigate("/resumes?view=new")}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/25 text-sm font-semibold"
        >
          <Zap size={15} /> Generate Resume
        </button>
      </div>
    </div>
  );
}
