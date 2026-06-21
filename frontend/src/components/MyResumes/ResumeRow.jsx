function ResumePreviewContent({ resume }) {
  return (
    <div
      className="bg-white text-gray-900 min-h-[900px] font-sans"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header accent bar */}
      <div className="h-1.5" style={{ backgroundColor: resume.color }} />

      <div className="p-10">
        {/* Name & title */}
        <div className="mb-6 pb-5 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Jordan Davis
          </h1>
          <p className="text-base mt-1" style={{ color: resume.color }}>
            {resume.role}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-gray-500">
            <span>jordan@example.com</span>
            <span>·</span>
            <span>San Francisco, CA</span>
            <span>·</span>
            <span>linkedin.com/in/jordandavis</span>
            <span>·</span>
            <span>github.com/jordandavis</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h2
            className="text-[11px] font-bold uppercase tracking-widest mb-2"
            style={{ color: resume.color }}
          >
            Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Results-driven Senior Software Engineer with 6+ years building
            scalable React applications and distributed systems. Delivered a 40%
            performance improvement on core product features at Acme Corp.
            Passionate about developer tooling, clean architecture, and
            exceptional user experiences.
          </p>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2
            className="text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ color: resume.color }}
          >
            Experience
          </h2>
          <div className="space-y-4">
            {[
              {
                role: "Senior Frontend Engineer",
                company: "Acme Corp",
                period: "Jan 2021 – Present",
                bullets: [
                  "Architected a micro-frontend system serving 2M+ daily active users across 12 product surfaces",
                  "Reduced JavaScript bundle size by 40% through code splitting and lazy loading strategies",
                  "Led migration from Redux to React Query, cutting data-fetching boilerplate by 60%",
                  "Mentored 4 junior engineers and conducted 30+ technical interviews",
                ],
              },
              {
                role: "Software Engineer",
                company: "TechStartup Inc",
                period: "Jun 2019 – Dec 2020",
                bullets: [
                  "Built core product features in React and Node.js, shipping 3 major releases",
                  "Implemented real-time collaboration using WebSocket and Redis Pub/Sub",
                  "Reduced API latency by 55% through strategic Redis caching layer",
                ],
              },
            ].map((exp) => (
              <div key={exp.company}>
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {exp.role}
                    </p>
                    <p className="text-xs text-gray-600">{exp.company}</p>
                  </div>
                  <span className="text-[11px] text-gray-500 flex-shrink-0 mt-0.5">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-1">
                  {exp.bullets.map((b, i) => (
                    <li key={i} className="text-xs text-gray-700 flex gap-2">
                      <span
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: resume.color }}
                      >
                        •
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h2
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: resume.color }}
          >
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              "React",
              "TypeScript",
              "Node.js",
              "GraphQL",
              "PostgreSQL",
              "Redis",
              "Docker",
              "AWS",
              "Git",
              "CI/CD",
            ].map((s) => (
              <span
                key={s}
                className="text-[11px] px-2.5 py-1 rounded-md text-gray-700 bg-gray-100 border border-gray-200"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-6">
          <h2
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: resume.color }}
          >
            Education
          </h2>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                B.S. Computer Science
              </p>
              <p className="text-xs text-gray-600">UC Berkeley</p>
            </div>
            <span className="text-[11px] text-gray-500">2019 · GPA 3.8</span>
          </div>
        </div>

        {/* Projects */}
        <div>
          <h2
            className="text-[11px] font-bold uppercase tracking-widest mb-2.5"
            style={{ color: resume.color }}
          >
            Projects
          </h2>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">
                AI Resume Builder
              </p>
              <a
                href="#"
                className="text-[11px]"
                style={{ color: resume.color }}
              >
                github.com/jordan/resume-ai
              </a>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">
              Full-stack AI app that generates ATS-optimized resumes using GPT-4
              and RAG. Built with React, Node.js, and PostgreSQL. 500+ active
              users, 4.8/5 rating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
