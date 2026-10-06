import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { authApi } from "@/api/auth"
import { useAuth } from "@/hooks/use-auth"
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

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = (location.state as any)?.message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!username.trim() || !password) {
      setError("Please enter both username and password")
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login(username.trim(), password)
      await login(res.access_token)
      navigate("/experiments", { replace: true })
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold font-mono tracking-widest text-foreground">
            XPORIUM
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            ML EXPERIMENT TRACKER
          </p>
        </div>

        <Card className="border border-border">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your account credentials to continue
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {successMessage && (
                <div className="rounded border border-border bg-muted p-2.5 text-xs text-foreground">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder=""
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full bg-foreground text-background hover:bg-foreground/90 font-medium"
                disabled={loading}
              >
                {loading ? <Spinner className="w-4 h-4 mr-2" /> : null}
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-foreground underline underline-offset-4 hover:opacity-80"
                >
                  Create account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
