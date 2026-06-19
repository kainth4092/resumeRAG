export default function ResumeProjects({ projects }) {
    return (
        <section>
            <h2 className="text-lg font-bold border-b pb-1 mb-4">
                Projects
            </h2>
            <div className="space-y-5">
                {projects.map((project, index) => (
                    <div key={index}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-base">
                                {project.title}
                            </h3>
                            <div className="flex gap-4 text-xs">
                                {project.github && (
                                    <span>
                                        GitHub: {project.github}
                                    </span>
                                )}
                                {project.live && (
                                    <span>
                                        Live: {project.live}
                                    </span>
                                )}
                            </div>
                        </div>
                        {project.technologies?.length > 0 && (

                            <p className="text-sm text-gray-600 mt-1">
                                <strong>Tech Stack:</strong>{" "}
                                {project.technologies.join(", ")}
                            </p>
                        )}
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm leading-6">
                            {project.description?.map((item, i) => (
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