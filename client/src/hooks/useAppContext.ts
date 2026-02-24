import { useContext } from "react";
import AppContext from "@/context/appContext";
import type { AppContextType } from "@/context/appContext";

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
