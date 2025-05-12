
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full border-muted-foreground/20"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === "light" ? "Switch to dark mode" : "Switch to light mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
