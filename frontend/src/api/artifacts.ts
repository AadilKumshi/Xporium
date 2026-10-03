import { apiClient } from "./client"
import type { Artifact } from "@/types"

export const artifactsApi = {
  get: async (runId: number): Promise<Artifact | null> => {
    try {
      return await apiClient<Artifact>(`/run/${runId}/artifact`)
    } catch (err: any) {
      if (err.status === 404) {
        return null
      }
      throw err
    }
  },

  create: async (
    runId: number,
    data: { image?: File | null; note?: string | null }
  ): Promise<Artifact> => {
    const formData = new FormData()
    if (data.image) {
      formData.append("image", data.image)
    }
    if (data.note && data.note.trim()) {
      formData.append("note", data.note.trim())
    }

    return apiClient<Artifact>(`/run/${runId}/artifact`, {
      method: "POST",
      body: formData,
    })
  },

  delete: async (runId: number): Promise<null> => {
    return apiClient<null>(`/run/${runId}/artifact`, {
      method: "DELETE",
    })
  },
}
