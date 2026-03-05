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
import { queryClient } from "@/queryClient";

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
      // Read cached user data from localStorage
      const cachedUser = getFromLocalStorage<User>("user_data");

      if (cachedUser) {
        // Restore from cache immediately for faster UI
        setUser(cachedUser);
      }

      try {
        // Fetch current user from backend
        const response = await authService.getProfile();
        const currentUser = response.user;

        // Check if the logged-in user is different from the cached user
        const isDifferentUser =
          !cachedUser || cachedUser._id !== currentUser._id;

        if (isDifferentUser) {
          // Different user login — clear cache and reset query client
          console.log("Different user detected. Clearing old cache...");
          removeFromLocalStorage("user_data");

          // Clear TanStack Query cache for this new user
          queryClient.clear();

          // Clear all TanStack Query persisted data in localStorage
          Object.keys(window.localStorage).forEach((key) => {
            if (
              key.includes("REACT_QUERY") ||
              key.includes("persist") ||
              key.includes("tanstack")
            ) {
              window.localStorage.removeItem(key);
            }
          });
        } else {
          // Same user — keep the cache, just update the user data
          console.log("Same user. Keeping cache...");
        }

        // Save/update the current user
        setUser(currentUser);
        saveToLocalStorage("user_data", currentUser);
      } catch (error) {
        const isAuthError =
          error instanceof Error &&
          "statusCode" in error &&
          (error as { statusCode: number }).statusCode === 401;

        if (isAuthError || !cachedUser) {
          // No valid auth — clear everything
          setUser(null);
          removeFromLocalStorage("user_data");
        }
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
      email: email,
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
      // Signal that we're about to logout — gives OfflineProvider a chance to sync
      const syncEvent = new CustomEvent("app:prepare-logout", {
        detail: { timestamp: Date.now() },
      });
      window.dispatchEvent(syncEvent);

      // Wait a moment for offline sync to happen (max 3 seconds)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Call backend logout endpoint
      await authService.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Clear only the user state, NOT the cache
      setUser(null);
      removeFromLocalStorage("user_data");

      // Dispatch logout events (socket cleanup, notifications, etc)
      window.dispatchEvent(new Event("auth:logout"));
      window.dispatchEvent(new Event("app:user-changed"));

      // localStorage + TanStack Query cache PERSIST
      // They will be refreshed when new user logs in via initAuth
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
