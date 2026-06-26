import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
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
        setUser({
          ...userData,
          avatar: initials,
        });
      } catch (err) {
        console.error("Failed to fetch user", err);
        localStorage.removeItem("access_token");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, fetchUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
