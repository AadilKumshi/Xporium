import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { experimentsApi } from "@/api/experiments"
import { runsApi } from "@/api/runs"
import { artifactsApi } from "@/api/artifacts"
import { RunParametersTable } from "@/features/runs/run-parameters-table"
import { RunMetricsTable } from "@/features/runs/run-metrics-table"
import { ArtifactViewer } from "@/features/artifacts/artifact-viewer"
import { EditRunDialog } from "@/features/runs/edit-run-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Clock,
  Cpu,
  Calendar,
  Edit3,
  Trash2,
} from "lucide-react"

export function RunDetailPage() {
  const { id, runId: runIdParam } = useParams<{ id: string; runId: string }>()
  const experimentId = parseInt(id || "0", 10)
  const runId = parseInt(runIdParam || "0", 10)

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Fetch Experiment
  const { data: experiment } = useQuery({
    queryKey: ["experiment", experimentId],
    queryFn: () => experimentsApi.getById(experimentId),
    enabled: !!experimentId,
  })

  // Fetch Run
  const {
    data: run,
    isLoading: runLoading,
    error: runError,
  } = useQuery({
    queryKey: ["run", experimentId, runId],
    queryFn: () => runsApi.getById(experimentId, runId),
    enabled: !!experimentId && !!runId,
  })

  // Fetch Artifact
  const { data: artifact = null, refetch: refetchArtifact } = useQuery({
    queryKey: ["artifact", runId],
    queryFn: () => artifactsApi.get(runId),
    enabled: !!runId,
  })

  const deleteMutation = useMutation({
    mutationFn: () => runsApi.delete(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs", experimentId] })
      navigate(`/experiments/${experimentId}`, { replace: true })
    },
  })

  if (runLoading) {
    return (
      <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (runError || !run) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-lg font-semibold">Run not found</h2>
        <p className="text-xs text-muted-foreground">
          The requested training run could not be found.
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(`/experiments/${experimentId}`)}
        >
          Return to Experiment
        </Button>
      </div>
    )
  }

  const createdDate = new Date(run.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigate(`/experiments/${experimentId}?tab=runs`)}
            className="text-muted-foreground hover:text-foreground"
            title="Back to Runs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
                Run #{run.id} — {run.model_name}
              </h1>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {run.environment_type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Experiment:{" "}
              <span className="text-foreground font-medium">
                {experiment?.name || `ID #${experimentId}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit Run
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Run
          </Button>
        </div>
      </div>

      {/* Overview Metadata Card */}
      <div className="rounded-xl border border-border bg-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground">
            Duration
          </span>
          <div className="flex items-center gap-2 text-sm font-semibold font-mono text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{run.training_duration} seconds</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground">
            Environment
          </span>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Cpu className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="font-mono capitalize">
              {run.environment_type}
              {run.environment_specs && ` (${run.environment_specs})`}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono uppercase text-muted-foreground">
            Recorded At
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>{createdDate}</span>
          </div>
        </div>
      </div>

      {/* Grid: Parameters & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Parameters
          </h3>
          <RunParametersTable parameters={run.parameters || []} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Metrics
          </h3>
          <RunMetricsTable metrics={run.metrics || []} />
        </div>
      </div>

      {/* Artifact Viewer / Uploader Section */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Run Artifacts
        </h3>
        <ArtifactViewer
          runId={run.id}
          artifact={artifact}
          onUpdated={() => {
            refetchArtifact()
          }}
        />
      </div>

      <EditRunDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        run={run}
        onUpdated={() => {
          queryClient.invalidateQueries({
            queryKey: ["run", experimentId, runId],
          })
          queryClient.invalidateQueries({ queryKey: ["runs", experimentId] })
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Training Run?"
        description={`This will permanently delete Run #${run.id} (${run.model_name}) and its attached artifact.\n\nThis action cannot be undone.`}
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Run"}
        onConfirm={async () => {
          await deleteMutation.mutateAsync()
        }}
      />
    </div>
  )
}
