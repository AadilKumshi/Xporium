import React, { useState, useEffect } from "react"
import { experimentsApi } from "@/api/experiments"
import { diffChanges } from "@/lib/diff"
import type { Experiment, ExperimentType } from "@/types"
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
import { Textarea } from "@/components/ui/textarea"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"

interface EditExperimentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experiment: Experiment
  onUpdated: () => void
}

const EXPERIMENT_TYPES: { value: ExperimentType; label: string }[] = [
  { value: "classification", label: "Classification" },
  { value: "regression", label: "Regression" },
  { value: "clustering", label: "Clustering" },
  { value: "dimensionality_reduction", label: "Dimensionality Reduction" },
  { value: "anomaly_detection", label: "Anomaly Detection" },
  { value: "generation", label: "Generation" },
  { value: "other", label: "Other" },
]

export function EditExperimentDialog({
  open,
  onOpenChange,
  experiment,
  onUpdated,
}: EditExperimentDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initialValues = {
    name: experiment.name,
    dataset_name: experiment.dataset_name,
    experiment_type: experiment.experiment_type,
    description: experiment.description || "",
    dataset_public_url: experiment.dataset_public_url || "",
    project_url: experiment.project_url || "",
  }

  const [formData, setFormData] = useState(initialValues)

  useEffect(() => {
    setFormData({
      name: experiment.name,
      dataset_name: experiment.dataset_name,
      experiment_type: experiment.experiment_type,
      description: experiment.description || "",
      dataset_public_url: experiment.dataset_public_url || "",
      project_url: experiment.project_url || "",
    })
    setError(null)
  }, [experiment, open])

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
      await experimentsApi.update(experiment.id, partialUpdate)
      onOpenChange(false)
      onUpdated()
    } catch (err: any) {
      setError(err.message || "Failed to update experiment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Experiment</DialogTitle>
          <DialogDescription>
            Update experiment metadata. Only changed attributes will be saved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-exp-name">Name</Label>
            <Input
              id="edit-exp-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-dataset">Dataset Name</Label>
              <Input
                id="edit-exp-dataset"
                value={formData.dataset_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dataset_name: e.target.value,
                  }))
                }
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-type">Type</Label>
              <NativeSelect
                id="edit-exp-type"
                className="w-full"
                value={formData.experiment_type}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experiment_type: e.target.value as ExperimentType,
                  }))
                }
                disabled={loading}
              >
                {EXPERIMENT_TYPES.map((t) => (
                  <NativeSelectOption key={t.value} value={t.value}>
                    {t.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-exp-desc">Description</Label>
            <Textarea
              id="edit-exp-desc"
              rows={2}
              value={formData.description}
              className="h-40 min-h-40 max-h-40 resize-none overflow-x-hidden overflow-y-auto"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-dataset-url">Dataset URL</Label>
              <Input
                id="edit-exp-dataset-url"
                type="url"
                value={formData.dataset_public_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dataset_public_url: e.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-exp-notebook-url">Notebook URL</Label>
              <Input
                id="edit-exp-notebook-url"
                type="url"
                value={formData.project_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    project_url: e.target.value,
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
