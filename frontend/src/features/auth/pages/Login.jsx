import { useState } from "react";

import { useNavigate } from "react-router";
import { AuthLayout } from "./AuthLayout";
import { LoginIllustration } from "./AuthIllustrations";
import { loginUser } from "../services/authService";
import LoginForm from "../components/LoginForm";
import { AuthAlert } from "./AuthComponents";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await loginUser({ email, password });
      localStorage.setItem("access_token", res.data.access_token);
      await fetchUser();
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail)
        ? detail[0].msg
        : detail || "Invalid credentials.";

      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      illustration={<LoginIllustration />}
      leftTitle="Land interviews 3× faster with AI-optimized resumes"
      leftSubtitle="ResumeRAG analyzes job descriptions and tailors your resume to maximize ATS scores and recruiter attention."
    // testimonial={{
    //     quote: "My ATS score went from 61 to 94 in one session. Got a call from Stripe the next week.",
    //     author: "Alex Chen",
    //     role: "Software Engineer · Hired at Stripe",
    // }}
    >
      <div className="space-y-7">
        <div>
          <h1 className="justify-center text-2xl font-semibold text-foreground tracking-tight">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Sign in to your ResumeRAG account
          </p>
        </div>

        {alert && <AuthAlert type={alert.type} message={alert.message} />}

        <LoginForm
          email={email}
          setEmail={setEmail}
          loding={loading}
          password={password}
          setPassword={setPassword}
          errors={errors}
          setErrors={setErrors}
          handleSubmit={handleSubmit}
        />

        {/* <AuthDivider /> */}

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Create account
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}
