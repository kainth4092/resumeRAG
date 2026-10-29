/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { getCurrentUser } from "../services/authService";
import api from "../../../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const tokenExpiry = localStorage.getItem("token_expiry");
      if (!token || (tokenExpiry && Date.now() > Number(tokenExpiry))) {
        return null;
      }
      const cached = localStorage.getItem("user_info");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          localStorage.removeItem("user_info");
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) return false;
      const tokenExpiry = localStorage.getItem("token_expiry");
      if (tokenExpiry && Date.now() > Number(tokenExpiry)) return false;
      return true;
    }
    return false;
  });

  const logout = useCallback(() => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("saved_resumes_") ||
          key.startsWith("last_resume_id_") ||
          key.startsWith("last_job_description_") ||
          key.startsWith("notes_") ||
          key.startsWith("resupilot_dashboard_tasks_") ||
          key.startsWith("bookmarked_questions_") ||
          key.startsWith("profile_") ||
          key.startsWith("dashboard_data_") ||
          key === "access_token" ||
          key === "user_info" ||
          key === "remember_me" ||
          key === "token_expiry")
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    sessionStorage.clear();
    api.clearCache();
    setUser(null);
  }, []);

  const fetchUser = useCallback(
    async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setUser(null);
        localStorage.removeItem("user_info");
        setLoading(false);
        return null;
      }

      setLoading(true);

      const tokenExpiry = localStorage.getItem("token_expiry");
      if (tokenExpiry) {
        const expiry = Number(tokenExpiry);
        if (Date.now() > expiry) {
          logout();
          setLoading(false);
          return null;
        }
      }

      try {
        const requestToken = localStorage.getItem("access_token");
        const res = await getCurrentUser();

        if (requestToken !== localStorage.getItem("access_token")) {
          return null;
        }

        const userData = res.data;
        const initials = userData.name
          ? userData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : userData.email
            ? userData.email.slice(0, 2).toUpperCase()
            : "U";

        const completeUserData = {
          ...userData,
          avatar: initials,
        };

        setUser(completeUserData);
        localStorage.setItem("user_info", JSON.stringify(completeUserData));
        return completeUserData;
      } catch (err) {
        console.error("Failed to revalidate user on /auth/me:", err);
        logout();
        return null;
      } finally {
        setLoading(false);
      }
    },
    [logout],
  );

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("access_token");
    const tokenExpiry = localStorage.getItem("token_expiry");
    const isExpired = tokenExpiry && Date.now() > Number(tokenExpiry);

    if (!token || isExpired) {
      if (isExpired) {
        Promise.resolve().then(() => logout());
      }
      return;
    }

    getCurrentUser()
      .then((res) => {
        if (!active) return;
        const userData = res.data;
        const initials = userData.name
          ? userData.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : userData.email
            ? userData.email.slice(0, 2).toUpperCase()
            : "U";
        const completeUserData = { ...userData, avatar: initials };
        setUser(completeUserData);
        localStorage.setItem("user_info", JSON.stringify(completeUserData));
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to revalidate user on /auth/me:", err);
        logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
      fetchUser,
      loading,
    }),
    [user, loading, fetchUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
