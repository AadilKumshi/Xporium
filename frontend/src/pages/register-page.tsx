import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { authApi } from "@/api/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ThemeToggle } from "@/components/shared/theme-toggle"

export function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError("Please complete all required fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      await authApi.register(username.trim(), password)
      navigate("/login", {
        replace: true,
        state: { message: "Account created successfully. Please sign in." },
      })
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try another username.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,theme(colors.border/35%)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/35%)_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_75%)]" />
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="relative w-full max-w-md space-y-7">
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
          <span>XPORIUM</span>
        </div>

        <div className="-mt-5 space-y-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Start your Workspace.
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Keep every experiment in one place.
              </p>
            </div>
          </div>
        </div>

        <Card className="gap-0 border-border/70 bg-card/95 shadow-2xl shadow-foreground/[0.06] backdrop-blur-sm">
          <CardHeader className="border-b border-border/60 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Create your account</CardTitle>
                <CardDescription className="mt-2">
                  Set up your profile to manage ML experiments.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-4">
              {error && (
                <div className="rounded-lg border border-foreground bg-foreground p-3 text-xs font-medium text-background">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-medium" htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  required
                  className="h-11 bg-background/70 px-3"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium" htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                  className="h-11 bg-background/70 px-3"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium" htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                  className="h-11 bg-background/70 px-3"
                />
              </div>
            </CardContent>

            <CardFooter className="mt-2 flex flex-col gap-4 pt-3">
              <Button
                type="submit"
                className="h-11 w-full bg-foreground font-medium text-background shadow-lg shadow-foreground/10 transition-transform hover:bg-foreground/90 hover:shadow-foreground/20 active:translate-y-px"
                disabled={loading}
              >
                {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                {loading ? "Creating account..." : "Register"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
