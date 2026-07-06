import React from "react";
import { Layers } from "lucide-react";
import FeatureCard from "./FeatureCard";
import { features } from "../constants/features";

function Features({ onOpenFeatureModal }) {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/60 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-full px-4 py-1.5 mb-5">
            <Layers size={13} className="text-indigo-650 dark:text-indigo-400" />
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
              Features
            </span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight whitespace-pre-line">
            Everything Your Career Needs.{"\n"}
            <span className="bg-linear-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
              One Intelligent Platform.
            </span>
          </h2>
          <p className="text-lg text-slate-655 dark:text-slate-400 max-w-2xl mx-auto whitespace-pre-line">
            Stop switching between multiple websites.{"\n\n"}
            ResuPilot AI combines resume creation, ATS analysis, interview
            preparation, job discovery and application tracking into one
            intelligent workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              {...f}
              onOpen={() => onOpenFeatureModal(f.featureType)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default React.memo(Features);
