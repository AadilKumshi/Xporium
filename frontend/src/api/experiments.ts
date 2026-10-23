import { apiClient } from "./client"
import type {
  Experiment,
  ExperimentCreate,
  ExperimentUpdate,
  DataConfiguration,
  DataConfigurationCreate,
  LibraryExperiment,
  ShareCode,
} from "@/types"

export const experimentsApi = {
  list: async (): Promise<Experiment[]> => {
    return apiClient<Experiment[]>("/experiments/")
  },

  getById: async (id: number): Promise<Experiment | null> => {
    // Backend doesn't have a single GET /experiments/{id}, it provides GET /experiments/
    const all = await apiClient<Experiment[]>("/experiments/")
    return all.find((e) => e.id === id) || null
  },

  create: async (data: ExperimentCreate): Promise<Experiment> => {
    return apiClient<Experiment>("/experiments/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  update: async (
    id: number,
    data: ExperimentUpdate
  ): Promise<Experiment> => {
    return apiClient<Experiment>(`/experiments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  delete: async (id: number): Promise<null> => {
    return apiClient<null>(`/experiments/${id}`, {
      method: "DELETE",
    })
  },

  createShareCode: async (id: number): Promise<ShareCode> => {
    return apiClient<ShareCode>(`/experiments/${id}/share`, { method: "POST" })
  },

  listLibrary: async (): Promise<LibraryExperiment[]> => {
    return apiClient<LibraryExperiment[]>("/experiments/library")
  },

  redeemShareCode: async (code: string): Promise<LibraryExperiment> => {
    return apiClient<LibraryExperiment>("/experiments/library", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  },

  getLibraryById: async (id: number): Promise<Experiment | null> => {
    return apiClient<Experiment>(`/experiments/library/${id}`)
  },

  listLibraryDataConfigs: async (id: number): Promise<DataConfiguration[]> => {
    return apiClient<DataConfiguration[]>(
      `/experiments/library/${id}/data-configurations`
    )
  },

  listDataConfigs: async (
    experimentId: number
  ): Promise<DataConfiguration[]> => {
    return apiClient<DataConfiguration[]>(
      `/experiments/${experimentId}/data-configurations`
    )
  },

  createDataConfig: async (
    experimentId: number,
    data: DataConfigurationCreate
  ): Promise<DataConfiguration> => {
    return apiClient<DataConfiguration>(
      `/experiments/${experimentId}/data-configurations`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    )
  },

  deleteDataConfig: async (
    experimentId: number,
    dataConfigId: number
  ): Promise<null> => {
    return apiClient<null>(
      `/experiments/${experimentId}/data-configurations/${dataConfigId}`,
      {
        method: "DELETE",
      }
    )
  },
}
