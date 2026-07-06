import { ArrowLeft, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: July 6, 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. Information We Collect
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We collect information that you directly provide to us when
              registering, customizing your profile, or compiling resumes. This
              includes registration data (such as name and email address) and
              professional info (such as target roles, career preferences, and
              skills).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Authentication Data
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To verify and protect your identity, we process authentication
              details, including hashed passwords. If you authenticate through a
              third-party single sign-on provider (such as Google), we receive
              and store profile attributes permitted by that service, including
              your name, email, and profile avatar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Uploaded Resume Data
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When you upload resumes (PDF, DOCX, or text files) to the Service,
              our system parses, segments, and indexes the content to provide
              skill analyses and tailored recommendations. This data is securely
              stored on our servers and processed by secure AI inference
              endpoints to assist your career journey.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Cookies & Local Storage
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We use standard cookies and local storage tokens (such as JWTs) to
              maintain your active login session and remember client
              preferences. You can disable cookies through your web browser
              settings; however, certain interactive components of the Service
              may not function correctly without authentication cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Analytics</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We collect generic browser metrics and system event logs (such as
              page views, action latencies, and conversion rates) to evaluate
              application performance and improve our user interface. These logs
              do not contain raw credentials or sensitive resume content.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              6. Data Storage & Security
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your data is stored securely in industry-standard relational
              databases and indexed search clusters. We apply cryptographic
              protections (such as salt-hashed passwords and TLS transmission
              encryption) to prevent unauthorized access. However, no electronic
              storage or transmission system can guarantee absolute safety.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              7. Third-Party Services & AI Providers
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To analyze job fit and customize resumes, we transfer structured
              resume fragments to compliant AI model API endpoints (such as
              OpenRouter or Ollama). These partners are bound by confidentiality
              clauses and are prohibited from storing or training models on your
              personal inputs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              8. User Rights
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Depending on your location, you may have specific data rights,
              including the right to view, download, update, or permanently
              delete your account data. You can perform these requests directly
              in the Account Profile section or by contacting our legal desk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              9. Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have queries regarding this privacy notice or wish to
              exercise your data rights, please reach out to us at:
              <br />
              <span className="font-semibold text-foreground">
                privacy@resupilot.ai
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
