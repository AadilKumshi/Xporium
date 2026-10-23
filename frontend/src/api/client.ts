export class ApiError extends Error {
  status: number
  detail: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

export function formatErrorMessage(status: number, data: unknown): string {
  if (!data || typeof data !== "object") {
    return `Request failed with status ${status}`
  }

  const responseData = data as {
    detail?: unknown
    Message?: unknown
    message?: unknown
  }

  if (typeof responseData.detail === "string") {
    return responseData.detail
  }

  if (Array.isArray(responseData.detail)) {
    return responseData.detail
      .map((item) => {
        if (!item || typeof item !== "object") {
          return "field: Invalid value"
        }

        const validationError = item as {
          loc?: unknown[]
          msg?: unknown
        }
        const field =
          validationError.loc && validationError.loc.length > 0
            ? String(validationError.loc[validationError.loc.length - 1])
            : "field"
        return `${field}: ${String(validationError.msg ?? "Invalid value")}`
      })
      .join(", ")
  }

  if (typeof responseData.Message === "string") {
    return responseData.Message
  }

  if (typeof responseData.message === "string") {
    return responseData.message
  }

  return `Request failed with status ${status}`
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("xporium_token")
  const headers = new Headers(options.headers || {})

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem("xporium_token")
    window.dispatchEvent(new Event("xporium:unauthorized"))
  }

  if (response.status === 204) {
    return null as T
  }

  const contentType = response.headers.get("content-type")
  let data: unknown = null
  if (contentType?.includes("application/json")) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else if (contentType?.includes("text/html")) {
    throw new ApiError(
      response.status,
      "Received HTML response from server instead of JSON. Ensure backend is running and the endpoint is properly configured."
    )
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    throw new ApiError(response.status, formatErrorMessage(response.status, data), data)
  }

  return data as T
}
