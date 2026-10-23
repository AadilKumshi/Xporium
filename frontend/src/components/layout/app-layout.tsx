import { useState } from "react"
import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { authApi } from "@/api/auth"
import {
  Boxes,
  PanelLeftClose,
  PanelLeftOpen,
  LibraryBig,
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
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await authApi.deleteAccount()
      logout()
      navigate("/login")
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account"
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`flex shrink-0 flex-col justify-between border-r border-border bg-card p-4 transition-[width] duration-200 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="space-y-6">
          <div
            className={`flex items-center px-2 ${
              sidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-lg font-semibold tracking-wider ${
                  sidebarOpen ? "" : "sr-only"
                }`}
              >
                XPORIUM
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((open) => !open)}
                className="text-muted-foreground hover:text-foreground"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-3.5 w-3.5" />
                ) : (
                  <PanelLeftOpen className="h-3.5 w-3.5" />
                )}
              </Button>
              {sidebarOpen && <ThemeToggle />}
            </div>
          </div>

          <nav className="space-y-1">
            <NavLink
              to="/experiments"
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  !sidebarOpen ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <Boxes className="h-4 w-4" />
              {sidebarOpen && "Experiments"}
            </NavLink>
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  !sidebarOpen ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-foreground font-medium text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <LibraryBig className="h-4 w-4" />
              {sidebarOpen && "Library"}
            </NavLink>

            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    !sidebarOpen ? "justify-center" : ""
                  } ${
                    isActive
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Shield className="h-4 w-4" />
                {sidebarOpen && "Admin Console"}
              </NavLink>
            )}
          </nav>
        </div>

        {/* User footer */}
        <div className="space-y-3 border-t border-border pt-4">
          <div
            className={`flex items-center px-2 ${
              sidebarOpen ? "justify-between" : "justify-center"
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className={`truncate ${sidebarOpen ? "" : "sr-only"}`}>
                <p className="truncate text-xs font-medium">{user?.Username}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase">
                  {user?.Role}
                </p>
              </div>
            </div>

            {sidebarOpen && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title="Logout"
                  aria-label="Logout"
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  title="Delete account"
                  aria-label="Delete account"
                  onClick={() => setDeleteAccountOpen(true)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
          {deleteError && (
            <p className="px-2 text-xs text-destructive" role="alert">
              {deleteError}
            </p>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
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
