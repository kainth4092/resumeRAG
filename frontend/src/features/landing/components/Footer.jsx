import React from "react";
import { Zap } from "lucide-react";
import { footerLinks } from "../constants/navigation";

function Footer() {
  return (
    <footer id="footer" className="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10 text-slate-400">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Zap size={14} className="text-white fill-white" />
              </div>
              <span className="text-sm font-bold text-white">ResuPilot AI</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Your AI Career Copilot helping professionals build better resumes, prepare smarter interviews and manage successful careers.
            </p>
            <div className="flex gap-2">
              {["TW", "LI", "GH"].map((s) => (
                <div
                  key={s}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
          {footerLinks.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold text-white uppercase tracking-widest mb-4">
                {col.title}
              </p>
              <div className="space-y-2.5">
                {col.links.map((link) => (
                  <button
                    key={link}
                    className="block text-sm text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {link}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © 2026 ResuPilot AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(Footer);
