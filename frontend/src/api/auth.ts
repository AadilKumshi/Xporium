import { apiClient } from "./client"
import type { User } from "@/types"

export interface LoginResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const params = new URLSearchParams()
    params.append("username", username)
    params.append("password", password)

    return apiClient<LoginResponse>("/login", {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  },

  register: async (username: string, password: string): Promise<{ Message: string }> => {
    const params = new URLSearchParams()
    params.append("username", username)
    params.append("password", password)

    return apiClient<{ Message: string }>("/create_user", {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  },

  getMe: async (): Promise<User> => {
    return apiClient<User>("/users/me", {
      method: "GET",
    })
  },

  deleteAccount: async (): Promise<{ Message: string }> => {
    return apiClient<{ Message: string }>("/delete_user", {
      method: "DELETE",
    })
  },
}
