import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import type { Run } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Trash2 } from "lucide-react"

export function AdminRunsPage() {
  const queryClient = useQueryClient()

  const [selectedRun, setSelectedRun] = useState<Run | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: runs = [], isLoading, error } = useQuery({
    queryKey: ["admin-runs"],
    queryFn: adminApi.getRuns,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteRun(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-runs"] })
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
      setSelectedRun(null)
    },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
          ALL TRAINING RUNS
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Global index of all model training runs logged across the cluster
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border p-6 text-center text-xs text-muted-foreground">
          Failed to load runs: {(error as any)?.message || "Unknown error"}
        </div>
      ) : runs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
          No training runs recorded in the system yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Run ID
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Model
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Environment
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Duration
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.map((run) => {
                const createdDate = new Date(run.created_at).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric", year: "numeric" }
                )

                return (
                  <TableRow key={run.id} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{run.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {run.model_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] uppercase"
                      >
                        {run.environment_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {run.training_duration}s
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {createdDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => {
                          setSelectedRun(run)
                          setDeleteOpen(true)
                        }}
                        title="Delete Run"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedRun && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Run?"
          description={`Permanently purge Run #${selectedRun.id} (${selectedRun.model_name}) and its metrics and artifacts?`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Run"}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(selectedRun.id)
          }}
        />
      )}
    </div>
  )
}
