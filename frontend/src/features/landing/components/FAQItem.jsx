import React from "react";
import { ChevronDown } from "lucide-react";

function FAQItem({ q, a, question, answer, isOpen, onToggle }) {
  const displayQ = q || question;
  const displayA = a || answer;

  return (
    <div
      className={`border rounded-2xl transition-all duration-300 ${
        isOpen
          ? "border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500"
      }`}
    >
      <button
        className="w-full flex items-center justify-between px-6 py-4.5 text-left focus:outline-hidden cursor-pointer"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-bold text-slate-800 dark:text-white transition-colors">
          {displayQ}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 dark:text-slate-400 transition-transform duration-350 shrink-0 ml-4 ${
            isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
          }`}
        />
      </button>

      {/* Accordion panel with smooth transition height */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-60 opacity-100 pb-5" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {displayA}
          </p>
        </div>
      </div>
    </div>
  );
}

export default React.memo(FAQItem);
