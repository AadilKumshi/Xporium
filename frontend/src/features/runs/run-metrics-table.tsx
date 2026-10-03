import type { Metric } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RunMetricsTableProps {
  metrics: Metric[]
}

export function RunMetricsTable({ metrics }: RunMetricsTableProps) {
  if (metrics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        No evaluation metrics recorded for this run.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-xs text-muted-foreground">
              Metric
            </TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">
              Value
            </TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">
              Split
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric, idx) => (
            <TableRow key={metric.id || idx} className="border-border">
              <TableCell className="font-mono text-xs font-semibold text-foreground">
                {metric.name}
              </TableCell>
              <TableCell className="font-mono text-xs text-foreground font-semibold">
                {metric.value}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase text-muted-foreground"
                >
                  {metric.split}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
