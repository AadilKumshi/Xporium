import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react"
import { authApi } from "@/api/auth"
import type { User } from "@/types"

interface AuthContextType {
  token: string | null
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  login: (token: string) => Promise<void>
  logout: () => void
  refetchUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("xporium_token")
  )
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchUser = useCallback(async () => {
    const currentToken = localStorage.getItem("xporium_token")
    if (!currentToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      const userData = await authApi.getMe()
      setUser(userData)
    } catch {
      localStorage.removeItem("xporium_token")
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()

    const handleUnauthorized = () => {
      setToken(null)
      setUser(null)
    }

    window.addEventListener("xporium:unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("xporium:unauthorized", handleUnauthorized)
    }
  }, [fetchUser])

  const login = async (newToken: string) => {
    localStorage.setItem("xporium_token", newToken)
    setToken(newToken)
    setIsLoading(true)
    await fetchUser()
  }

  const logout = () => {
    localStorage.removeItem("xporium_token")
    setToken(null)
    setUser(null)
  }

  const isAdmin = user?.Role === "admin"

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoading,
        isAdmin,
        login,
        logout,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
