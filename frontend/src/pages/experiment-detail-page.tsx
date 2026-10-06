import { useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { DataConfiguration } from "@/types"
import { experimentsApi } from "@/api/experiments"
import { runsApi } from "@/api/runs"
import { DataConfigCard } from "@/features/data-configs/data-config-card"
import { CreateDataConfigDialog } from "@/features/data-configs/create-data-config-dialog"
import { RunCard } from "@/features/runs/run-card"
import { CreateRunDialog } from "@/features/runs/create-run-dialog"
import { EditExperimentDialog } from "@/features/experiments/edit-experiment-dialog"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Calendar,
  Database,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  PlayCircle,
  Sliders,
  FileCode,
} from "lucide-react"

export function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const experimentId = parseInt(id || "0", 10)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [dataConfigToDelete, setDataConfigToDelete] =
    useState<DataConfiguration | null>(null)
  const [createDataConfigOpen, setCreateDataConfigOpen] = useState(false)
  const [createRunOpen, setCreateRunOpen] = useState(false)

  // Fetch Experiment
  const {
    data: experiment,
    isLoading: expLoading,
    error: expError,
  } = useQuery({
    queryKey: ["experiment", experimentId],
    queryFn: () => experimentsApi.getById(experimentId),
    enabled: !!experimentId,
  })

  // Fetch Data Configurations
  const { data: dataConfigs = [], isLoading: configsLoading } = useQuery({
    queryKey: ["data-configs", experimentId],
    queryFn: () => experimentsApi.listDataConfigs(experimentId),
    enabled: !!experimentId,
  })

  // Fetch Runs
  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ["runs", experimentId],
    queryFn: () => runsApi.listByExperiment(experimentId),
    enabled: !!experimentId,
  })

  const configsList = Array.isArray(dataConfigs) ? dataConfigs : []
  const runsList = Array.isArray(runs) ? runs : []

  const deleteMutation = useMutation({
    mutationFn: () => experimentsApi.delete(experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] })
      navigate("/experiments", { replace: true })
    },
  })

  const deleteDataConfigMutation = useMutation({
    mutationFn: () => {
      if (!dataConfigToDelete) {
        throw new Error("No data configuration selected")
      }

      return experimentsApi.deleteDataConfig(
        experimentId,
        dataConfigToDelete.id
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["data-configs", experimentId],
      })
      queryClient.invalidateQueries({ queryKey: ["runs", experimentId] })
      setDataConfigToDelete(null)
    },
  })

  if (expLoading) {
    return (
      <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (expError || !experiment) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-lg font-semibold">Experiment not found</h2>
        <p className="text-xs text-muted-foreground">
          The requested experiment does not exist or has been deleted.
        </p>
        <Button variant="outline" onClick={() => navigate("/experiments")}>
          Return to Experiments
        </Button>
      </div>
    )
  }

  const createdDate = new Date(experiment.created_at).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  )
  const updatedDate = new Date(experiment.updated_at).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  )
  const initialTab = searchParams.get("tab") === "runs" ? "runs" : "overview"

  return (
    <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => navigate("/experiments")}
            className="text-muted-foreground hover:text-foreground"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
                {experiment.name}
              </h1>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {experiment.experiment_type.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
              <span>Dataset: {experiment.dataset_name}</span>
              <span>•</span>
              <span>Updated: {updatedDate}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {experiment.project_url && (
            <a
              href={experiment.project_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors text-foreground"
            >
              <FileCode className="w-3.5 h-3.5" />
              Open Notebook
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="text-xs"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue={initialTab} className="w-full">
        <TabsList className="bg-muted p-1 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">
            Data Configurations 
          </TabsTrigger>
          <TabsTrigger value="runs">Training Runs </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="pt-4 space-y-4">
          <div className="rounded-xl border border-border bg-card p-3.75 space-y-4">
            <div>
              <h3 className="text-xs font-mono uppercase text-muted-foreground">
                Description
              </h3>
              <p className="text-sm text-foreground mt-1 whitespace-pre-line">
                {experiment.description?.trim() || "No Description Provided"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  
                </span>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{experiment.dataset_name}</span>
                  {experiment.dataset_public_url && (
                    <a
                      href={experiment.dataset_public_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2 ml-2"
                    >
                      Dataset Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-muted-foreground">
                  
                </span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Created: {createdDate}
                  </span>
                  <span>•</span>
                  <span>Updated: {updatedDate}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Data Configurations */}
        <TabsContent value="data" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Define partition ratios and preprocessing operations.
            </p>
            <Button
              onClick={() => setCreateDataConfigOpen(true)}
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Dataset Configuration
            </Button>
          </div>

          {configsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : configsList.length === 0 ? (
            <EmptyState
              icon={<Sliders className="w-9 h-9 text-muted-foreground" />}
              title="No dataset configurations"
              description="Configure how your dataset was prepared, split, and preprocessed before recording training runs."
              actionLabel="Add Dataset Configuration"
              onAction={() => setCreateDataConfigOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configsList.map((cfg) => (
                <DataConfigCard
                  key={cfg.id}
                  config={cfg}
                  onDelete={setDataConfigToDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Runs */}
        <TabsContent value="runs" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Record hyperparameters, evaluation metrics, and artifacts.
            </p>
            <Button
              onClick={() => setCreateRunOpen(true)}
              size="sm"
              disabled={configsList.length === 0}
              className="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs"
              title={
                configsList.length === 0
                  ? "Add a data configuration before recording a run"
                  : ""
              }
            >
              <PlayCircle className="w-3.5 h-3.5 mr-1" />
              Record Training Run
            </Button>
          </div>

          {configsList.length === 0 && (
            <div className="rounded border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              💡 Please create at least one <strong>Data Configuration</strong>{" "}
              before recording a training run.
            </div>
          )}

          {runsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : runsList.length === 0 ? (
            <EmptyState
              icon={<PlayCircle className="w-9 h-9 text-muted-foreground" />}
              title="No training runs recorded yet"
              description="Log training duration, hyperparameters, and test metrics for this experiment."
              actionLabel={configsList.length > 0 ? "Record Training Run" : undefined}
              onAction={() => setCreateRunOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="runs-container">
              {runsList.map((run) => (
                <RunCard
                  key={run.id}
                  run={run}
                  experimentId={experimentId}
                  onDelete={async (runId) => {
                    await runsApi.delete(runId)
                    queryClient.invalidateQueries({
                      queryKey: ["runs", experimentId],
                    })
                  }}
                  onUpdated={() => {
                    queryClient.invalidateQueries({
                      queryKey: ["runs", experimentId],
                    })
                  }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EditExperimentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        experiment={experiment}
        onUpdated={() => {
          queryClient.invalidateQueries({
            queryKey: ["experiment", experimentId],
          })
          queryClient.invalidateQueries({ queryKey: ["experiments"] })
        }}
      />

      <CreateDataConfigDialog
        open={createDataConfigOpen}
        onOpenChange={setCreateDataConfigOpen}
        experimentId={experimentId}
        onCreated={() => {
          queryClient.invalidateQueries({
            queryKey: ["data-configs", experimentId],
          })
        }}
      />

      <CreateRunDialog
        open={createRunOpen}
        onOpenChange={setCreateRunOpen}
        experimentId={experimentId}
        dataConfigs={dataConfigs}
        onCreated={() => {
          queryClient.invalidateQueries({
            queryKey: ["runs", experimentId],
          })
        }}
      />

      <ConfirmDialog
        open={dataConfigToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDataConfigToDelete(null)
          }
        }}
        title="Delete Data Configuration?"
        description={`Deleting "${dataConfigToDelete?.name || "this data configuration"}" will also permanently delete every training run that uses it, including its parameters, metrics, and artifacts.\n\nThis action cannot be undone.`}
        confirmText={
          deleteDataConfigMutation.isPending
            ? "Deleting..."
            : "Delete Configuration"
        }
        onConfirm={() => deleteDataConfigMutation.mutate()}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Experiment?"
        description={`This will permanently delete "${experiment.name}" and all associated runs and artifacts.\n\nThis action cannot be undone.`}
        confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Experiment"}
        onConfirm={async () => {
          await deleteMutation.mutateAsync()
        }}
      />
    </div>
  )
}
