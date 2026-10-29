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
              Privacy Policy & Data Rights
            </h1>
            <p className="text-sm text-muted-foreground">
              Last Updated: October 29, 2026
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              1. Information We Store
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              ResuPilot AI collects and stores only the data strictly necessary to provide intelligent resume generation, interview prep, and career management tools:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1.5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account & Identity:</strong> Email address, full name, cryptographically hashed passwords (via bcrypt/argon2), verification status, and token version numbers for session security.
              </li>
              <li>
                <strong className="text-foreground">Uploaded Resumes & Files:</strong> Original document files (PDF/DOCX) saved in isolated user directories on our host filesystem, extracted raw text, and standardized ResumeDoc v1 JSON models.
              </li>
              <li>
                <strong className="text-foreground">Career Profiles & Matches:</strong> User-curated experiences, skills, education, job context models, match scores, and customized roadmap tasks.
              </li>
              <li>
                <strong className="text-foreground">Interview Transcripts & Sessions:</strong> Mock interview responses, practice question histories, and grading assessments.
              </li>
              <li>
                <strong className="text-foreground">Vector Search Embeddings:</strong> High-dimensional vector representations stored in our private Qdrant vector database to enable semantic job matching and interview question retrieval.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              2. Third-Party AI Inference & Model Training Policy
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              To analyze job descriptions, perform ATS scoring, draft tailored resumes, and generate technical interview challenges, we transmit text prompts to select upstream AI inference providers:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1.5 text-muted-foreground">
              <li>
                <strong className="text-foreground">OpenRouter:</strong> Enterprise gateway routing stateless inference requests to top-tier reasoning models (such as Claude and Llama).
              </li>
              <li>
                <strong className="text-foreground">Groq:</strong> Ultra-fast inference engine used for parsing, classification, and scoring tasks.
              </li>
              <li>
                <strong className="text-foreground">OpenAI & Local Ollama:</strong> Configurable inference engines utilized under strict zero-retention developer agreements.
              </li>
            </ul>
            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium">
              <strong>Strict Zero-Retention Commitment:</strong> Your candidate submissions, personal details, and resume text are sent strictly for real-time stateless inference. None of your data is ever retained, indexed, or used by ResuPilot or third-party AI providers to train foundational or public models.
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              3. Authentication & Session Security
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We employ short-lived access tokens combined with secure, httpOnly, SameSite refresh cookies to protect against token exfiltration and XSS attacks. For Google authentication, we utilize the official Google ID-token credential flow, verifying token authenticity, audience (<code className="text-xs bg-muted px-1 py-0.5 rounded">aud</code>), issuer, expiration, and email verification status directly with Google Identity Services. Access tokens include an active session version (<code className="text-xs bg-muted px-1 py-0.5 rounded">token_version</code>), enabling immediate revocation across all devices whenever you change your password or log out.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              4. Data Rights: Full Export & Permanent Deletion
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              In accordance with GDPR (Articles 17 & 20) and CCPA, you retain 100% ownership over your data and can exercise your rights at any time directly through your dashboard:
            </p>
            <ul className="list-disc pl-5 text-sm space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Right to Data Portability (JSON Export):</strong> You can export every resume, career profile entry, interview history, and account attribute at any time via <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">GET /api/account/export</span> in your Privacy Settings.
              </li>
              <li>
                <strong className="text-foreground">Right to Erasure (Permanent Account Deletion):</strong> When you initiate account deletion via <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">DELETE /api/account</span>, the platform permanently purges your user record from the database, deletes all uploaded resume files from our storage disks, and immediately wipes all vector payloads from Qdrant.
              </li>
            </ul>
          </section>

          {/* <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">
              5. Contact Information
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If you have any questions about this Privacy Policy, your data rights, or our security protocols, please contact our Data Protection Officer at:
              <br />
              <span className="font-semibold text-foreground">
                privacy@resupilot.ai
              </span>
            </p>
          </section> */}
        </div>
      </div>
    </div>
  );
}
