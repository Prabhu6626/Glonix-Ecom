"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { getAllOrders, updateOrderStatus, initializeMockData } from "@/lib/admin-utils"
import type { Order } from "@/lib/types"
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react"

function OrderManagementContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    status: "pending" as Order["status"],
    tracking_number: "",
    notes: "",
  })

  const orderStatuses: { value: Order["status"]; label: string; color: string; icon: React.ReactNode }[] = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      value: "processing",
      label: "Processing",
      color: "bg-purple-100 text-purple-800",
      icon: <Package className="h-4 w-4" />,
    },
    { value: "shipped", label: "Shipped", color: "bg-cyan-100 text-cyan-800", icon: <Truck className="h-4 w-4" /> },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
      icon: <XCircle className="h-4 w-4" />,
    },
  ]

  useEffect(() => {
    initializeMockData()
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const loadOrders = () => {
    // Load all orders from global storage (admin sees all orders from all users)
    const allOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    setOrders(allOrders)
    setLoading(false)
  }

  const filterOrders = () => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (order.tracking_number && order.tracking_number.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredOrders(filtered)
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsDialogOpen(true)
  }

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order)
    setUpdateForm({
      status: order.status,
      tracking_number: order.tracking_number || "",
      notes: order.notes || "",
    })
    setIsUpdateDialogOpen(true)
  }

  const handleSaveOrderUpdate = async () => {
    if (!selectedOrder) return

    try {
      // Update global orders
      const globalOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      const orderIndex = globalOrders.findIndex((o: Order) => o.id === selectedOrder.id)
      
      if (orderIndex !== -1) {
        globalOrders[orderIndex] = {
          ...globalOrders[orderIndex],
          status: updateForm.status,
          tracking_number: updateForm.tracking_number || undefined,
          notes: updateForm.notes || undefined,
          updated_at: new Date().toISOString(),
        }
        localStorage.setItem("orders", JSON.stringify(globalOrders))
        
        // Also update user-specific order using the order's user_id
        const orderOwnerId = selectedOrder.user_id
        if (orderOwnerId) {
          try {
            const ordersKey = `orders_${orderOwnerId}`
            const userOrders = JSON.parse(localStorage.getItem(ordersKey) || "[]")
            const userOrderIndex = userOrders.findIndex((o: Order) => o.id === selectedOrder.id)
            
            if (userOrderIndex !== -1) {
              userOrders[userOrderIndex] = globalOrders[orderIndex]
              localStorage.setItem(ordersKey, JSON.stringify(userOrders))
              console.log(`Updated order ${selectedOrder.id} for user ${orderOwnerId}`)
            } else {
              console.log(`Order ${selectedOrder.id} not found in user ${orderOwnerId}'s orders`)
            }
          } catch (error) {
            console.error("Failed to update user-specific order:", error)
          }
        } else {
          console.log("No user_id found in order:", selectedOrder.id)
        }
        
        loadOrders()
        setIsUpdateDialogOpen(false)

        // Simulate sending notification to customer
        const statusMessage = getStatusMessage(updateForm.status, updateForm.tracking_number)
        alert(`Order updated successfully!\n\nCustomer notification sent:\n"${statusMessage}"`)
      } else {
        alert("Order not found")
      }
    } catch (error) {
      console.error("Failed to update order:", error)
      alert("Failed to update order")
    }
  }

  const getStatusMessage = (status: Order["status"], trackingNumber?: string) => {
    switch (status) {
      case "confirmed":
        return "Your order has been confirmed and is being prepared for processing."
      case "processing":
        return "Your order is currently being processed and will be shipped soon."
      case "shipped":
        return `Your order has been shipped! ${trackingNumber ? `Tracking number: ${trackingNumber}` : ""}`
      case "delivered":
        return "Your order has been delivered successfully. Thank you for your business!"
      case "cancelled":
        return "Your order has been cancelled. If you have any questions, please contact support."
      default:
        return "Your order status has been updated."
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    const statusConfig = orderStatuses.find((s) => s.value === status)
    if (!statusConfig) return null

    return (
      <Badge className={statusConfig.color}>
        <div className="flex items-center gap-1">
          {statusConfig.icon}
          {statusConfig.label}
        </div>
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === "pending").length
  const processingOrders = orders.filter((o) => o.status === "processing" || o.status === "confirmed").length
  const shippedOrders = orders.filter((o) => o.status === "shipped").length
  const totalRevenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-cyan-600" />
            Order Management
          </h1>
          <p className="text-slate-600 mt-2">Manage customer orders and shipment tracking</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{processingOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-cyan-700">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-900">{shippedOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search orders, customers, tracking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {orderStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Order</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Items</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">#{order.order_number}</div>
                          {order.tracking_number && (
                            <div className="text-sm text-slate-600">Tracking: {order.tracking_number}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900">{order.user_name}</div>
                          <div className="text-sm text-slate-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {order.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium">${order.total.toFixed(2)}</div>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" onClick={() => handleUpdateOrder(order)}>
                            <Package className="h-3 w-3 mr-1" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total:</span>
                      <span className="font-medium">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Payment:</span>
                      <Badge className="bg-green-100 text-green-800">{selectedOrder.payment_status}</Badge>
                    </div>
                    {selectedOrder.tracking_number && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Tracking:</span>
                        <span className="font-medium">{selectedOrder.tracking_number}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-sm">{selectedOrder.user_email}</span>
                    </div>
                    {selectedOrder.shipping_address?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-sm">{selectedOrder.shipping_address.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.shipping_address ? (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                        <div className="text-sm">
                          <div>
                            {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}
                          </div>
                          {selectedOrder.shipping_address.company && <div>{selectedOrder.shipping_address.company}</div>}
                          <div>{selectedOrder.shipping_address.address1}</div>
                          {selectedOrder.shipping_address.address2 && (
                            <div>{selectedOrder.shipping_address.address2}</div>
                          )}
                          <div>
                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{" "}
                            {selectedOrder.shipping_address.zip_code}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">No shipping address available</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-slate-600">SKU: {item.product_sku}</div>
                          <div className="text-sm text-slate-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.total.toFixed(2)}</div>
                          <div className="text-sm text-slate-600">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>${selectedOrder.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Order Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-700">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order - #{selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Order Status</Label>
              <Select
                value={updateForm.status}
                onValueChange={(value: Order["status"]) => setUpdateForm({ ...updateForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {status.icon}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(updateForm.status === "shipped" || updateForm.status === "delivered") && (
              <div>
                <Label htmlFor="tracking_number">Tracking Number</Label>
                <Input
                  id="tracking_number"
                  value={updateForm.tracking_number}
                  onChange={(e) => setUpdateForm({ ...updateForm, tracking_number: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>
            )}

            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={updateForm.notes}
                onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                placeholder="Add notes about this order..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveOrderUpdate} className="flex-1">
                Update Order
              </Button>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OrderManagementPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <OrderManagementContent />
      </AdminLayout>
    </AdminGuard>
  )
}
