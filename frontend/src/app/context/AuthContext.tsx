import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { type User } from "../data/types";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  token?: string | null;
  setToken?: (t: string | null) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const refreshUser = async () => {
    await fetchUser();
  };



  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    try {
      localStorage.removeItem("token");
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        token,
        setToken,
        logout,
        refreshUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
