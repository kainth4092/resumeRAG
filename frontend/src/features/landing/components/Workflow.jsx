import React from "react";
import { ChevronRight } from "lucide-react";
import { workflow } from "../constants/workflow";

function Workflow({ onOpenFeatureModal }) {
  return (
    <section id="workflow" className="py-20 px-4 sm:px-6 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
            Your Complete Job Search Journey
          </h2>
          <p className="text-lg text-slate-605 dark:text-slate-400">
            Follow a structured workflow from resume creation to receiving your
            next offer. Click any stage to preview how it works.
          </p>
        </div>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px bg-indigo-100 dark:bg-indigo-950/40 hidden sm:block" />
          <div className="space-y-8">
            {workflow.map((step, i) => (
              <div
                key={step.step}
                onClick={() => onOpenFeatureModal(step.featureType)}
                className="flex items-start gap-6 group cursor-pointer p-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-all duration-300"
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform z-10 relative">
                    <step.icon size={24} className="text-white" />
                  </div>
                  <span className="absolute -top-5 -right-1 w-5 h-5 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 mb-1 transition-colors">
                    {step.label}
                  </h3>
                  <p className="text-sm text-slate-655 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < workflow.length - 1 && (
                  <ChevronRight
                    size={16}
                    className="text-slate-400 dark:text-slate-600 mt-6 shrink-0 hidden lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Workflow);
