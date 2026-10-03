import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground text-center">
      <h1 className="text-4xl font-mono font-bold">404</h1>
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-1">
        Page Not Found
      </p>
      <p className="text-sm text-muted-foreground mt-4 max-w-sm">
        The requested URL was not found in the Xporium workspace.
      </p>
      <Link to="/experiments">
        <Button variant="outline" className="mt-6 text-xs">
          Return to Experiments
        </Button>
      </Link>
    </div>
  )
}
