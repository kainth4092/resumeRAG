export default function ResumeExperience({ experience }) {
    return (
        <section>
            <h2 className="text-lg font-bold border-b pb-1 mb-4">
                Professional Experience
            </h2>
            <div className="space-y-5">
                {experience.map((exp, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-base">
                                    {exp.role}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {exp.company}
                                </p>
                            </div>
                            <span className="text-sm text-gray-500">
                                {exp.duration}
                            </span>
                        </div>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm leading-6">
                            {exp.description?.map((item, i) => (
                                <li key={i}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}