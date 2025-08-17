"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  Package,
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Phone,
  Mail,
} from "lucide-react"

interface Order {
  id: string
  userId: string
  items: Array<{
    id: string
    name: string
    sku: string
    price: number
    quantity: number
    image: string
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    company: string
    address1: string
    address2: string
    city: string
    state: string
    zipCode: string
    country: string
    phone: string
  }
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  createdAt: string
  estimatedDelivery: string
  trackingNumber?: string
  shippingMethod: string
  paymentMethod: string
}

function OrderDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load order from localStorage (in real app, this would be API call)
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      try {
        const parsedOrders = JSON.parse(storedOrders)
        const foundOrder = parsedOrders.find((o: Order) => o.id === params.id)
        setOrder(foundOrder || null)
      } catch (error) {
        console.error("Failed to parse orders data:", error)
      }
    }
    setLoading(false)
  }, [params.id])

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5" />
      case "confirmed":
        return <CheckCircle className="h-5 w-5" />
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

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

  const getOrderProgress = (status: Order["status"]) => {
    const steps = ["confirmed", "processing", "shipped", "delivered"]
    const currentIndex = steps.indexOf(status)
    return currentIndex >= 0 ? currentIndex + 1 : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Order not found</h3>
          <Button onClick={() => router.push("/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/orders")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
            <div>
              <h1 className="font-heading font-bold text-3xl text-slate-900">Order #{order.id}</h1>
              <p className="text-slate-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            {order.status === "shipped" && (
              <Button>
                <Truck className="h-4 w-4 mr-2" />
                Track Package
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Status</CardTitle>
                  <Badge className={`${getStatusColor(order.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {order.status !== "cancelled" && (
                  <div className="space-y-4">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                      {["Confirmed", "Processing", "Shipped", "Delivered"].map((step, index) => {
                        const isActive = index < getOrderProgress(order.status)
                        const isCurrent = index === getOrderProgress(order.status) - 1

                        return (
                          <div key={step} className="flex flex-col items-center flex-1">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isActive
                                  ? "bg-cyan-600 text-white"
                                  : isCurrent
                                    ? "bg-cyan-100 text-cyan-600 border-2 border-cyan-600"
                                    : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {isActive ? <CheckCircle className="h-4 w-4" /> : index + 1}
                            </div>
                            <div className={`text-sm mt-2 ${isActive ? "text-cyan-600 font-medium" : "text-gray-500"}`}>
                              {step}
                            </div>
                            {index < 3 && (
                              <div
                                className={`h-1 w-full mt-4 ${
                                  index < getOrderProgress(order.status) - 1 ? "bg-cyan-600" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {order.trackingNumber && (
                      <div className="bg-cyan-50 p-4 rounded-lg">
                        <div className="font-medium text-cyan-900">Tracking Number</div>
                        <div className="text-cyan-700">{order.trackingNumber}</div>
                      </div>
                    )}

                    {order.status !== "delivered" && (
                      <div className="text-sm text-slate-600">
                        Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">SKU: {item.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
                          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="font-medium">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </div>
                  {order.shippingAddress.company && <div>{order.shippingAddress.company}</div>}
                  <div>{order.shippingAddress.address1}</div>
                  {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4" />
                    {order.shippingAddress.phone}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({order.shippingMethod})</span>
                  <span>${order.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="capitalize">{order.paymentMethod} Payment</div>
                <div className="text-sm text-slate-600 mt-1">Payment processed successfully</div>
              </CardContent>
            </Card>

            {/* Need Help */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailContent />
    </ProtectedRoute>
  )
}
