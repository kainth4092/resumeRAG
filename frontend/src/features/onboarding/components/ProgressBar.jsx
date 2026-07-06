export default function ProgressBar({ step, totalSteps }) {
  return (
    <div className="flex items-center gap-1.5 w-full max-w-md mx-auto">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
            i < step
              ? "bg-indigo-600 dark:bg-indigo-500"
              : i === step - 1
                ? "bg-indigo-300 dark:bg-indigo-800"
                : "bg-slate-200 dark:bg-slate-800"
          }`}
        />
      ))}
    </div>
  );
}
