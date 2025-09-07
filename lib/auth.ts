// Real-time authentication system with localStorage persistence
export interface User {
  id: string
  email: string
  full_name: string
  company?: string
  phone?: string
  role: "admin" | "customer"
  is_active: boolean
  fabrication_status: 0 | 1 | 2 // 0: not visited, 1: visited (checked price), 2: added to cart
  created_at: string
  updated_at: string
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

// Default admin user - hardcoded for initial setup
const DEFAULT_ADMIN: User = {
  id: "admin-1",
  email: "admin@glonix.com",
  full_name: "Admin User",
  company: "Glonix Electronics",
  phone: "+1-555-0100",
  role: "admin",
  is_active: true,
  fabrication_status: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export class AuthService {
  private static readonly TOKEN_KEY = "access_token"
  private static readonly CURRENT_USER_KEY = "current_user"
  private static readonly USERS_KEY = "glonix_users"
  private static readonly ADMIN_PASSWORD = "admin123" // Default admin password

  // Initialize default admin user if not exists
  private static initializeDefaultAdmin(): void {
    if (typeof window === "undefined") return

    const users = this.getAllUsers()
    const adminExists = users.some((user) => user.email === DEFAULT_ADMIN.email)

    if (!adminExists) {
      users.push(DEFAULT_ADMIN)
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    }
  }

  private static getAllUsers(): User[] {
    if (typeof window === "undefined") return []

    const usersData = localStorage.getItem(this.USERS_KEY)
    return usersData ? JSON.parse(usersData) : []
  }

  private static saveUsers(users: User[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
  }

  private static generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    }
    return btoa(JSON.stringify(payload))
  }

  private static setToken(token: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.TOKEN_KEY, token)
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`
  }

  private static removeToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.CURRENT_USER_KEY)
    document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  static async login(data: LoginData): Promise<{ success: boolean; error?: string }> {
    this.initializeDefaultAdmin()

    const users = this.getAllUsers()
    const user = users.find((u) => u.email === data.email && u.is_active)

    if (!user) {
      return { success: false, error: "Invalid email or password" }
    }

    // Check password (admin has hardcoded password, others would need proper hashing)
    const isValidPassword =
      user.email === DEFAULT_ADMIN.email ? data.password === this.ADMIN_PASSWORD : data.password === "password123" // Temporary for demo users

    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" }
    }

    const token = this.generateToken(user)
    this.setToken(token)

    if (typeof window !== "undefined") {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user))
      localStorage.setItem("session_start", Date.now().toString())
    }

    return { success: true }
  }

  static async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    this.initializeDefaultAdmin()

    const users = this.getAllUsers()

    // Check if user already exists
    if (users.some((u) => u.email === data.email)) {
      return { success: false, error: "User with this email already exists" }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      company: data.company,
      phone: data.phone,
      role: "customer",
      is_active: true,
      fabrication_status: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    users.push(newUser)
    this.saveUsers(users)

    const token = this.generateToken(newUser)
    this.setToken(token)

    if (typeof window !== "undefined") {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser))
      localStorage.setItem("session_start", Date.now().toString())
    }

    return { success: true }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (typeof window === "undefined") return null

    const userData = localStorage.getItem(this.CURRENT_USER_KEY)
    if (!userData) return null

    try {
      return JSON.parse(userData)
    } catch {
      return null
    }
  }

  static async verifyToken(): Promise<boolean> {
    if (typeof window === "undefined") return false

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp < currentTime) {
        this.removeToken()
        return false
      }

      return true
    } catch {
      this.removeToken()
      return false
    }
  }

  static logout(): void {
    this.removeToken()

    if (typeof window !== "undefined") {
      localStorage.removeItem("session_start")
      localStorage.removeItem("user_preferences")
      window.location.href = "/"
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false

    const token = localStorage.getItem(this.TOKEN_KEY)
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token))
      const currentTime = Date.now() / 1000

      if (payload.exp && payload.exp < currentTime) {
        this.removeToken()
        return false
      }

      return true
    } catch {
      this.removeToken()
      return false
    }
  }

  static isAdmin(): boolean {
    if (typeof window === "undefined") return false

    const userData = localStorage.getItem(this.CURRENT_USER_KEY)
    if (!userData) return false

    try {
      const user = JSON.parse(userData)
      return user.role === "admin"
    } catch {
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

  static updateFabricationStatus(userId: string, status: 0 | 1 | 2): boolean {
    if (typeof window === "undefined") return false

    try {
      const users = this.getAllUsers()
      const userIndex = users.findIndex((u) => u.id === userId)
      
      if (userIndex === -1) {
        console.error("User not found:", userId)
        return false
      }

      users[userIndex].fabrication_status = status
      users[userIndex].updated_at = new Date().toISOString()
      this.saveUsers(users)

      // Update current user data if it's the same user
      const currentUserData = localStorage.getItem(this.CURRENT_USER_KEY)
      if (currentUserData) {
        try {
          const currentUser = JSON.parse(currentUserData)
          if (currentUser.id === userId) {
            const updatedUser = users[userIndex]
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser))
          }
        } catch (error) {
          console.error("Failed to parse current user data:", error)
        }
      }

      console.log(`Updated fabrication status for user ${userId} to ${status}`)
      return true
    } catch (error) {
      console.error("Failed to update fabrication status:", error)
      return false
    }
  }

  static getUsersByFabricationStatus(status: 0 | 1 | 2): User[] {
    if (typeof window === "undefined") return []
    
    try {
      const users = this.getAllUsers()
      return users.filter((user) => user.fabrication_status === status && user.role === "customer")
    } catch (error) {
      console.error("Failed to get users by fabrication status:", error)
      return []
    }
  }
}
