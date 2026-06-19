export default function ResumeEducation({ education }) {
    return (
        <section>
            <h2 className="text-lg font-bold border-b pb-1 mb-4">
                Education
            </h2>
            <div className="space-y-4">
                {education.map((edu, index) => (
                    <div
                        key={index}
                        className="flex justify-between items-start"
                    >
                        <div>
                            <h3 className="font-semibold text-base">
                                {edu.degree}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {edu.institution}
                            </p>
                        </div>
                        <span className="text-sm text-gray-500">
                            {edu.start_year} - {edu.end_year}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}