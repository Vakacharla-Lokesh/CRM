import { Moon, Sun, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useTheme } from "@/context/themeContext";

export function ThemeControls() {
  const { setMode, setPalette } = useTheme();

  return (
    <div className="flex items-center gap-2">
      {/* MODE TOGGLE */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle mode</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setMode("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMode("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* PALETTE TOGGLE */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
          >
            <Palette className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Change palette</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setPalette("default")}>
            Default
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPalette("claude")}>
            Claude
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPalette("tech")}>
            Tech
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPalette("meta")}>
            Meta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
