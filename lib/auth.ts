// Authentication utilities for frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface User {
  id: string
  email: string
  full_name: string
  company?: string
  phone?: string
  created_at: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  company?: string
  phone?: string
}

export class AuthService {
  private static readonly TOKEN_KEY = "access_token"
  private static readonly REFRESH_KEY = "refresh_token"
  private static readonly MAX_RETRY_ATTEMPTS = 3
  private static readonly RETRY_DELAY = 1000

  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  private static setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
      // Set cookie for middleware
      const maxAge = 30 * 24 * 60 * 60 // 30 days
      document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure=${location.protocol === "https:"}`
    }
  }

  private static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.REFRESH_KEY)
      // Clear cookie
      document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
  }

  private static async makeRequest(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })
      return response
    } catch (error) {
      if (retryCount < this.MAX_RETRY_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1)))
        return this.makeRequest(url, options, retryCount + 1)
      }
      throw error
    }
  }

  static async login(data: LoginData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        this.setToken(result.access_token)

        if (typeof window !== "undefined") {
          localStorage.setItem("session_start", Date.now().toString())
        }

        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error. Please check your connection." }
    }
  }

  static async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        this.setToken(result.access_token)

        if (typeof window !== "undefined") {
          localStorage.setItem("session_start", Date.now().toString())
        }

        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.detail || "Registration failed" }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error. Please check your connection." }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await this.makeRequest(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        return await response.json()
      } else if (response.status === 401) {
        // Token expired or invalid
        this.removeToken()
        return null
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("Get current user error:", error)
      this.removeToken()
      return null
    }
  }

  static async verifyToken(): Promise<boolean> {
    const token = this.getToken()
    if (!token) return false

    try {
      const response = await this.makeRequest(`${API_BASE_URL}/auth/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        return true
      } else if (response.status === 401) {
        this.removeToken()
        return false
      } else {
        return false
      }
    } catch (error) {
      console.error("Token verification error:", error)
      this.removeToken()
      return false
    }
  }

  static logout(): void {
    this.removeToken()

    if (typeof window !== "undefined") {
      // Clear all auth-related storage
      localStorage.removeItem("session_start")
      localStorage.removeItem("user_preferences")

      // Redirect to home page
      window.location.href = "/"
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp < currentTime) {
        this.removeToken()
        return false
      }

      return true
    } catch (error) {
      // Invalid token format
      this.removeToken()
      return false
    }
  }

  static getSessionDuration(): number {
    if (typeof window === "undefined") return 0

    const sessionStart = localStorage.getItem("session_start")
    if (!sessionStart) return 0

    return Date.now() - Number.parseInt(sessionStart)
  }

  static isSessionExpired(): boolean {
    const maxSessionDuration = 24 * 60 * 60 * 1000 // 24 hours
    return this.getSessionDuration() > maxSessionDuration
  }
}
