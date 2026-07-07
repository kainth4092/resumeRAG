import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

import WelcomeScreen from "./WelcomeScreen";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import ForgotScreen from "./ForgotScreen";

import { useAuth } from "../../context/AuthContext";
import {
  loginUser,
  registerUser,
  googleLoginUser,
} from "../../services/authService";
import api from "../../../../services/api";

export function AuthFlow({ initialScreen = "welcome" }) {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  const [screen, setScreen] = useState(initialScreen);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleLogin = async ({ email, password, remember }) => {
    try {
      api.clearCache();
      const res = await loginUser({ email, password, remember_me: remember });
      localStorage.setItem("access_token", res.data.access_token);
      if (remember) {
        localStorage.setItem("remember_me", "true");
        const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem("token_expiry", expiryTime.toString());
      } else {
        localStorage.setItem("remember_me", "false");
        localStorage.removeItem("token_expiry");
        sessionStorage.setItem("session_active", "true");
      }

      await fetchUser(true);
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
      throw err;
    }
  };

  const handleRegister = async ({ name, email, password }) => {
    try {
      await registerUser({ name, email, password });
      setAlert({
        type: "success",
        message:
          "Account created successfully! Please sign in with your credentials.",
      });
      setScreen("login");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const errorMessage = Array.isArray(detail)
        ? detail[0].msg
        : detail || "Registration failed.";
      setAlert({
        type: "error",
        message: errorMessage,
      });
      throw err;
    }
  };

  const handleGoogleLoginTrigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setAlert(null);
        api.clearCache();

        const res = await googleLoginUser({
          credential: tokenResponse.access_token,
        });
        localStorage.setItem("access_token", res.data.access_token);

        localStorage.setItem("remember_me", "false");
        localStorage.removeItem("token_expiry");
        sessionStorage.setItem("session_active", "true");

        await fetchUser(true);
        navigate("/dashboard");
      } catch (err) {
        console.error("Google authentication failed", err);
        const detail = err.response?.data?.detail;
        const errorMessage = Array.isArray(detail)
          ? detail[0].msg
          : detail || "Google authentication failed. Please try again.";
        setAlert({
          type: "error",
          message: errorMessage,
        });
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google authentication error", error);
      setGoogleLoading(false);
    },
    onNonOAuthError: (error) => {
      console.error("Google authentication non-oauth error", error);
      setGoogleLoading(false);

      if (error && error.type === "popup_closed") {
        return;
      }

      let errorMessage = "Google authentication failed. Please try again.";
      if (error && error.type === "popup_blocked") {
        errorMessage =
          "Google login popup was blocked by your browser. Please allow popups.";
      }

      setAlert({
        type: "error",
        message: errorMessage,
      });
    },
  });

  const handleGoogle = () => {
    setGoogleLoading(true);
    handleGoogleLoginTrigger();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 relative overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79, 70, 229, 0.12) 0%, transparent 60%)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Decorative background glow circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-teal-500/5 dark:bg-teal-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="relative w-full max-w-sm">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] shadow-xl shadow-slate-900/8 dark:shadow-black/35 p-8">
          {screen === "welcome" && (
            <WelcomeScreen
              onContinueEmail={() => {
                setAlert(null);
                setScreen("register");
              }}
              onGoogleClick={handleGoogle}
              googleLoading={googleLoading}
              onSignIn={() => {
                setAlert(null);
                setScreen("login");
              }}
              alert={alert}
            />
          )}
          {screen === "login" && (
            <LoginScreen
              onLogin={handleLogin}
              onRegister={() => {
                setAlert(null);
                setScreen("register");
              }}
              onForgot={() => {
                setAlert(null);
                setScreen("forgot");
              }}
              onBack={() => {
                setAlert(null);
                setScreen("welcome");
              }}
              onGoogleClick={handleGoogle}
              googleLoading={googleLoading}
              alert={alert}
              setAlert={setAlert}
            />
          )}
          {screen === "register" && (
            <RegisterScreen
              onSignup={handleRegister}
              onLogin={() => {
                setAlert(null);
                setScreen("login");
              }}
              onBack={() => {
                setAlert(null);
                setScreen("welcome");
              }}
              onGoogleClick={handleGoogle}
              googleLoading={googleLoading}
              alert={alert}
              setAlert={setAlert}
            />
          )}
          {screen === "forgot" && (
            <ForgotScreen
              onBack={() => {
                setAlert(null);
                setScreen("login");
              }}
            />
          )}
        </div>

        {/* Dynamic Card Reflection shadow effect */}
        <div className="absolute inset-x-6 h-4 bg-white/40 dark:bg-slate-900/30 rounded-b-3xl -bottom-2 blur-sm -z-10 border border-slate-200/40 dark:border-slate-800/30" />
      </div>
    </div>
  );
}
