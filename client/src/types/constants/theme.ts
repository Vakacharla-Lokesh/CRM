export type Mode = "dark" | "light" | "system";
export type Palette = "default" | "claude" | "tech" | "meta";

export type ThemeProviderState = {
  mode: Mode;
  palette: Palette;
  setMode: (mode: Mode) => void;
  setPalette: (palette: Palette) => void;
};
