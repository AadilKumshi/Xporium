import { useEffect, useState } from "react"
import { experimentsApi } from "@/api/experiments"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { Experiment, ShareCode } from "@/types"

interface ShareExperimentDialogProps {
  experiment: Experiment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareExperimentDialog({
  experiment,
  open,
  onOpenChange,
}: ShareExperimentDialogProps) {
  const [shareCode, setShareCode] = useState<ShareCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateCode = async () => {
    setLoading(true)
    setError(null)
    try {
      setShareCode(await experimentsApi.createShareCode(experiment.id))
    } catch (err: any) {
      setError(err.message || "Failed to generate a share code.")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  useEffect(() => {
    if (open) {
      setShareCode(null)
      setError(null)
      void generateCode()
    }
  }, [open, experiment.id])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Experiment</DialogTitle>
          <DialogDescription>
            Anyone with this Code can add a Read-Only copy of {experiment.name} to their Library
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
            <Spinner className="w-4 h-4" />
            Generating share code...
          </div>
        ) : shareCode ? (
          <div className="space-y-2 text-center">
            <p className="text-xs text-muted-foreground">Share this code</p>
            <p className="font-mono text-3xl font-bold tracking-[0.35em]">
              {shareCode.code}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(shareCode.expires_at).toLocaleString()}
            </p>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
