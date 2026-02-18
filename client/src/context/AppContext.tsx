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

/**
 * Application Context
 * Manages global state including authentication, user data, and online/offline status
 */

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

/**
 * AppProvider Component
 * Wraps the application to provide global state management
 */
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const logout = async () => {
      try {
        // Call logout API if authenticated
        if (isAuthenticated) {
          await authService.logout();
        }
      } catch (error) {
        console.error("Logout API call failed:", error);
      } finally {
        // Clear state
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);

        // Clear localStorage
        removeFromLocalStorage("auth_token");
        removeFromLocalStorage("user_data");
      }
    };

    const initAuth = async () => {
      try {
        const storedToken = getFromLocalStorage<string>("auth_token");
        const storedUser = getFromLocalStorage<User>("user_data");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);

          // Verify token is still valid
          try {
            const status = await authService.getStatus();
            if (!status.valid) {
              // Token expired, clear auth
              await logout();
            }
          } catch (error) {
            console.error("Token verification failed:", error);
            await logout();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [isAuthenticated]);

  /**
   * Listen for online/offline events
   */
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /**
   * Login handler
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data and token
   */
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login({ userEmail: email, userPassword: password });
      const { user: userData, token: authToken } = response;

      // Save to state
      setUser(userData);
      setToken(authToken);
      setIsAuthenticated(true);

      // Persist to localStorage
      saveToLocalStorage("auth_token", authToken);
      saveToLocalStorage("user_data", userData);

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, []);

  /**
   * Signup handler
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data and token
   */
  const signup = useCallback(async (userData: SignupData) => {
    try {
      const response = await authService.signup(userData);
      const { user: newUser, token: authToken } = response;

      // Save to state
      setUser(newUser);
      setToken(authToken);
      setIsAuthenticated(true);

      // Persist to localStorage
      saveToLocalStorage("auth_token", authToken);
      saveToLocalStorage("user_data", newUser);

      return response;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }, []);

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    try {
      // Call logout API if authenticated
      if (isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);

      // Clear localStorage
      removeFromLocalStorage("auth_token");
      removeFromLocalStorage("user_data");
    }
  }, [isAuthenticated]);

  /**
   * Update user data
   * @param {Object} updatedUser - Updated user data
   */
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    saveToLocalStorage("user_data", updatedUser);
  }, []);

  /**
   * Refresh auth token
   */
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
    // State
    user,
    token,
    isAuthenticated,
    isOnline,
    loading,

    // Methods
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * useAppContext Hook
 * Access global application context
 * @returns {Object} App context value
 */
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};

export default AppContext;
