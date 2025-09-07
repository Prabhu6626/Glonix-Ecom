"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminGuard } from "@/components/admin/admin-guard"
import { AuthService } from "@/lib/auth"
import type { User } from "@/lib/types"
import { ShoppingBag, ArrowLeft, Mail, Building, Calendar, User as UserIcon } from "lucide-react"
import Link from "next/link"

function CartCustomersContent() {
  const [customers, setCustomers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cartCustomers = AuthService.getUsersByFabricationStatus(2)
    setCustomers(cartCustomers)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cart customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-green-600" />
            Cart Customers
          </h1>
          <p className="text-slate-600 mt-2">
            Users who have added fabrication items to cart ({customers.length} total)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-200 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">{customers.length}</div>
                <div className="text-sm text-green-600">In Cart</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-200 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {customers.filter(c => c.company).length}
                </div>
                <div className="text-sm text-blue-600">With Company</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-200 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {customers.filter(c => {
                    const createdDate = new Date(c.created_at)
                    const now = new Date()
                    const diffTime = Math.abs(now.getTime() - createdDate.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    return diffDays <= 7
                  }).length}
                </div>
                <div className="text-sm text-purple-600">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Cart Customers</h3>
              <p className="text-slate-600">No customers have added fabrication items to cart yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{customer.full_name}</div>
                      <div className="text-sm text-slate-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </div>
                      {customer.company && (
                        <div className="text-sm text-slate-600 flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {customer.company}
                        </div>
                      )}
                      <div className="text-xs text-slate-500">
                        Joined: {new Date(customer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-200 text-green-800">In Cart</Badge>
                    <Badge variant="outline" className="text-slate-600">
                      {new Date(customer.updated_at).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CartCustomersPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <CartCustomersContent />
      </AdminLayout>
    </AdminGuard>
  )
}