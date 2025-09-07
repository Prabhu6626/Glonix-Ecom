import type { AdminStats, Order, Product, User, ProductFormData, UserFormData } from "./types"
import { DataService } from "./mock-data"

// Ensure data structures exist in localStorage but do NOT seed any mock items.
export const initializeEmptyData = (): void => {
  if (typeof window === "undefined") return
  // Touch getters to trigger DataService initialization without seeding
  DataService.getUsers()
  DataService.getProducts()
  DataService.getOrders()
  // Optional buckets, guard if not implemented in DataService
  try {
    DataService.getContactMessages()
    DataService.getQuoteRequests()
  } catch {}
}

// Admin overview stats
export const getAdminStats = (): AdminStats => {
  try {
    const s = DataService.generateStats()
    return {
      totalUsers: s.totalUsers,
      totalProducts: s.totalProducts,
      totalOrders: s.totalOrders,
      totalRevenue: s.totalRevenue,
      pendingOrders: s.pendingOrders,
      lowStockProducts: s.lowStockProducts,
      newMessages: s.newMessages,
      newQuotes: s.newQuotes,
    }
  } catch {
    const users = DataService.getUsers()
    const products = DataService.getProducts()
    const orders = DataService.getOrders()
    const messages = DataService.getContactMessages?.() ?? []
    const quotes = DataService.getQuoteRequests?.() ?? []
    const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + (o.total || 0), 0)

    return {
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      lowStockProducts: products.filter((p) => (p.stock_quantity ?? 0) < 20).length,
      newMessages: messages.filter((m: any) => m.status === "new" || m.read === false).length,
      newQuotes: quotes.filter((q: any) => q.status === "pending").length,
    }
  }
}

// Read helpers
export const getAllOrders = (): Order[] => DataService.getOrders()
export const getAllProducts = (): Product[] => DataService.getProducts()
export const getProductById = (id: string): Product | undefined => DataService.getProductById(id)
export const getAllUsers = (): User[] => DataService.getUsers()

// Product CRUD
export const createProduct = (input: ProductFormData): Product => {
  // map ProductFormData -> Omit<Product, "id" | "created_at" | "updated_at">
  return DataService.addProduct({
    name: input.name,
    sku: input.sku,
    category: input.category,
    price: input.price,
    description: input.description,
    long_description: input.long_description,
    stock_quantity: input.stock_quantity,
    inStock: input.stock_quantity > 0,
    image: input.images?.[0] || "/modern-tech-product.png",
    images: input.images || [],
    rating: 0,
    reviews: 0,
    specifications: input.specifications || {},
    features: input.features || [],
    applications: input.applications || [],
    // created_at/updated_at/id handled by DataService
  } as any)
}

export const updateProduct = (id: string, input: Partial<ProductFormData>): boolean => {
  const updates: Partial<Product> = {
    name: input.name,
    sku: input.sku,
    category: input.category,
    price: input.price,
    description: input.description,
    long_description: input.long_description,
    stock_quantity: input.stock_quantity,
    inStock: typeof input.stock_quantity === "number" ? input.stock_quantity > 0 : undefined,
    image: input.images && input.images[0] ? input.images[0] : undefined,
    images: input.images,
    specifications: input.specifications,
    features: input.features,
    applications: input.applications,
  }
  return DataService.updateProduct(id, updates)
}

export const deleteProduct = (id: string): boolean => {
  return DataService.deleteProduct(id)
}

// User update (basic)
export const updateUser = (id: string, input: Partial<UserFormData>): boolean => {
  return DataService.updateUser(id, {
    email: input.email,
    full_name: input.full_name,
    company: input.company,
    phone: input.phone,
    role: input.role,
    is_active: input.is_active,
  })
}

// Order status updates with notification
export const updateOrderStatus = (
  orderId: string,
  status: Order["status"],
  tracking_number?: string,
  notes?: string,
): boolean => {
  if (typeof window === "undefined") return false

  const ok = DataService.updateOrder(orderId, {
    status,
    tracking_number,
    notes,
    updated_at: new Date().toISOString(),
  })

  // Optional: notify user if a notifier is implemented later
  try {
    ;(DataService as any).notifyUserOfOrderUpdate?.(DataService.getOrderById(orderId))
  } catch {
    // noop
  }

  return ok
}

export { initializeEmptyData as initializeMockData }
export const addProduct = createProduct
