import { useState } from "react";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileCard from "../../components/profile/ProfileCard";
import SkillSection from "../../components/profile/SkillsSection";
import ExperienceSection from "../../components/profile/ExperienceSection";
import EducationSection from "../../components/profile/EducationSection";
import ProjectSection from "../../components/profile/ProjectsSection";
import CertificationSection from "../../components/profile/CertificationSection";



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
