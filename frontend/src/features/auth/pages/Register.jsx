import { useState } from "react";

import { AuthLayout } from "./AuthLayout";
import { SignupIllustration } from "./AuthIllustrations"
import { AuthAlert } from "./AuthComponents";
import RegisterForm from "../components/RegisterForm";
import { registerUser } from "../../../services/authService";
import { useNavigate } from "react-router";

export default function SignupPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const done = false;

    const set = (k) => (e) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        setErrors(prev => ({ ...prev, [k]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            await registerUser({ name: form.name, email: form.email, password: form.password })
            navigate("/")
        } catch (err) {
            const detail = err.response?.data?.detail;
            const errorMessage = Array.isArray(detail) ? detail[0].msg : (detail || "Registration failed.");

            setAlert({
                type: "error",
                message: errorMessage
            })

        } finally {
            setLoading(false);
        }
    };


    return (
        <AuthLayout
            illustration={<SignupIllustration />}
            leftTitle="Build a resume that gets past every ATS filter"
            leftSubtitle="Our AI analyzes your target role, identifies skill gaps, and generates a tailored resume in seconds."
        // testimonial={{
        //     quote: "Created a perfectly tailored resume for 6 different roles in one afternoon. This tool is incredible.",
        //     author: "Priya Sharma",
        //     role: "Product Manager · Hired at Notion",
        // }}
        >
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-foreground tracking-tight">Create your account</h1>
                    <p className="text-muted-foreground text-sm mt-1.5">Start for free. No credit card required.</p>
                </div>

                {alert && <AuthAlert type={alert.type} message={alert.message} />}

                <RegisterForm
                    form={form}
                    agreed={agreed}
                    setAgreed={setAgreed}
                    loading={loading}
                    errors={errors}
                    done={done}
                    set={set}
                    handleSubmit={handleSubmit} />

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                        onClick={() => navigate("/")}
                        className="text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                        Sign in
                    </button>
                </p>
            </div>
        </AuthLayout>
    );
}
