import type {
  Mode,
  Palette,
  ThemeProviderState,
} from "@/types/constants/theme";
import { createContext, useEffect, useState } from "react";

const initialState: ThemeProviderState = {
  mode: "system",
  palette: "default",
  setMode: () => null,
  setPalette: () => null,
};

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

const modeStorageKey = "vite-ui-mode";
const paletteStorageKey = "vite-ui-palette";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(modeStorageKey) as Mode) || "system",
  );

  const [palette, setPalette] = useState<Palette>(
    () => (localStorage.getItem(paletteStorageKey) as Palette) || "default",
  );

  useEffect(() => {
    const root = document.documentElement;

    // Remove previous classes
    root.classList.remove("light", "dark");

    // Handle light/dark
    let resolvedMode = mode;
    if (mode === "system") {
      resolvedMode = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(resolvedMode);

    // Apply palette
    root.setAttribute("data-theme", palette);
  }, [mode, palette]);

  return (
    <ThemeProviderContext.Provider
      value={{
        mode,
        palette,
        setMode: (mode) => {
          localStorage.setItem(modeStorageKey, mode);
          setMode(mode);
        },
        setPalette: (palette) => {
          localStorage.setItem(paletteStorageKey, palette);
          setPalette(palette);
        },
      }}
    >
      {children}
    </ThemeProviderContext.Provider>
  );
}
