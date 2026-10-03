import React, { useState } from "react"
import { artifactsApi } from "@/api/artifacts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"

interface AttachArtifactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  runId: number
  onAttached: () => void
}

export function AttachArtifactDialog({
  open,
  onOpenChange,
  runId,
  onAttached,
}: AttachArtifactDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [note, setNote] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedFile && !note.trim()) {
      setError("Please provide at least an image file or a note.")
      return
    }

    setLoading(true)
    try {
      await artifactsApi.create(runId, {
        image: selectedFile,
        note: note.trim() || null,
      })
      onOpenChange(false)
      onAttached()
    } catch (err: any) {
      setError(err.message || "Failed to upload artifact.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Attach Result / Artifact</DialogTitle>
          <DialogDescription>
            Attach visual outputs (plots, charts) and analytical notes to this run.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="artifact-image">Plot / Image File</Label>
            <div className="border border-input rounded-lg p-3 bg-muted/20">
              <input
                id="artifact-image"
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                disabled={loading}
                className="text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border file:border-border file:text-xs file:bg-background file:text-foreground hover:file:bg-muted cursor-pointer"
              />
              {selectedFile && (
                <p className="text-[11px] text-muted-foreground mt-2 truncate font-mono">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="artifact-note">Analysis / Observations Note</Label>
            <Textarea
              id="artifact-note"
              rows={3}
              placeholder="e.g. Validation accuracy plateaued after epoch 6. Best weights saved."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-foreground text-background hover:bg-foreground/90 font-medium"
              disabled={loading}
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              {loading ? "Attaching..." : "Attach Result"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
