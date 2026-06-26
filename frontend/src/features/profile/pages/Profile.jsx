import { useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import ProfileCard from "../components/ProfileCard";
import SkillSection from "../components/SkillsSection";
import ExperienceSection from "../components/ExperienceSection";
import EducationSection from "../components/EducationSection";
import ProjectSection from "../components/ProjectsSection";
import CertificationSection from "../components/CertificationSection";



export function Profile() {
    const [profileSaved, setProfileSaved] = useState(false);

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-5">

                <ProfileHeader profileSaved={profileSaved} />

                <ProfileCard setProfileSaved={setProfileSaved} />

                <SkillSection />

                <ExperienceSection />

                <EducationSection />

                <ProjectSection />

                <CertificationSection />

            </div>

        </div>
    );
}
