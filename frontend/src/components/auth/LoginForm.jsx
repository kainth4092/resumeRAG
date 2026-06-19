import { Mail } from "lucide-react";
import { AuthButton, AuthInput, PasswordInput } from "../../pages/auth/AuthComponents";

export default function LoginForm({ email, setEmail, password, setPassword, errors, setErrors, success, handleSubmit, loading }) {

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: "" })); }}
                error={errors.email}
                autoComplete="email"
                icon={<Mail size={16} />}
            />

            <PasswordInput
                label="Password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: "" })); }}
                error={errors.password}
                autoComplete="current-password"
                placeholder="Enter your password"
            />



            <AuthButton type="submit" loading={loading} disabled={success}>
                {success ? "Signing in…" : "Sign In"}
            </AuthButton>
        </form>
    );
}