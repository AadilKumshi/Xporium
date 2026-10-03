import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { authApi } from "@/api/auth"
import {
  Boxes,
  Shield,
  LogOut,
  User as UserIcon,
  Trash2,
} from "lucide-react"

export function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await authApi.deleteAccount()
      logout()
      navigate("/login")
    } catch (err: any) {
      alert(err.message || "Failed to delete account")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col justify-between p-4 bg-card">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-lg tracking-wider font-mono">
                XPORIUM
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                v1.0
              </span>
            </div>
            <ThemeToggle />
          </div>

          <nav className="space-y-1">
            <NavLink
              to="/experiments"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`
              }
            >
              <Boxes className="w-4 h-4" />
              Experiments
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`
                }
              >
                <Shield className="w-4 h-4" />
                Admin Console
              </NavLink>
            )}
          </nav>
        </div>

        {/* User footer */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border">
                <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="truncate">
                <p className="text-xs font-medium truncate">{user?.Username}</p>
                <p className="text-[10px] uppercase font-mono text-muted-foreground">
                  {user?.Role}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleLogout}
              title="Sign Out"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="px-2">
            <button
              onClick={() => setDeleteAccountOpen(true)}
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Delete account
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>

      <ConfirmDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
        title="Delete Your Account?"
        description="This will permanently delete your account and all associated experiments, data configurations, runs, and artifacts. This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Account"}
        onConfirm={handleDeleteAccount}
      />
    </div>
  )
}
