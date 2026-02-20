/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authService } from "../services";
import {
  getFromLocalStorage,
  saveToLocalStorage,
  removeFromLocalStorage,
} from "../hooks/useLocalStorage";
import type { User, SignupData, AuthResponse } from "../types";

interface AppContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnline: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (userData: SignupData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
  refreshToken: () => Promise<string>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getFromLocalStorage<string>("auth_token");
        const storedUser = getFromLocalStorage<User>("user_data");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);

          // Optional: Verify token is still valid
          // Uncomment this when you have a working /auth/status endpoint
          try {
            const status = await authService.getStatus();
            if (!status.valid) {
              // Token expired, clear auth
              setUser(null);
              setToken(null);
              setIsAuthenticated(false);
              removeFromLocalStorage("auth_token");
              removeFromLocalStorage("user_data");
            }
          } catch (error) {
            console.error("Token verification failed:", error);
            // Don't logout on verification failure - let the user stay logged in
            // The API calls will fail with 401 if token is invalid
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
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
      console.log("Auth logout event received");
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
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
    try {
      const response = await authService.login({
        userEmail: email,
        userPassword: password,
      });
      const { user: userData, token: authToken } = response;

      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);

      saveToLocalStorage("auth_token", authToken);
      saveToLocalStorage("user_data", userData);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData: SignupData) => {
    try {
      const response = await authService.signup(userData);
      const { user: newUser, token: authToken } = response;

      setUser(newUser);
      setToken(authToken);
      setIsAuthenticated(true);

      saveToLocalStorage("auth_token", authToken);
      saveToLocalStorage("user_data", newUser);

      return response;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      removeFromLocalStorage("auth_token");
      removeFromLocalStorage("user_data");
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    saveToLocalStorage("user_data", updatedUser);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      const { token: newToken } = response;

      setToken(newToken);
      saveToLocalStorage("auth_token", newToken);

      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
      throw error;
    }
  }, [logout]);

  const value = {
    user,
    token,
    isAuthenticated,
    isOnline,
    loading,

    login,
    signup,
    logout,
    updateUser,
    refreshToken,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export default AppContext;
