import React, { useEffect } from "react";
import { navLinks } from "../constants/navigation";

function MobileMenu({ onLogin, onSignup, onClose, open }) {
  // Listen for Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Menu Box */}
      <div
        className="md:hidden fixed top-16 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-5 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-5 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          {navLinks.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.id)}
              className="block w-full text-left text-sm font-bold text-slate-600 dark:text-slate-300 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onLogin();
              onClose();
            }}
            className="w-full text-sm font-semibold text-slate-700 dark:text-slate-300 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
          >
            Log In
          </button>
          <button
            onClick={() => {
              onSignup();
              onClose();
            }}
            className="w-full text-sm font-bold text-white bg-indigo-600 py-2.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Start Free
          </button>
        </div>
      </div>
    </>
  );
}

export default React.memo(MobileMenu);
