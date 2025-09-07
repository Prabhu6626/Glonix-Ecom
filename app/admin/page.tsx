"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { getAdminStats, initializeEmptyData, getAllOrders, getAllProducts } from "@/lib/admin-utils"
import type { AdminStats, Order, Product } from "@/lib/types"
import { Users, Package, ShoppingCart, DollarSign, AlertTriangle, MessageSquare, FileText, Clock, Eye, ShoppingBag } from "lucide-react"
import Link from "next/link"

function AdminDashboardContent() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize empty data structures
    initializeEmptyData()

    const adminStats = getAdminStats()
    const orders = getAllOrders().slice(0, 5) // Get 5 most recent orders
    const products = getAllProducts().filter((p) => p.stock_quantity < 20) // Low stock threshold

    setStats(adminStats)
    setRecentOrders(orders)
    setLowStockProducts(products)
    setLoading(false)
  }, [])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-cyan-100 text-cyan-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome to the Glonix Electronics admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalUsers}</div>
            <p className="text-xs text-blue-600 mt-1">Registered customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Products</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.totalProducts}</div>
            <p className="text-xs text-green-600 mt-1">In catalog</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{stats.totalOrders}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-yellow-100 text-yellow-800 text-xs">{stats.pendingOrders} pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-cyan-600 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(stats.lowStockProducts > 0 || stats.newMessages > 0 || stats.newQuotes > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.lowStockProducts > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Low Stock Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-800">{stats.lowStockProducts} products are running low on stock</p>
                <Button asChild size="sm" className="mt-2 bg-transparent" variant="outline">
                  <Link href="/admin/products">View Products</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {stats.newMessages > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  New Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800">{stats.newMessages} unread customer messages</p>
                <Button asChild size="sm" className="mt-2 bg-transparent" variant="outline">
                  <Link href="/admin/messages">View Messages</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {stats.newQuotes > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  New Quote Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-800">{stats.newQuotes} pending quote requests</p>
                <Button asChild size="sm" className="mt-2 bg-transparent" variant="outline">
                  <Link href="/admin/quotes">View Quotes</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium">#{order.order_number}</div>
                      <div className="text-sm text-slate-600">{order.user_name}</div>
                      <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <div className="text-sm font-medium mt-1">${order.total.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/orders">View All Orders</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-500 text-center py-4">All products are well stocked</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-slate-600">{product.sku}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-orange-600 border-orange-300">
                        {product.stock_quantity} left
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/products">Manage Inventory</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                Add Product
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/admin/orders">
                <ShoppingCart className="h-6 w-6 mb-2" />
                Process Orders
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/admin/users">
                <Users className="h-6 w-6 mb-2" />
                Manage Users
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col bg-transparent">
              <Link href="/admin/messages">
                <MessageSquare className="h-6 w-6 mb-2" />
                Reply Messages
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminDashboardContent />
      </AdminLayout>
    </AdminGuard>
  )
}
