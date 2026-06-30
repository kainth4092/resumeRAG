import Professional from "./Professional";
import ATS from "./ATS";
import Minimal from "./Minimal";
import Corporate from "./Corporate";

export const TEMPLATE_REGISTRY = {
  Professional: {
    name: "Professional",
    component: Professional,
    description: "Classic elegant layout with subtle top border accents. Perfect for general purposes.",
    recommended: "Software Engineers, Analysts, General Roles",
    atsBadge: true,
    thumbnailColor: "from-purple-500 to-indigo-500",
  },
  ATS: {
    name: "ATS",
    component: ATS,
    description: "Ultra-clean single column layout with maximum parser compatibility and standard formatting.",
    recommended: "Strict online portal applications, standard corporate roles",
    atsBadge: true,
    thumbnailColor: "from-gray-700 to-slate-800",
  },
  Minimal: {
    name: "Minimal",
    component: Minimal,
    description: "Clean typography, light gray tones, and elegant spacing to emphasize summary and achievements.",
    recommended: "Academics, Researchers, Senior Directors",
    atsBadge: true,
    thumbnailColor: "from-gray-300 to-gray-500",
  },
  Corporate: {
    name: "Corporate",
    component: Corporate,
    description: "Left-aligned layout with bold headings and structured side bars for key qualifications.",
    recommended: "Consultants, Managers, Business Analysts",
    atsBadge: true,
    thumbnailColor: "from-emerald-600 to-green-700",
  },

};

export { default as ResumeSkillRenderer, getTechnicalSkills } from "./ResumeSkillRenderer";

