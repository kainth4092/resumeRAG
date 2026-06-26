import { Award } from "lucide-react";
import Section from "./common/Section";

export default function CertificationSection() {
    return (
        <Section title="Certifications & Awards" icon={Award} onAdd={() => { }} addLabel="Add">
            <div className="py-8 text-center">
                <Award size={24} className="mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No certifications or awards added yet.</p>
            </div>
        </Section>
    )
}