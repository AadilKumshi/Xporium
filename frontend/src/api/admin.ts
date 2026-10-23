import { apiClient } from "./client"
import type { AdminOverview, AdminUser, Experiment, Run } from "@/types"

export const adminApi = {
  getOverview: async (): Promise<AdminOverview> => {
    return apiClient<AdminOverview>("/admin/overview")
  },

  getUsers: async (): Promise<AdminUser[]> => {
    return apiClient<AdminUser[]>("/admin/users")
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/admin/users/${userId}`, {
      method: "DELETE",
    })
  },

  getExperiments: async (): Promise<Experiment[]> => {
    return apiClient<Experiment[]>("/admin/experiments")
  },

  deleteExperiment: async (
    experimentId: number
  ): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/admin/experiments/${experimentId}`, {
      method: "DELETE",
    })
  },

  getRuns: async (): Promise<Run[]> => {
    return apiClient<Run[]>("/admin/runs")
  },

  deleteRun: async (runId: number): Promise<{ message: string }> => {
    return apiClient<{ message: string }>(`/admin/runs/${runId}`, {
      method: "DELETE",
    })
  },
}
