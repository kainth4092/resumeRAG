import { ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background text-foreground transition-colors duration-200 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-md font-bold text-foreground tracking-tight">
              ResuPilot <span className="text-indigo-600">AI</span>
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              Terms & Conditions of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: October 29, 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              By creating an account, connecting via Google Authentication, or utilizing the ResuPilot AI workspace ("Service"), you agree to be bound by these Terms & Conditions. If you do not agree to these terms, do not access or use the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. User Accounts & Security
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You must register with a valid email address and maintain the confidentiality of your account credentials. You are responsible for all activities that occur under your account. To protect your workspace, we enforce rate limiting, session token versioning, and email verification for local registrations. Password modifications and account-wide logout actions immediately invalidate all active JWT tokens across connected devices.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Data Ownership & Content Rights
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You retain 100% intellectual property ownership of your resumes, profile details, and career materials. You grant ResuPilot AI only the limited, non-exclusive license necessary to store, parse, index, and process your materials through our platform and designated AI providers (OpenRouter, Groq, OpenAI) to deliver services to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. AI-Generated Output & Candidate Responsibility
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ResuPilot AI provides automated resume tailoring, ATS compatibility scoring, career roadmaps, and mock interview assessments. AI outputs are generated using probabilistic language models. While our models strive for high accuracy, you are solely responsible for reviewing and validating all resume facts, qualifications, and claims prior to submitting them to prospective employers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              5. Account Deletion & Data Rights
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You may terminate your account at any time through Settings. Deletion is instantaneous and permanent: all uploaded resume files on disk, relational database records, and vector search embeddings in Qdrant are expunged. You may also download a complete JSON archive of your account data prior to deletion via our automated export facility.
            </p>
          </section>

          {/* <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              6. Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              For questions regarding these Terms, please reach out to our legal team at:
              <br />
              <span className="font-semibold text-foreground">
                legal@resupilot.ai
              </span>
            </p>
          </section> */}
        </div>
      </div>
    </div>
  );
}
