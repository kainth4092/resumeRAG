import ResumeHeader from "./ResumeHeader";
import ResumeSummary from "./ResumeSummary";
import ResumeSkills from "./ResumeSkills";
import ResumeExperience from "./ResumeExperience";
import ResumeProjects from "./ResumeProjects";
import ResumeEducation from "./ResumeEducation";

export default function ResumeTemplate({ resume }) {
    if (!resume) return null;

    return (
        <div className="bg-white text-black p-10 max-w-4xl mx-auto printable-resume">
            <ResumeHeader resume={resume} />
            {resume.summary && (
                <ResumeSummary summary={resume.summary} />
            )}
            {resume.skills?.length > 0 && (
                <ResumeSkills skills={resume.skills} />
            )}
            {resume.experience?.length > 0 && (
                <ResumeExperience experience={resume.experience} />
            )}
            {resume.projects?.length > 0 && (
                <ResumeProjects projects={resume.projects} />
            )}
            {resume.education?.length > 0 && (
                <ResumeEducation education={resume.education} />
            )}
        </div>
    );
}