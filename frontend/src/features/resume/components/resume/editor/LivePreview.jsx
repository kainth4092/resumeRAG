import ResumeTemplate from "../ResumeTemplate";

export default function LivePreview({
  personal = {},
  summary = {},
  skills = [],
  experience = [],
  education = [],
  projects = [],
  color = "#4F46E5",
  templateName = "Professional",
}) {
  const resume = {
    personal_info: personal,
    headline: personal.title,
    summary: summary.text,
    skills: skills,
    experience: experience,
    education: education,
    projects: projects,
    color: color,
  };

  return <ResumeTemplate resume={resume} templateName={templateName} />;
}
