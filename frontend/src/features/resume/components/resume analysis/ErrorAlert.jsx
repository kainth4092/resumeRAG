import { AlertCircle, X } from "lucide-react";

export default function ErrorAlert({ error, setError }) {
  return (
    <>
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </span>
          <button
            onClick={() => setError("")}
            className="text-red-500 hover:opacity-80 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
