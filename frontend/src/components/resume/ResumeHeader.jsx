export default function ResumeHeader({ resume }) {

    const info = resume.personal_info;

    return (
        <div className="border-b pb-5">
            <h1 className="text-3xl font-bold">
                {info.name}
            </h1>
            <p className="text-lg text-gray-600 mt-1">
                {resume.headline}
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-3">
                {info.email && <span>{info.email}</span>}
                {info.phone && <span>{info.phone}</span>}
                {info.location && <span>{info.location}</span>}
                {info.linkedin && <span>{info.linkedin}</span>}
                {info.github && <span>{info.github}</span>}
            </div>
        </div>
    );
}