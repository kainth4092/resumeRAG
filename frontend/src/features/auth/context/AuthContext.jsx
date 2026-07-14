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
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    localStorage.removeItem("remember_me");
    localStorage.removeItem("token_expiry");
    sessionStorage.removeItem("session_active");
    api.clearCache();
    setUser(null);
  }, []);

  const fetchUser = useCallback(
    async (force = false) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        const rememberMe = localStorage.getItem("remember_me") === "true";
        const tokenExpiry = localStorage.getItem("token_expiry");
        const sessionActive =
          sessionStorage.getItem("session_active") === "true";

        if (rememberMe && tokenExpiry) {
          const expiry = parseInt(tokenExpiry, 10);
          if (Date.now() > expiry) {
            logout();
            setLoading(false);
            return;
          }
        } else if (!rememberMe) {
          if (!sessionActive && !force) {
            logout();
            setLoading(false);
            return;
          }
        }

        if (!rememberMe) {
          sessionStorage.setItem("session_active", "true");
        }

        if (user && !force) {
          setLoading(false);
          return user;
        }
        try {
          const res = await getCurrentUser();
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
          setLoading(false);
          return completeUserData;
        } catch (err) {
          console.error("Failed to fetch user", err);
          logout();
          setLoading(false);
          return null;
        }
      } else {
        setUser(null);
        localStorage.removeItem("user_info");
        setLoading(false);
        return null;
      }
    },
    [user, logout],
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
