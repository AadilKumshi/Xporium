import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { experimentsApi } from "@/api/experiments"
import type { ExperimentCreate, ExperimentType } from "@/types"
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

interface CreateExperimentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
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

export function CreateExperimentDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateExperimentDialogProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    name: string
    dataset_name: string
    experiment_type: ExperimentType
    description: string
    dataset_public_url: string
    project_url: string
  }>({
    name: "",
    dataset_name: "",
    experiment_type: "classification",
    description: "",
    dataset_public_url: "",
    project_url: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim() || !formData.dataset_name.trim()) {
      setError("Experiment name and dataset name are required.")
      return
    }

    setLoading(true)
    try {
      const payload: ExperimentCreate = {
        name: formData.name.trim(),
        dataset_name: formData.dataset_name.trim(),
        experiment_type: formData.experiment_type,
        description: formData.description.trim() || null,
        dataset_public_url: formData.dataset_public_url.trim() || null,
        project_url: formData.project_url.trim() || null,
      }

      const created = await experimentsApi.create(payload)
      onOpenChange(false)
      if (onCreated) {
        onCreated()
      }
      navigate(`/experiments/${created.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create experiment.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Experiment</DialogTitle>
          <DialogDescription>
            Initialize a new Machine Learning Experiment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="exp-name">
              Experiment Name <span className="text-muted-foreground">*</span>
            </Label>
            <Input
              id="exp-name"
              placeholder=""
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
              <Label htmlFor="exp-dataset">
                Dataset Name <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="exp-dataset"
                placeholder=""
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
              <Label htmlFor="exp-type">Type</Label>
              <NativeSelect
                id="exp-type"
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
            <Label htmlFor="exp-desc">Description</Label>
            <Textarea
              id="exp-desc"
              rows={2}
              placeholder="Hypothesis, Baseline Expectations, Notes..."
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
              <Label htmlFor="exp-dataset-url">Dataset URL</Label>
              <Input
                id="exp-dataset-url"
                type="url"
                placeholder="https://..."
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
              <Label htmlFor="exp-notebook-url">Notebook / Code URL</Label>
              <Input
                id="exp-notebook-url"
                type="url"
                placeholder="https://github.com/..."
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
              {loading ? "Creating..." : "Create Experiment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
