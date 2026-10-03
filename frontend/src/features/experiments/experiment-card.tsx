import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Experiment } from "@/types"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EditExperimentDialog } from "./edit-experiment-dialog"
import { Database, Calendar, Edit3, Trash2, ArrowUpRight } from "lucide-react"

interface ExperimentCardProps {
  experiment: Experiment
  onDelete: (id: number) => Promise<void>
  onUpdated: () => void
}

export function ExperimentCard({
  experiment,
  onDelete,
  onUpdated,
}: ExperimentCardProps) {
  const navigate = useNavigate()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(experiment.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const formattedDate = new Date(experiment.updated_at).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric", year: "numeric" }
  )

  return (
    <>
      <Card className="border border-border hover:border-foreground/40 transition-colors flex flex-col justify-between">
        <div>
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                {experiment.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {experiment.experiment_type.replace("_", " ")}
                </Badge>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => navigate(`/experiments/${experiment.id}`)}
              title="Open Experiment"
              className="shrink-0"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {experiment.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {experiment.description}
              </p>
            )}

            <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Dataset: <strong className="text-foreground">{experiment.dataset_name}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Updated: {formattedDate}</span>
              </div>
            </div>
          </CardContent>
        </div>

        <CardFooter className="border-t border-border/60 pt-3 flex items-center justify-between">
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
        </CardFooter>
      </Card>

      <EditExperimentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        experiment={experiment}
        onUpdated={onUpdated}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Experiment?"
        description={`This will permanently delete "${experiment.name}" and all of its associated data configurations, preprocessing steps, runs, parameters, metrics, and artifacts.\n\nThis action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Experiment"}
        onConfirm={handleDelete}
      />
    </>
  )
}
