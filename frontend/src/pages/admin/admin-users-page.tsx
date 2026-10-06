import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminApi } from "@/api/admin"
import { useAuth } from "@/hooks/use-auth"
import type { AdminUser } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Trash2 } from "lucide-react"

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.getUsers,
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] })
      setSelectedUser(null)
    },
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight text-foreground">
          USERS DIRECTORY
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage registered researcher accounts and access roles
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-border p-6 text-center text-xs text-muted-foreground">
          Failed to load users: {(error as any)?.message || "Unknown error"}
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs text-muted-foreground">
                  ID
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Username / Email
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Role
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground">
                  Created
                </TableHead>
                <TableHead className="font-mono text-xs text-muted-foreground text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.username === currentUser?.Username
                const createdDate = new Date(u.created_at).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric", year: "numeric" }
                )

                return (
                  <TableRow key={u.id} className="border-border">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{u.id}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {u.username}
                      {isSelf && (
                        <span className="text-[10px] font-normal text-muted-foreground ml-2">
                          (current user)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] uppercase"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {createdDate}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="xs"
                        disabled={isSelf}
                        onClick={() => {
                          setSelectedUser(u)
                          setDeleteOpen(true)
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-30"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedUser && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete User Account?"
          description={`Are you sure you want to delete user "${selectedUser.username}"? All their experiments, training runs, and artifacts will be permanently purged.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete User"}
          onConfirm={async () => {
            await deleteMutation.mutateAsync(selectedUser.id)
          }}
        />
      )}
    </div>
  )
}
