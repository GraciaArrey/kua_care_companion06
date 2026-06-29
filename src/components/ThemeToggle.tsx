import { Moon, Sun } from "lucide-react";
import { usePrefs, useT } from "@/lib/prefs";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = usePrefs();
  const t = useT();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? t("light") : t("dark")}
      title={isDark ? t("light") : t("dark")}
      className={`grid h-9 w-9 place-items-center rounded-full bg-muted text-foreground transition hover:bg-muted/70 ${className}`}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
