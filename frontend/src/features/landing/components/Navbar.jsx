import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  BookOpen,
  Sparkles,
  CheckSquare,
  Award,
} from "lucide-react";
import useNavbarScroll from "../hooks/useNavbarScroll";

function Navbar({
  onLogin,
  onSignup,
  onToggleMenu,
  mobileMenuOpen,
  onOpenFeatureModal,
}) {
  const navScrolled = useNavbarScroll();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setResourcesOpen(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setResourcesOpen(false);
  };

  const handleResourceClick = (type) => {
    setResourcesOpen(false);
    onOpenFeatureModal(type);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navScrolled
          ? "bg-white dark:bg-white-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => scrollTo("hero")}
          className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none bg-transparent border-none text-left"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-500/30">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <div className="leading-none">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              ResuPilot
            </span>
            <span className="text-sm font-bold text-indigo-600"> AI</span>
          </div>
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold select-none">
          <button
            onClick={() => scrollTo("features")}
            className="text-slate-600 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo("preview")}
            className="text-slate-600 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            Dashboard Preview
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setResourcesOpen((prev) => !prev)}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
            >
              <span>Resources</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>

            {resourcesOpen && (
              <div className="absolute left-0 mt-3.5 w-60 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl p-2.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => handleResourceClick("resume-builder")}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-none text-slate-700 dark:text-slate-300"
                >
                  <BookOpen
                    size={15}
                    className="text-indigo-650 dark:text-indigo-400"
                  />
                  <div>
                    <p className="text-[10px] font-bold">
                      Resume Creator Guide
                    </p>
                    <p className="text-[8px] text-slate-400">
                      Best practices for builder templates
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleResourceClick("ats-analysis")}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-none text-slate-700 dark:text-slate-300"
                >
                  <Sparkles
                    size={15}
                    className="text-teal-600 dark:text-teal-400"
                  />
                  <div>
                    <p className="text-[10px] font-bold">ATS Checker Tool</p>
                    <p className="text-[8px] text-slate-400">
                      How scanners evaluate formatting
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleResourceClick("interview-prep")}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-none text-slate-700 dark:text-slate-300"
                >
                  <Award size={15} className="text-amber-500" />
                  <div>
                    <p className="text-[10px] font-bold">Interview Simulator</p>
                    <p className="text-[8px] text-slate-400">
                      Mastering technical & HR loops
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => handleResourceClick("application-tracker")}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-none text-slate-700 dark:text-slate-300"
                >
                  <CheckSquare size={15} className="text-rose-500" />
                  <div>
                    <p className="text-[10px] font-bold">Kanban Search Guide</p>
                    <p className="text-[8px] text-slate-400">
                      Organize applications systematically
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => scrollTo("faq")}
            className="text-slate-600 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            FAQ
          </button>
          <button
            onClick={() => scrollTo("footer")}
            className="text-slate-600 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            About
          </button>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer mr-1 bg-transparent border-none"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            onClick={onLogin}
            className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer bg-transparent border-none"
          >
            Log In
          </button>
          <button
            onClick={onSignup}
            className="flex items-center gap-1.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.97] px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-500/25 cursor-pointer border-none"
          >
            Start Free
          </button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer bg-transparent border-none"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <button
            onClick={onToggleMenu}
            className="text-slate-700 dark:text-slate-300 p-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl bg-transparent border-none"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default React.memo(Navbar);
