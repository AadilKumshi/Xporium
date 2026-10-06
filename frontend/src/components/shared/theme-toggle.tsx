import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [systemIsDark, setSystemIsDark] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemIsDark(event.matches)
    }

    setSystemIsDark(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleTheme = () => {
    const isDark =
      theme === "dark" ||
      (theme === "system" && systemIsDark)
    setTheme(isDark ? "light" : "dark")
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" && systemIsDark)

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      {isDark ? (
        <Moon className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
      )}
    </Button>
  )
}
