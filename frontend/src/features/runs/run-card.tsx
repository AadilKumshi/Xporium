import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Run } from "@/types"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EditRunDialog } from "./edit-run-dialog"
import { PlayCircle, Clock, Cpu, Edit3, Trash2, ArrowUpRight } from "lucide-react"

interface RunCardProps {
  run: Run
  experimentId: number
  onDelete: (id: number) => Promise<void>
  onUpdated: () => void
}

export function RunCard({
  run,
  experimentId,
  onDelete,
  onUpdated,
}: RunCardProps) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(run.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const topMetrics = (run.metrics || []).slice(0, 3)

  return (
    <>
      <Card className="border border-border hover:border-foreground/30 transition-colors">
        <CardHeader className="flex flex-row items-start justify-between pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold font-mono">
                Run #{run.id}
              </CardTitle>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">
                {run.environment_type}
              </Badge>
            </div>
            <p className="text-xs font-medium text-foreground">
              {run.model_name}
            </p>
          </div>

          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => navigate(`/experiments/${experimentId}/runs/${run.id}`)}
            title="Open Run Details"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {run.training_duration}s
            </span>

            {run.environment_specs && (
              <span className="flex items-center gap-1.5 truncate max-w-[200px]" title={run.environment_specs}>
                <Cpu className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{run.environment_specs}</span>
              </span>
            )}
          </div>

          {topMetrics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topMetrics.map((m, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded bg-muted border border-border text-[11px] font-mono"
                >
                  {m.name}: <strong className="text-foreground">{m.value}</strong>
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="border-t border-border/60 pt-2.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {run.parameters?.length || 0} params • {run.metrics?.length || 0} metrics
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setEditOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              Edit
            </Button>

            <Button
              variant="ghost"
              size="xs"
              onClick={() => setDeleteOpen(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </CardFooter>
      </Card>

      <EditRunDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        run={run}
        onUpdated={onUpdated}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Training Run?"
        description={`This will permanently delete Run #${run.id} (${run.model_name}) along with its parameters, metrics, and artifact.\n\nThis action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Run"}
        onConfirm={handleDelete}
      />
    </>
  )
}
