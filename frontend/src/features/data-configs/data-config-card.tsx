import { useState } from "react"
import type { DataConfiguration } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RatioBar } from "@/components/shared/ratio-bar"
import {
  ChevronDown,
  ChevronUp,
  Layers,
  Shuffle,
  Sliders,
  Trash2,
} from "lucide-react"

interface DataConfigCardProps {
  config: DataConfiguration
  onDelete: (config: DataConfiguration) => void
}

export function DataConfigCard({ config, onDelete }: DataConfigCardProps) {
  const [stepsOpen, setStepsOpen] = useState(false)

  const steps = config.preprocessing_steps || []

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">
              {config.name}
            </CardTitle>
            {config.dataset_version && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {config.dataset_version}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              {config.shuffle && (
                <span className="flex items-center gap-1 text-[11px]">
                  <Shuffle className="w-3 h-3" />
                  Shuffle{config.random_seed !== null && ` · Seed ${config.random_seed}`}
                </span>
              )}
              {config.stratified && (
                <span className="flex items-center gap-1 text-[11px] ml-2">
                  <Sliders className="w-3 h-3" /> Stratified
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onDelete(config)}
              title="Delete data configuration"
              className="text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {config.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {config.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Ratio Split */}
        <RatioBar
          trainRatio={config.train_ratio}
          validationRatio={config.validation_ratio}
          testRatio={config.test_ratio}
        />

        {/* Preprocessing Steps Section */}
        <div className="border-t border-border/70 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Layers className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Preprocessing Steps ({steps.length})</span>
            </div>

            {steps.length > 0 && (
              <button
                type="button"
                onClick={() => setStepsOpen(!stepsOpen)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                {stepsOpen ? "Hide" : "Show"}
                {stepsOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {steps.length === 0 ? (
            <p className="text-xs text-muted-foreground mt-1.5 italic">
              No preprocessing steps configured
            </p>
          ) : stepsOpen ? (
            <div className="mt-3 space-y-2">
              {steps
                .sort((a, b) => a.step_order - b.step_order)
                .map((step, idx) => (
                  <div
                    key={step.id || idx}
                    className="p-2.5 rounded-lg border border-border bg-muted/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-semibold text-foreground">
                        {step.step_order}. {step.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 rounded bg-muted border border-border">
                        {step.type}
                      </span>
                    </div>

                    {step.configuration &&
                      Object.keys(step.configuration).length > 0 && (
                        <pre className="text-[11px] font-mono text-muted-foreground bg-background p-1.5 rounded overflow-x-auto">
                          {JSON.stringify(step.configuration, null, 2)}
                        </pre>
                      )}
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
