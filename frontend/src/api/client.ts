export class ApiError extends Error {
  status: number
  detail: any

  constructor(status: number, message: string, detail?: any) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

export function formatErrorMessage(status: number, data: any): string {
  if (!data) {
    return `Request failed with status ${status}`
  }

  if (typeof data.detail === "string") {
    return data.detail
  }

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: any) => {
        const field = item.loc ? item.loc[item.loc.length - 1] : "field"
        return `${field}: ${item.msg}`
      })
      .join(", ")
  }

  if (typeof data.Message === "string") {
    return data.Message
  }

  if (typeof data.message === "string") {
    return data.message
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

  const response = await fetch(endpoint, {
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
  let data: any = null
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json()
    } catch {
      data = null
    }
  } else if (contentType && contentType.includes("text/html")) {
    throw new ApiError(
      response.status,
      "Received HTML response from server instead of JSON. Ensure backend is running and the endpoint is properly configured.",
      null
    )
  } else {
    data = await response.text()
  }

  if (!response.ok) {
    const message = formatErrorMessage(response.status, data)
    throw new ApiError(response.status, message, data)
  }

  return data as T
}
