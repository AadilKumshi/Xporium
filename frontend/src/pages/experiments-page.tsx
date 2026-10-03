import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { experimentsApi } from "@/api/experiments"
import { ExperimentCard } from "@/features/experiments/experiment-card"
import { CreateExperimentDialog } from "@/features/experiments/create-experiment-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Boxes } from "lucide-react"

export function ExperimentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: experiments = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["experiments"],
    queryFn: experimentsApi.list,
  })

  const deleteMutation = useMutation({
    mutationFn: experimentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] })
    },
  })

  const filteredExperiments = useMemo(() => {
    if (!searchQuery.trim()) return experiments
    const q = searchQuery.toLowerCase().trim()
    return experiments.filter(
      (exp) =>
        exp.name.toLowerCase().includes(q) ||
        exp.dataset_name.toLowerCase().includes(q) ||
        exp.experiment_type.toLowerCase().includes(q)
    )
  }, [experiments, searchQuery])

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-mono">
            EXPERIMENTS
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage models, datasets, training runs, and evaluations
          </p>
        </div>

        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-foreground text-background hover:bg-foreground/90 font-medium"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Experiment
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter experiments by name, dataset, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      {/* Content Feed */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-card space-y-3"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full" />
              <div className="pt-2 border-t border-border flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          <p className="text-foreground font-medium mb-1">
            Failed to load experiments
          </p>
          <p className="text-xs">{(error as any)?.message || "Server error"}</p>
        </div>
      ) : experiments.length === 0 ? (
        <EmptyState
          icon={<Boxes className="w-10 h-10 text-muted-foreground" />}
          title="No experiments yet"
          description="Start tracking your first machine learning experiment. Configure your dataset and log training runs."
          actionLabel="Create Experiment"
          onAction={() => setCreateOpen(true)}
        />
      ) : filteredExperiments.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No experiments match your search &quot;{searchQuery}&quot;.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExperiments.map((exp) => (
            <ExperimentCard
              key={exp.id}
              experiment={exp}
              onDelete={async (id) => {
                await deleteMutation.mutateAsync(id)
              }}
              onUpdated={() => {
                queryClient.invalidateQueries({ queryKey: ["experiments"] })
              }}
            />
          ))}
        </div>
      )}

      <CreateExperimentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["experiments"] })
        }}
      />
    </div>
  )
}
