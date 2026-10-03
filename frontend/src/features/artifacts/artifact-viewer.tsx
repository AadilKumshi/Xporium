import { useState } from "react"
import { artifactsApi } from "@/api/artifacts"
import type { Artifact } from "@/types"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { AttachArtifactDialog } from "./attach-artifact-dialog"
import { Image as ImageIcon, FileText, Trash2, Plus } from "lucide-react"

interface ArtifactViewerProps {
  runId: number
  artifact: Artifact | null
  onUpdated: () => void
}

export function ArtifactViewer({
  runId,
  artifact,
  onUpdated,
}: ArtifactViewerProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [attachOpen, setAttachOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await artifactsApi.delete(runId)
      onUpdated()
    } finally {
      setIsDeleting(false)
    }
  }

  if (!artifact) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-3 bg-card/50">
        <div className="mx-auto w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground">
          <ImageIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-medium text-foreground">
            No Artifacts Attached
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Attach evaluation plots, confusion matrices, loss graphs, or experimental notes.
          </p>
        </div>
        <Button
          onClick={() => setAttachOpen(true)}
          variant="outline"
          size="sm"
          className="text-xs mt-2"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Attach Result
        </Button>

        <AttachArtifactDialog
          open={attachOpen}
          onOpenChange={setAttachOpen}
          runId={runId}
          onAttached={onUpdated}
        />
      </div>
    )
  }

  const hasImage = Boolean(artifact.image_data)
  const hasNote = Boolean(artifact.note && artifact.note.trim())

  const imageSrc = hasImage
    ? `data:${artifact.image_type || "image/png"};base64,${artifact.image_data}`
    : undefined

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-muted-foreground">
              Attached Result & Artifact
            </span>
          </div>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setDeleteOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Remove Artifact
          </Button>
        </div>

        {/* Display image if present */}
        {hasImage && (
          <div className="space-y-1.5">
            {artifact.image_filename && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{artifact.image_filename}</span>
              </div>
            )}
            <div className="rounded-lg border border-border overflow-hidden bg-background max-w-xl">
              <img
                src={imageSrc}
                alt={artifact.image_filename || "Run artifact"}
                className="w-full h-auto max-h-[480px] object-contain mx-auto"
              />
            </div>
          </div>
        )}

        {/* Display note if present */}
        {hasNote && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-background text-sm text-foreground whitespace-pre-line font-mono text-xs">
              {artifact.note}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove Artifact?"
        description="This will permanently delete the attached image and notes for this run. This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete Artifact"}
        onConfirm={handleDelete}
      />
    </>
  )
}
