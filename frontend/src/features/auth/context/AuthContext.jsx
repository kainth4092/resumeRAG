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

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    const KEYS = ["access_token", "user_info", "remember_me", "token_expiry"];

    KEYS.forEach((key) => localStorage.removeItem(key));

    sessionStorage.clear();
    api.clearCache();
    setUser(null);
  }, []);

  const fetchUser = useCallback(
    async (force = false) => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setUser(null);
        localStorage.removeItem("user_info");
        setLoading(false);
        return null;
      }

      setLoading(true);

      const rememberMe = localStorage.getItem("remember_me") === "true";
      const tokenExpiry = localStorage.getItem("token_expiry");
      const sessionActive = sessionStorage.getItem("session_active") === "true";

      if (rememberMe && tokenExpiry) {
        const expiry = Number(tokenExpiry);

        if (Date.now() > expiry) {
          logout();
          setLoading(false);
          return null;
        }
      }

      if (!rememberMe) {
        if (!sessionActive && !force) {
          logout();
          setLoading(false);
          return null;
        }

        sessionStorage.setItem("session_active", "true");
      }

      const cached = localStorage.getItem("user_info");

      if (cached && !force) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
          setLoading(false);
          return parsed;
        } catch {
          localStorage.removeItem("user_info");
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
        console.error("Failed to fetch user", err);
        logout();
        return null;
      } finally {
        setLoading(false);
      }
    },
    [logout],
  );

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
