import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Spinner } from "@/components/ui/spinner"

export function ProtectedRoute() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="w-6 h-6 text-foreground" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function AdminRoute() {
  const { token, isLoading, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="w-6 h-6 text-foreground" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/experiments" replace />
  }

  return <Outlet />
}
