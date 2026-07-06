import {
  AuthButton,
  AuthInput,
  PasswordInput,
  PasswordStrengthMeter,
  AuthCheckbox,
  AuthDivider,
  GoogleButton,
} from "../pages/AuthComponents";
import { Mail, User } from "lucide-react";

export default function RegisterForm({
  form,
  set,
  errors,
  loading,
  done,
  agreed,
  setAgreed,
  handleSubmit,
  onGoogleClick,
  googleLoading,
}) {
  return (
    <div className="space-y-6">
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
          success={
            !errors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
          }
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
          success={
            !errors.confirm && !!form.confirm && form.confirm === form.password
          }
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        <AuthCheckbox
          id="terms"
          label={
            <span>
              I agree to the{" "}
              <a
                href="/terms"
                target=""
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target=""
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Privacy Policy
              </a>
            </span>
          }
          checked={agreed}
          onChange={setAgreed}
          error={errors.terms}
        />

        <AuthButton type="submit" loading={loading} disabled={done}>
          {done ? "Account created!" : "Create Account"}
        </AuthButton>
      </form>

      <AuthDivider />

      <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
    </div>
  );
}
