export default function SelectCard({
  icon: Icon,
  label,
  desc,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-4 p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
        selected
          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-600/10"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-900/50"
      }`}
    >
      {Icon && (
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            selected
              ? "bg-indigo-600 text-white"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          }`}
        >
          <Icon size={20} />
        </div>
      )}
      <div className="space-y-1">
        <h4
          className={`text-md font-bold transition-colors ${selected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 dark:text-slate-200"}`}
        >
          {label}
        </h4>
        {desc && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {desc}
          </p>
        )}
      </div>
    </button>
  );
}
