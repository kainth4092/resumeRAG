import { Target } from "lucide-react";

export default function RoadmapHeader({ onUpdateClick }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Career Roadmap</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-xl">
            AI-powered skill gap analysis and personalized 90-day plan for your
            target roles.
          </p>
        </div>
      </div>

      <button
        onClick={onUpdateClick}
        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/95 shadow-sm active:scale-98 transition-all"
      >
        <Target size={15} />
        Update Target Role
      </button>
    </div>
  );
}
