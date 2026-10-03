import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { adminApi } from "@/api/admin"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Boxes, Sliders, PlayCircle, Image as ImageIcon, ArrowRight } from "lucide-react"

export function AdminOverviewPage() {
  const { data: overview, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: adminApi.getOverview,
  })

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !overview) {
    return (
      <div className="rounded-lg border border-border p-8 text-center text-xs text-muted-foreground">
        Failed to load system metrics: {(error as any)?.message || "Unknown error"}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: overview.total_users,
      icon: Users,
      link: "/admin/users",
      action: "Manage Users",
    },
    {
      title: "Experiments",
      value: overview.total_experiments,
      icon: Boxes,
      link: "/admin/experiments",
      action: "Inspect Experiments",
    },
    {
      title: "Configurations",
      value: overview.total_data_configurations,
      icon: Sliders,
    },
    {
      title: "Training Runs",
      value: overview.total_runs,
      icon: PlayCircle,
      link: "/admin/runs",
      action: "Inspect Runs",
    },
    {
      title: "Artifacts",
      value: overview.total_artifacts,
      icon: ImageIcon,
    },
  ]

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
          SYSTEM OVERVIEW
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time cluster telemetry, resource totals, and administrative controls
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold font-mono text-foreground">
                  {stat.value}
                </div>
                {stat.link && (
                  <Link
                    to={stat.link}
                    className="inline-flex items-center text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span>{stat.action}</span>
                    <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
