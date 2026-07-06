import React from "react";
import { Zap, ArrowRight } from "lucide-react";

function CTA({ onSignup, onLogin }) {
  return (
    <section
      id="cta"
      className="py-20 px-4 sm:px-6 bg-linear-to-br from-indigo-600 via-indigo-700 to-teal-600"
    >
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 rounded-3xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-6">
          <Zap size={28} className="text-white fill-white" />
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Your Next Opportunity Starts Here.
        </h2>
        <p className="text-indigo-200 text-lg mb-8 max-w-xl mx-auto">
          Everything you need to prepare, apply and succeed—all powered by AI.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onSignup}
            className="flex items-center gap-2 text-base font-bold text-indigo-700 bg-white hover:bg-indigo-50 active:scale-[0.97] px-8 py-4 rounded-2xl transition-all shadow-xl cursor-pointer"
          >
            Create Account <ArrowRight size={16} />
          </button>
          <button
            onClick={onLogin}
            className="text-base font-semibold text-white/80 hover:text-white border border-white/30 hover:border-white/50 px-8 py-4 rounded-2xl transition-all cursor-pointer"
          >
            Log In
          </button>
        </div>
      </div>
    </section>
  );
}

export default React.memo(CTA);
