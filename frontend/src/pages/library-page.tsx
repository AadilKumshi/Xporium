import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { experimentsApi } from "@/api/experiments"
import { ExperimentCard } from "@/features/experiments/experiment-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LibraryBig, Plus, Search } from "lucide-react"

export function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data: library = [], isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: experimentsApi.listLibrary,
  })
  const redeemMutation = useMutation({
    mutationFn: () => experimentsApi.redeemShareCode(code),
    onSuccess: () => {
      setCode("")
      setError(null)
      setRedeemOpen(false)
      queryClient.invalidateQueries({ queryKey: ["library"] })
    },
    onError: (err: any) => setError(err.message || "Failed to add experiment."),
  })
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return library
    return library.filter(
      (experiment) =>
        experiment.name.toLowerCase().includes(query) ||
        experiment.owner_username.toLowerCase().includes(query) ||
        experiment.dataset_name.toLowerCase().includes(query)
    )
  }, [library, searchQuery])

  return (
    <div className="p-8 max-w-6xl w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-mono">LIBRARY</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Experiments shared with you
          </p>
        </div>
        <Button onClick={() => setRedeemOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add with Code
        </Button>
      </div>


      {library.length > 0 && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter Library by Name, Owner, or Dataset..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="max-w-md bg-card pl-9"
          />
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading library...</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<LibraryBig className="w-10 h-10 text-muted-foreground" />}
          title={library.length ? "No matches" : "Your library is empty"}
          description={
            library.length
              ? "Try a different search."
              : "Ask a friend for a six-digit sharing code to add an experiment."
          }
          actionLabel="Add with Code"
          onAction={() => setRedeemOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((experiment) => (
            <div key={experiment.id} className="space-y-1">
              <ExperimentCard
                experiment={experiment}
                readOnly
                onUpdated={() => undefined}
              />
              <p className="px-2 text-[11px] text-muted-foreground">
                Shared by {experiment.owner_username}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to Library</DialogTitle>
            <DialogDescription>
              Enter the six-digit code your friend shared with you. Codes expire
              after 180 minutes.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Input
            value={code}
            maxLength={6}
            inputMode="numeric"
            placeholder="123456"
            className="font-mono tracking-[0.3em]"
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={code.length !== 6 || redeemMutation.isPending}
              onClick={() => redeemMutation.mutate()}
            >
              {redeemMutation.isPending ? "Adding..." : "Add Experiment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
