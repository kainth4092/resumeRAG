import { AuthButton, AuthInput, PasswordInput, PasswordStrengthMeter } from "../../pages/auth/AuthComponents";
import { Mail, User } from "lucide-react";

export default function RegisterForm({ form, set, errors, loading, done, handleSubmit }) {

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
                label="Full name"
                type="text"
                placeholder="Jordan Davis"
                value={form.name}
                onChange={set("name")}
                error={errors.name}
                success={!errors.name && form.name.length > 1}
                autoComplete="name"
                icon={<User size={16} />}
            />

            <AuthInput
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                autoComplete="email"
                icon={<Mail size={16} />}
            />

            <div>
                <PasswordInput
                    label="Password"
                    value={form.password}
                    onChange={set("password")}
                    error={errors.password}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                />
                <PasswordStrengthMeter password={form.password} />
            </div>

            <PasswordInput
                label="Confirm password"
                value={form.confirm}
                onChange={set("confirm")}
                error={errors.confirm}
                success={!errors.confirm && !!form.confirm && form.confirm === form.password}
                autoComplete="new-password"
                placeholder="Repeat your password"
            />

            {/* <AuthCheckbox
                id="terms"
                label={
                    <span>
                        I agree to the{" "}
                        <button type="button" className="text-primary hover:underline font-medium">Terms of Service</button>
                        {" "}and{" "}
                        <button type="button" className="text-primary hover:underline font-medium">Privacy Policy</button>
                    </span>
                }
                checked={agreed}
                onChange={setAgreed}
                error={errors.terms}
            /> */}

            <AuthButton type="submit" loading={loading} disabled={done}>
                {done ? "Account created!" : "Create Account"}
            </AuthButton>
        </form>
    )

}