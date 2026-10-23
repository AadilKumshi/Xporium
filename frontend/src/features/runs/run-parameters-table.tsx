import type { Parameter } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface RunParametersTableProps {
  parameters: Parameter[]
}

export function RunParametersTable({ parameters }: RunParametersTableProps) {
  if (parameters.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
        No hyperparameters logged for this run.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-mono text-xs text-muted-foreground">
              Parameter
            </TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground">
              Value
            </TableHead>
            <TableHead className="font-mono text-xs text-muted-foreground text-right">
              Type
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((param, idx) => (
            <TableRow key={param.id || idx} className="border-border">
              <TableCell className="font-mono text-xs font-semibold text-foreground">
                {param.name}
              </TableCell>
              <TableCell className="font-mono text-xs text-foreground">
                {param.value}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase text-muted-foreground"
                >
                  {param.type}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
