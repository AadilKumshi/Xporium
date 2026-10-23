import React, { useState, useEffect } from "react"
import { runsApi } from "@/api/runs"
import { diffChanges } from "@/lib/diff"
import type { Run, TrainingEnvironment } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"

interface EditRunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  run: Run
  onUpdated: () => void
}

export function EditRunDialog({
  open,
  onOpenChange,
  run,
  onUpdated,
}: EditRunDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialValues = {
    model_name: run.model_name,
    training_duration: run.training_duration,
    environment_type: run.environment_type,
    environment_specs: run.environment_specs || "",
  }

  const [formData, setFormData] = useState(initialValues)

  useEffect(() => {
    setFormData({
      model_name: run.model_name,
      training_duration: run.training_duration,
      environment_type: run.environment_type,
      environment_specs: run.environment_specs || "",
    })
    setError(null)
  }, [run, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const partialUpdate = diffChanges(initialValues, formData)

    if (Object.keys(partialUpdate).length === 0) {
      onOpenChange(false)
      return
    }

    setLoading(true)
    try {
      await runsApi.update(run.id, partialUpdate)
      onOpenChange(false)
      onUpdated()
    } catch (err: any) {
      setError(err.message || "Failed to update run.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Run #{run.id}</DialogTitle>
          <DialogDescription>
            Update training execution parameters. Only changed fields will be submitted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-model-name">Model Name</Label>
            <Input
              id="edit-model-name"
              value={formData.model_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, model_name: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-duration">Training Duration (seconds)</Label>
            <Input
              id="edit-duration"
              type="number"
              step="0.1"
              value={formData.training_duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  training_duration: parseFloat(e.target.value) || 0,
                }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-env-type">Environment</Label>
              <NativeSelect
                id="edit-env-type"
                className="w-full"
                value={formData.environment_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    environment_type: e.target.value as TrainingEnvironment,
                  }))
                }
                disabled={loading}
              >
                <NativeSelectOption value="cloud">Cloud</NativeSelectOption>
                <NativeSelectOption value="local">Local</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-env-specs">Hardware Specs</Label>
              <Input
                id="edit-env-specs"
                value={formData.environment_specs}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    environment_specs: e.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
