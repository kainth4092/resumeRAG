import { useState } from "react";
import { useNavigate } from "react-router-dom";

import ScrollProgress from "../components/ScrollProgress";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Workflow from "../components/Workflow";
import FAQ from "../components/FAQ";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

import ATSPreview from "../components/ATSPreview";
import InterviewPreview from "../components/InterviewPreview";
import JobTrackerPreview from "../components/JobTrackerPreview";
import AIAssistantPreview from "../components/AIAssistantPreview";

import AuthPromptModal from "../components/AuthPromptModal";
import FeatureDetailsModal from "../components/FeatureDetailsModal";

export default function LandingPage({ onLogin, onSignup }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [featureType, setFeatureType] = useState("");

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTitle, setAuthModalTitle] = useState("");
  const [authModalText, setAuthModalText] = useState("");

  const handleLogin = onLogin || (() => navigate("/login"));
  const handleSignup = onSignup || (() => navigate("/register"));

  // Callbacks
  const handleOpenFeatureModal = (type) => {
    setFeatureType(type);
    setFeatureModalOpen(true);
  };

  const handleTriggerAuthModal = (title, text) => {
    setAuthModalTitle(title);
    setAuthModalText(text);
    setAuthModalOpen(true);
  };

  return (
    <div
      className="h-screen w-full bg-white dark:bg-slate-950 overflow-x-hidden overflow-y-auto relative transition-colors duration-300"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <ScrollProgress />

      <Navbar
        onLogin={handleLogin}
        onSignup={handleSignup}
        onToggleMenu={() => setMobileMenuOpen((o) => !o)}
        mobileMenuOpen={mobileMenuOpen}
        onOpenFeatureModal={handleOpenFeatureModal}
      />

      <MobileMenu
        onLogin={handleLogin}
        onSignup={handleSignup}
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
      />

      <Hero onSignup={handleSignup} onTriggerAuth={handleTriggerAuthModal} />

      <section
        id="preview"
        className="py-20 px-4 sm:px-6 bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-full px-4 py-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                Platform Preview
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight whitespace-pre-line">
              Everything You Need.{"\n"}One Intelligent Platform.
            </h2>
            <p className="text-lg text-slate-655 dark:text-slate-400 max-w-2xl mx-auto">
              Explore how ResuPilot AI helps you create resumes, prepare
              interviews, discover opportunities and manage your complete job
              search from one AI-powered workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ATSPreview onTriggerAuth={handleTriggerAuthModal} />
            <InterviewPreview onTriggerAuth={handleTriggerAuthModal} />
            <JobTrackerPreview onTriggerAuth={handleTriggerAuthModal} />
            <AIAssistantPreview onTriggerAuth={handleTriggerAuthModal} />
          </div>
        </div>
      </section>

      <Features onOpenFeatureModal={handleOpenFeatureModal} />

      <Workflow onOpenFeatureModal={handleOpenFeatureModal} />

      <FAQ />

      <CTA onSignup={handleSignup} onLogin={handleLogin} />

      <Footer />

      {/* Feature Walkthrough Modals */}
      <FeatureDetailsModal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        featureType={featureType}
        onTriggerAuth={handleTriggerAuthModal}
      />

      {/* Auth Prompt Gate Modal */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalTitle}
        actionText={authModalText}
      />
    </div>
  );
}
