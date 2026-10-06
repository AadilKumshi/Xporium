import React, { useEffect, useState } from "react"
import { runsApi } from "@/api/runs"
import type {
  DataConfiguration,
  RunCreate,
  TrainingEnvironment,
  ParameterType,
  MetricSplit,
} from "@/types"
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
import { Plus, Trash2, Sliders, BarChart2 } from "lucide-react"

interface CreateRunDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  experimentId: number
  dataConfigs: DataConfiguration[]
  onCreated: () => void
}

interface ParamRow {
  name: string
  value: string
  type: ParameterType
}

interface MetricRow {
  name: string
  value: string
  split: MetricSplit
}

export function CreateRunDialog({
  open,
  onOpenChange,
  experimentId,
  dataConfigs,
  onCreated,
}: CreateRunDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dataConfigId, setDataConfigId] = useState<string>(
    dataConfigs[0]?.id ? String(dataConfigs[0].id) : ""
  )
  useEffect(() => {
    if (!open) {
      return
    }

    const selectedConfigStillExists = dataConfigs.some(
      (config) => String(config.id) === dataConfigId
    )

    if (!selectedConfigStillExists) {
      setDataConfigId(dataConfigs[0]?.id ? String(dataConfigs[0].id) : "")
    }
  }, [open, dataConfigs, dataConfigId])
  const [modelName, setModelName] = useState("")
  const [trainingDuration, setTrainingDuration] = useState("120.0")
  const [environmentType, setEnvironmentType] =
    useState<TrainingEnvironment>("cloud")
  const [environmentSpecs, setEnvironmentSpecs] = useState("")

  const [parameters, setParameters] = useState<ParamRow[]>([
    { name: "Learning Rate", value: "0.001", type: "float" },
    { name: "Batch Size", value: "32", type: "integer" },
  ])

  const [metrics, setMetrics] = useState<MetricRow[]>([
    { name: "Accuracy", value: "0.95", split: "validation" },
  ])

  const handleAddParam = () => {
    setParameters((prev) => [
      ...prev,
      { name: "", value: "", type: "string" },
    ])
  }

  const handleRemoveParam = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index))
  }

  const handleParamChange = (
    index: number,
    field: keyof ParamRow,
    value: any
  ) => {
    setParameters((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const handleAddMetric = () => {
    setMetrics((prev) => [
      ...prev,
      { name: "", value: "", split: "validation" },
    ])
  }

  const handleRemoveMetric = (index: number) => {
    setMetrics((prev) => prev.filter((_, i) => i !== index))
  }

  const handleMetricChange = (
    index: number,
    field: keyof MetricRow,
    value: any
  ) => {
    setMetrics((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!dataConfigId) {
      setError("Please select a data configuration.")
      return
    }

    if (!modelName.trim()) {
      setError("Model name is required.")
      return
    }

    const durationNum = parseFloat(trainingDuration)
    if (isNaN(durationNum) || durationNum < 0) {
      setError("Please enter a valid training duration (>= 0).")
      return
    }

    for (const p of parameters) {
      if (!p.name.trim() || !p.value.trim()) {
        setError("All parameters must have a name and value.")
        return
      }
    }

    for (const m of metrics) {
      if (!m.name.trim() || isNaN(parseFloat(m.value))) {
        setError("All metrics must have a name and numeric value.")
        return
      }
    }

    setLoading(true)
    try {
      const payload: RunCreate = {
        data_config_id: parseInt(dataConfigId, 10),
        model_name: modelName.trim(),
        training_duration: durationNum,
        environment_type: environmentType,
        environment_specs: environmentSpecs.trim() || null,
        parameters: parameters.map((p) => ({
          name: p.name.trim(),
          value: p.value.trim(),
          type: p.type,
        })),
        metrics: metrics.map((m) => ({
          name: m.name.trim(),
          value: parseFloat(m.value),
          split: m.split,
        })),
      }

      await runsApi.create(experimentId, payload)
      onOpenChange(false)
      onCreated()
    } catch (err: any) {
      setError(err.message || "Failed to record run.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Training Run</DialogTitle>
          <DialogDescription>
            Execution Specs, Hyperparameters and Test Results for this Model Run
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-border bg-foreground text-background p-2.5 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="run-dc">
              Data Configuration <span className="text-muted-foreground">*</span>
            </Label>
            <NativeSelect
              id="run-dc"
              className="w-full"
              value={dataConfigId}
              onChange={(e) => setDataConfigId(e.target.value)}
              disabled={loading}
              required
            >
              {dataConfigs.map((cfg) => (
                <NativeSelectOption key={cfg.id} value={String(cfg.id)}>
                  {cfg.name} (Train {Math.round(cfg.train_ratio * 100)}% / Val{" "}
                  {Math.round(cfg.validation_ratio * 100)}%)
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="run-model">
                Model Name <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="run-model"
                placeholder="e.g. SVM, Random Forest"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="run-duration">
                Duration (seconds) <span className="text-muted-foreground">*</span>
              </Label>
              <Input
                id="run-duration"
                type="number"
                step="0.1"
                placeholder="120.0"
                value={trainingDuration}
                onChange={(e) => setTrainingDuration(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="run-env">Environment</Label>
              <NativeSelect
                id="run-env"
                className="w-full"
                value={environmentType}
                onChange={(e) =>
                  setEnvironmentType(e.target.value as TrainingEnvironment)
                }
                disabled={loading}
              >
                <NativeSelectOption value="cloud">Cloud</NativeSelectOption>
                <NativeSelectOption value="local">Local</NativeSelectOption>
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="run-specs">Environment Hardware / Specs</Label>
              <Input
                id="run-specs"
                placeholder="e.g. Colab T4 GPU, RTX 4090"
                value={environmentSpecs}
                onChange={(e) => setEnvironmentSpecs(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Parameters Section */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Hyperparameters ({parameters.length})</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddParam}
                disabled={loading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Parameter
              </Button>
            </div>

            {parameters.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {parameters.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Name"
                      value={p.name}
                      onChange={(e) =>
                        handleParamChange(idx, "name", e.target.value)
                      }
                      className="h-7 text-xs flex-1"
                      disabled={loading}
                    />
                    <Input
                      placeholder="Value"
                      value={p.value}
                      onChange={(e) =>
                        handleParamChange(idx, "value", e.target.value)
                      }
                      className="h-7 text-xs flex-1"
                      disabled={loading}
                    />
                    <NativeSelect
                      value={p.type}
                      onChange={(e) =>
                        handleParamChange(
                          idx,
                          "type",
                          e.target.value as ParameterType
                        )
                      }
                      size="sm"
                      className="w-24 shrink-0"
                      disabled={loading}
                    >
                      <NativeSelectOption value="string">String</NativeSelectOption>
                      <NativeSelectOption value="float">Float</NativeSelectOption>
                      <NativeSelectOption value="integer">Integer</NativeSelectOption>
                      <NativeSelectOption value="boolean">Boolean</NativeSelectOption>
                    </NativeSelect>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveParam(idx)}
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metrics Section */}
          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <BarChart2 className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Evaluation Metrics ({metrics.length})</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleAddMetric}
                disabled={loading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Metric
              </Button>
            </div>

            {metrics.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {metrics.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Metric"
                      value={m.name}
                      onChange={(e) =>
                        handleMetricChange(idx, "name", e.target.value)
                      }
                      className="h-7 text-xs flex-1"
                      disabled={loading}
                    />
                    <Input
                      placeholder="Value"
                      type="number"
                      step="any"
                      value={m.value}
                      onChange={(e) =>
                        handleMetricChange(idx, "value", e.target.value)
                      }
                      className="h-7 text-xs flex-1"
                      disabled={loading}
                    />
                    <NativeSelect
                      value={m.split}
                      onChange={(e) =>
                        handleMetricChange(
                          idx,
                          "split",
                          e.target.value as MetricSplit
                        )
                      }
                      size="sm"
                      className="w-28 shrink-0"
                      disabled={loading}
                    >
                      <NativeSelectOption value="train">Train</NativeSelectOption>
                      <NativeSelectOption value="validation">Validation</NativeSelectOption>
                      <NativeSelectOption value="test">Test</NativeSelectOption>
                    </NativeSelect>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleRemoveMetric(idx)}
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
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
              disabled={loading}
            >
              {loading && <Spinner className="w-4 h-4 mr-2" />}
              {loading ? "Recording..." : "Record Run"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
