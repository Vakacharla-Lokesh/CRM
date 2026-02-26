import {
  createContext,
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

export interface AppContextType {
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
  // Derived — no separate state needed; always in sync with user+token.
  const isAuthenticated = !!user && !!token;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  // Decode JWT payload without verifying signature (expiry check only).
  const isTokenExpiredOrNearExpiry = (tkn: string, bufferSeconds = 60): boolean => {
    try {
      const parts = tkn.split(".");
      if (parts.length !== 3) return true;
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;
      return payload.exp <= Math.floor(Date.now() / 1000) + bufferSeconds;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getFromLocalStorage<string>("auth_token");
        const storedUser = getFromLocalStorage<User>("user_data");
        const storedRefreshToken = getFromLocalStorage<string>("refresh_token");

        if (storedToken && storedUser) {
          // Proactively refresh if the access token is expired or within the
          // 60-second buffer window — avoids all initial queries hitting 401.
          if (isTokenExpiredOrNearExpiry(storedToken) && storedRefreshToken) {
            try {
              const response = await authService.refreshToken(storedRefreshToken);
              const { token: newToken, refreshToken: newRefreshToken } = response;

              setToken(newToken);
              setUser(storedUser);

              saveToLocalStorage("auth_token", newToken);
              if (newRefreshToken) {
                saveToLocalStorage("refresh_token", newRefreshToken);
              }
            } catch {
              // Refresh token is also invalid — clear stale auth so the user
              // is shown the login page instead of a broken authenticated state.
              removeFromLocalStorage("auth_token");
              removeFromLocalStorage("user_data");
              removeFromLocalStorage("refresh_token");
            }
          } else {
            // Token is still valid — restore session directly.
            setToken(storedToken);
            setUser(storedUser);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth initialization failed:", error);
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
      setToken(null);
      removeFromLocalStorage("auth_token");
      removeFromLocalStorage("user_data");
      removeFromLocalStorage("refresh_token");
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
        password: password,
      });
      const {
        user: userData,
        token: authToken,
        refreshToken: refreshTokenValue,
      } = response;

      setUser(userData);
      setToken(authToken);

      saveToLocalStorage("auth_token", authToken);
      saveToLocalStorage("user_data", userData);
      if (refreshTokenValue) {
        saveToLocalStorage("refresh_token", refreshTokenValue);
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  const signup = useCallback(async (userData: SignupData) => {
    try {
      const response = await authService.signup(userData);
      const {
        user: newUser,
        token: authToken,
        refreshToken: refreshTokenValue,
      } = response;

      setUser(newUser);
      setToken(authToken);

      saveToLocalStorage("auth_token", authToken);
      saveToLocalStorage("user_data", newUser);
      if (refreshTokenValue) {
        saveToLocalStorage("refresh_token", refreshTokenValue);
      }

      return response;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const storedRefreshToken = getFromLocalStorage<string>("refresh_token");
      await authService.logout(storedRefreshToken ?? undefined);
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      setUser(null);
      setToken(null);
      removeFromLocalStorage("auth_token");
      removeFromLocalStorage("user_data");
      removeFromLocalStorage("refresh_token");
    }
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    saveToLocalStorage("user_data", updatedUser);
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const storedRefreshToken = getFromLocalStorage<string>("refresh_token");
      if (!storedRefreshToken) throw new Error("No refresh token stored");

      const response = await authService.refreshToken(storedRefreshToken);
      const { token: newAccessToken, refreshToken: newRefreshToken } = response;

      setToken(newAccessToken);
      saveToLocalStorage("auth_token", newAccessToken);
      if (newRefreshToken) {
        saveToLocalStorage("refresh_token", newRefreshToken);
      }

      return newAccessToken;
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

export default AppContext;
