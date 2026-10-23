interface RatioBarProps {
  trainRatio: number
  validationRatio: number
  testRatio: number
  className?: string
}

export function RatioBar({
  trainRatio,
  validationRatio,
  testRatio,
  className = "",
}: RatioBarProps) {
  const trainPct = Math.round(trainRatio * 100)
  const valPct = Math.round(validationRatio * 100)
  const testPct = Math.round(testRatio * 100)

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex h-2 w-full overflow-hidden rounded border border-border bg-muted">
        {trainPct > 0 && (
          <div
            style={{ width: `${trainPct}%` }}
            className="bg-foreground"
            title={`Train: ${trainPct}%`}
          />
        )}
        {valPct > 0 && (
          <div
            style={{ width: `${valPct}%` }}
            className="bg-muted-foreground"
            title={`Validation: ${valPct}%`}
          />
        )}
        {testPct > 0 && (
          <div
            style={{ width: `${testPct}%` }}
            className="bg-border"
            title={`Test: ${testPct}%`}
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Train: {trainPct}%</span>
        <span>Val: {valPct}%</span>
        <span>Test: {testPct}%</span>
      </div>
    </div>
  )
}
