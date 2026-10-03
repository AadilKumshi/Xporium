import { apiClient } from "./client"
import type { Run, RunCreate, RunUpdate } from "@/types"

export const runsApi = {
  listByExperiment: async (experimentId: number): Promise<Run[]> => {
    return apiClient<Run[]>(`/${experimentId}/runs`)
  },

  getById: async (experimentId: number, runId: number): Promise<Run | null> => {
    const runs = await apiClient<Run[]>(`/${experimentId}/runs`)
    return runs.find((r) => r.id === runId) || null
  },

  create: async (experimentId: number, data: RunCreate): Promise<Run> => {
    return apiClient<Run>(`/${experimentId}/runs`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update: async (runId: number, data: RunUpdate): Promise<Run> => {
    return apiClient<Run>(`/runs/${runId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  delete: async (runId: number): Promise<null> => {
    return apiClient<null>(`/runs/${runId}`, {
      method: "DELETE",
    })
  },
}
