import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authService } from "../services";
import {
  saveToLocalStorage,
  removeFromLocalStorage,
  getFromLocalStorage,
} from "../hooks/useLocalStorage";
import type { User, SignupData, AuthResponse } from "../types";

export interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (userData: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  refreshSession: () => Promise<void>;
  // Kept for any consumers that still reference token — always null now
  token: null;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      try {
        const cachedUser = getFromLocalStorage<User>("user_data");

        if (cachedUser) {
          setUser(cachedUser);
        }

        const response = await authService.getProfile();
        setUser(response.user);
        saveToLocalStorage("user_data", response.user);
      } catch {
        setUser(null);
        removeFromLocalStorage("user_data");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const handleAuthLogout = () => {
      setUser(null);
      removeFromLocalStorage("user_data");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("auth:logout", handleAuthLogout);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("auth:logout", handleAuthLogout);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({
      userEmail: email,
      password: password,
    });

    setUser(response.user);
    saveToLocalStorage("user_data", response.user);

    return response;
  }, []);

  const signup = useCallback(async (userData: SignupData) => {
    const response = await authService.signup(userData);

    setUser(response.user);
    saveToLocalStorage("user_data", response.user);

    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      removeFromLocalStorage("user_data");
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    saveToLocalStorage("user_data", updatedUser);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await authService.refreshSession();
    } catch (error) {
      console.error("Session refresh failed:", error);
      await logout();
      throw error;
    }
  }, [logout]);

  const value: AppContextType = {
    user,
    token: null,
    isAuthenticated,
    isOnline,
    loading,
    login,
    signup,
    logout,
    updateUser,
    refreshSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
