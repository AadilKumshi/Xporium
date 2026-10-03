import { Outlet, NavLink } from "react-router-dom"
import { BarChart3, Users, Boxes, PlayCircle, ArrowLeft } from "lucide-react"

export function AdminLayout() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Admin Sub-header */}
      <div className="border-b border-border bg-card px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink
            to="/experiments"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspace
          </NavLink>

          <div className="h-4 w-px bg-border" />

          <nav className="flex items-center gap-4 text-xs font-medium">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                isActive
                  ? "text-foreground font-semibold border-b-2 border-foreground pb-2 -mb-3.5"
                  : "text-muted-foreground hover:text-foreground pb-2"
              }
            >
              <div className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                Overview
              </div>
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive
                  ? "text-foreground font-semibold border-b-2 border-foreground pb-2 -mb-3.5"
                  : "text-muted-foreground hover:text-foreground pb-2"
              }
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Users
              </div>
            </NavLink>

            <NavLink
              to="/admin/experiments"
              className={({ isActive }) =>
                isActive
                  ? "text-foreground font-semibold border-b-2 border-foreground pb-2 -mb-3.5"
                  : "text-muted-foreground hover:text-foreground pb-2"
              }
            >
              <div className="flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5" />
                Experiments
              </div>
            </NavLink>

            <NavLink
              to="/admin/runs"
              className={({ isActive }) =>
                isActive
                  ? "text-foreground font-semibold border-b-2 border-foreground pb-2 -mb-3.5"
                  : "text-muted-foreground hover:text-foreground pb-2"
              }
            >
              <div className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5" />
                Runs
              </div>
            </NavLink>
          </nav>
        </div>

        <span className="text-[10px] font-mono uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded border border-border">
          Admin Portal
        </span>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
