import { Mail } from "lucide-react";
import {
  AuthButton,
  AuthInput,
  PasswordInput,
  AuthCheckbox,
  AuthDivider,
  GoogleButton,
} from "../pages/AuthComponents";

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  setErrors,
  remember,
  setRemember,
  onForgotPasswordClick,
  handleSubmit,
  loading,
  success,
  onGoogleClick,
  googleLoading,
}) {
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: "" }));
          }}
          error={errors.email}
          success={
            !errors.email && !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          }
          autoComplete="email"
          icon={<Mail size={16} />}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: "" }));
          }}
          error={errors.password}
          autoComplete="current-password"
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-between">
          <AuthCheckbox
            id="remember"
            label="Remember me for 30 days"
            checked={remember}
            onChange={setRemember}
          />
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer"
          >
            Forgot password?
          </button>
        </div>

        <AuthButton type="submit" loading={loading} disabled={success}>
          {success ? "Signing in…" : "Sign In"}
        </AuthButton>
      </form>

      <AuthDivider />

      <GoogleButton onClick={onGoogleClick} loading={googleLoading} />
    </div>
  );
}
