import React, { useState } from "react";
import FAQItem from "./FAQItem";
import { faqs } from "../constants/faq";

function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleToggle = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/60 transition-colors">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Everything you need to know about ResuPilot AI.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <FAQItem
              key={i}
              q={f.q}
              a={f.a}
              isOpen={activeIndex === i}
              onToggle={() => handleToggle(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(FAQ);
