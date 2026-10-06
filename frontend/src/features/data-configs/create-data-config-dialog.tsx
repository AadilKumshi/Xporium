import React, { useEffect, useState } from "react"
import { experimentsApi } from "@/api/experiments"
import { validateRatios } from "./ratio-validator"
import type { DataConfigurationCreate, PreprocessingStep } from "@/types"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Trash2, Sliders } from "lucide-react"

interface CreateDataConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: number
  onCreated: () => void
}

export function CreateDataConfigDialog({
  open,
  onOpenChange,
  experimentId,
  onCreated,
}: CreateDataConfigDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [datasetVersion, setDatasetVersion] = useState("")
  const [description, setDescription] = useState("")

  const [trainRatio, setTrainRatio] = useState<number>(0.8)
  const [validationRatio, setValidationRatio] = useState<number>(0.2)
  const [testRatio, setTestRatio] = useState<number>(0.0)

  const [shuffle, setShuffle] = useState(true)
  const [randomSeed, setRandomSeed] = useState<string>("42")
  const [stratified, setStratified] = useState(false)

  const [steps, setSteps] = useState<PreprocessingStep[]>([])
  const [configurationText, setConfigurationText] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!open) {
      return
    }

    setSteps([])
    setConfigurationText({})
  }, [open])

  const ratioCheck = validateRatios(trainRatio, validationRatio, testRatio)

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        name: "",
        type: "",
        configuration: {},
        step_order: prev.length + 1,
      },
    ])
    setConfigurationText((prev) => ({ ...prev, [steps.length]: "" }))
  }

  const handleRemoveStep = (index: number) => {
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((step, idx) => ({ ...step, step_order: idx + 1 }))
    )
    setConfigurationText((prev) =>
      Object.fromEntries(
        Object.entries(prev)
          .filter(([key]) => Number(key) !== index)
          .map(([key, value]) => {
            const oldIndex = Number(key)
            return [oldIndex > index ? oldIndex - 1 : oldIndex, value]
          })
      )
    )
  }

  const handleStepChange = (
    index: number,
    field: keyof PreprocessingStep,
    value: any
  ) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, [field]: value } : step))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Configuration name is required.")
      return
    }

    if (!ratioCheck.valid) {
      setError(ratioCheck.message || "Ratios must equal 100%.")
      return
    }

    for (const step of steps) {
      if (!step.name.trim() || !step.type.trim()) {
        setError("All preprocessing steps must have a name and type.")
        return
      }
    }

    for (const [index, value] of Object.entries(configurationText)) {
      if (!value.trim()) {
        continue
      }

      try {
        JSON.parse(value)
      } catch {
        setError(`Preprocessing step ${Number(index) + 1} has invalid JSON configuration.`)
        return
      }
    }

    setLoading(true)
    try {
      const payload: DataConfigurationCreate = {
        name: name.trim(),
        dataset_version: datasetVersion.trim() || null,
        description: description.trim() || null,
        train_ratio: trainRatio,
        validation_ratio: validationRatio,
        test_ratio: testRatio,
        shuffle,
        random_seed: randomSeed.trim() ? parseInt(randomSeed, 10) : null,
        stratified,
        preprocessing_steps: steps.map((s) => ({
          name: s.name.trim(),
          type: s.type.trim(),
          configuration: s.configuration || null,
          step_order: s.step_order,
        })),
      }

      await experimentsApi.createDataConfig(experimentId, payload)
      onOpenChange(false)
      onCreated()
    } catch (err: any) {
      setError(err.message || "Failed to create data configuration.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Dataset Configuration</DialogTitle>
          <DialogDescription>
            Record how the dataset was partitioned and prepared.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dc-name">
                Configuration Name <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="dc-name"
                placeholder=""
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dc-version">Dataset Version</Label>
              <Input
                id="dc-version"
                placeholder=""
                value={datasetVersion}
                onChange={(e) => setDatasetVersion(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dc-desc">Description</Label>
            <Textarea
              id="dc-desc"
              rows={2}
              placeholder="Notes on Data Preprocessing, Filtering or Source..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Ratios */}
          <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">
                Data Split Ratios
              </Label>
              <span
                className={`text-xs font-mono font-medium ${
                  ratioCheck.valid ? "text-foreground" : "text-muted-foreground underline"
                }`}
              >
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <Label htmlFor="train-ratio" className="text-[11px] text-muted-foreground">
                  Train 
                </Label>
                <Input
                  id="train-ratio"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={trainRatio}
                  onChange={(e) => setTrainRatio(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="val-ratio" className="text-[11px] text-muted-foreground">
                  Val 
                </Label>
                <Input
                  id="val-ratio"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={validationRatio}
                  onChange={(e) =>
                    setValidationRatio(parseFloat(e.target.value) || 0)
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="test-ratio" className="text-[11px] text-muted-foreground">
                  Test 
                </Label>
                <Input
                  id="test-ratio"
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={testRatio}
                  onChange={(e) => setTestRatio(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>
            </div>

            {!ratioCheck.valid && (
              <p className="text-[11px] text-muted-foreground">
                {ratioCheck.message}
              </p>
            )}
          </div>

          {/* Shuffle, Stratify, Seed */}
          <div className="grid grid-cols-3 gap-3 items-center pt-1">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffle"
                checked={shuffle}
                onCheckedChange={(checked) => setShuffle(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="shuffle" className="text-xs cursor-pointer">
                Shuffle
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="stratified"
                checked={stratified}
                onCheckedChange={(checked) => setStratified(!!checked)}
                disabled={loading}
              />
              <Label htmlFor="stratified" className="text-xs cursor-pointer">
                Stratified
              </Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="seed" className="text-[11px]">
                Seed
              </Label>
              <Input
                id="seed"
                type="number"
                placeholder="42"
                value={randomSeed}
                onChange={(e) => setRandomSeed(e.target.value)}
                disabled={loading}
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* Preprocessing Steps Dynamic Builder */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Preprocessing Steps</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddStep}
                disabled={loading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Step
              </Button>
            </div>

            {steps.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                Optional: Add preprocessing operations (e.g. Tokenization, Resizing, Scaling).
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded border border-border bg-muted/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">
                        #{step.step_order}
                      </span>
                      <Input
                        placeholder="Step Name (e.g. Scaling)"
                        value={step.name}
                        onChange={(e) =>
                          handleStepChange(idx, "name", e.target.value)
                        }
                        className="h-7 text-xs"
                        disabled={loading}
                      />
                      <Input
                        placeholder="Type (e.g. Normalization)"
                        value={step.type}
                        onChange={(e) =>
                          handleStepChange(idx, "type", e.target.value)
                        }
                        className="h-7 text-xs"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveStep(idx)}
                        disabled={loading}
                      >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>

                    <Input
                      placeholder='Config JSON, e.g. {"width": 224, "height": 224}'
                      value={configurationText[idx] ?? ""}
                      onChange={(e) => {
                        const value = e.target.value
                        setConfigurationText((prev) => ({
                          ...prev,
                          [idx]: value,
                        }))
                        try {
                          const parsed = value
                            ? JSON.parse(value)
                            : {}
                          handleStepChange(idx, "configuration", parsed)
                        } catch {
                          // Keep the raw input until it becomes valid JSON.
                        }
                      }}
                      className="h-7 font-mono text-[11px]"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading || !ratioCheck.valid}
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              {loading ? "Adding..." : "Add Configuration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
