export default function ResumeSkills({ skills }) {
    return (
        <section>
            <h2 className="text-lg font-bold border-b pb-1 mb-3">
                Skills
            </h2>
            <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className="px-3 py-1 border rounded text-sm"
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </section>
    );
}