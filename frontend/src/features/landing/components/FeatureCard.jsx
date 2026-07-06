import { ArrowRight } from "lucide-react";

export default function FeatureCard({ icon: Icon, color, bg, title, desc, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-indigo-200 dark:hover:border-indigo-850 cursor-pointer"
    >
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: bg }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-base">{title}</h3>
      <p className="text-sm text-slate-655 dark:text-slate-400 leading-relaxed mb-4">{desc}</p>
      <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
        Learn more <ArrowRight size={12} />
      </span>
    </div>
  );
}
