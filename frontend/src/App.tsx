import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/components/theme-provider"
import { ProtectedRoute, AdminRoute } from "@/components/layout/protected-route"
import { AppLayout } from "@/components/layout/app-layout"
import { AdminLayout } from "@/components/layout/admin-layout"

import { LoginPage } from "@/pages/login-page"
import { RegisterPage } from "@/pages/register-page"
import { ExperimentsPage } from "@/pages/experiments-page"
import { ExperimentDetailPage } from "@/pages/experiment-detail-page"
import { RunDetailPage } from "@/pages/run-detail-page"
import { AdminOverviewPage } from "@/pages/admin/admin-overview-page"
import { AdminUsersPage } from "@/pages/admin/admin-users-page"
import { AdminExperimentsPage } from "@/pages/admin/admin-experiments-page"
import { AdminRunsPage } from "@/pages/admin/admin-runs-page"
import { NotFoundPage } from "@/pages/not-found-page"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="xporium_theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated workspace routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/experiments" replace />} />
                <Route path="/experiments" element={<ExperimentsPage />} />
                <Route
                  path="/experiments/:id"
                  element={<ExperimentDetailPage />}
                />
                <Route
                  path="/experiments/:id/runs/:runId"
                  element={<RunDetailPage />}
                />

                {/* Admin sub-routes */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminOverviewPage />} />
                    <Route path="/admin/users" element={<AdminUsersPage />} />
                    <Route
                      path="/admin/experiments"
                      element={<AdminExperimentsPage />}
                    />
                    <Route path="/admin/runs" element={<AdminRunsPage />} />
                  </Route>
                </Route>
              </Route>
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
