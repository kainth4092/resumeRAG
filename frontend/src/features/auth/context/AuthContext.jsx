import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("user_info");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = async (force = false) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      if (user && !force) {
        setLoading(false);
        return;
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
      } catch (err) {
        console.error("Failed to fetch user", err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_info");
        setUser(null);
      }
    } else {
      setUser(null);
      localStorage.removeItem("user_info");
    }
    setLoading(false);
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchUser();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_info");
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    setUser,
    logout,
    fetchUser,
    loading
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
