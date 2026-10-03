import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import type { Experiment } from "@/types"
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
import { ArrowUpRight, Trash2 } from "lucide-react"

export function AdminExperimentsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedExp, setSelectedExp] = useState<Experiment | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: experiments = [], isLoading, error } = useQuery({
    queryKey: ["admin-experiments"],
    queryFn: adminApi.getExperiments,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteExperiment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiments"] })
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
      setSelectedExp(null)
    },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
          ALL EXPERIMENTS
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Global index of all machine learning experiments across all users
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
          Failed to load experiments: {(error as any)?.message || "Unknown error"}
        </div>
      ) : experiments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
          No experiments created in the system yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Experiment
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Dataset
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments.map((exp) => {
                const createdDate = new Date(exp.created_at).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric", year: "numeric" }
                )

                return (
                  <TableRow key={exp.id} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{exp.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {exp.name}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {exp.dataset_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] uppercase"
                      >
                        {exp.experiment_type.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {createdDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => navigate(`/experiments/${exp.id}`)}
                          title="Open Experiment"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => {
                            setSelectedExp(exp)
                            setDeleteOpen(true)
                          }}
                          title="Delete Experiment"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedExp && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Experiment?"
          description={`Permanently purge experiment "${selectedExp.name}" and all its data configurations, runs, and artifacts?`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Experiment"}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(selectedExp.id)
          }}
        />
      )}
    </div>
  )
}
