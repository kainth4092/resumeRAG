export default function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
        selected
          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {label}
    </button>
  );
}
