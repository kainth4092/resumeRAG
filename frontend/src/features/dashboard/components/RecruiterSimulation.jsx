import { memo } from "react";
import { Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecruiterSimulation = memo(({ noResumes }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-linear-to-br from-primary/8 via-primary/5 to-transparent border border-primary/15 rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles size={12} className="text-primary" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              AI Feature
            </span>
          </div>
          <h3 className="text-foreground">Recruiter Eye Simulation</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {noResumes
              ? "Generate a resume to unlock recruiter insights."
              : "See your resume the way a recruiter sees it. AI simulates the 6-second scan and highlights what gets noticed — and what gets ignored."}
          </p>
        </div>
        <button
          onClick={() => navigate("/analysis")}
          disabled={noResumes}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all text-sm font-semibold shadow-sm shadow-primary/25 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Users size={14} /> Run Simulation
        </button>
      </div>
    </div>
  );
});

export default RecruiterSimulation;
