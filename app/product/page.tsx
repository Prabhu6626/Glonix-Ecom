"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Search, Grid, List, ShoppingCart, Heart, Star, Package, Zap, Cpu, Wrench } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  image: string
  description: string
  inStock: boolean
  rating: number
  reviews: number
  specifications: Record<string, string>
}

function ProductCatalogContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)

  // Sample product data - in real app, this would come from API
  const sampleProducts: Product[] = [
    {
      id: "1",
      name: "Arduino Uno R3",
      sku: "ARD-UNO-R3",
      category: "Microcontrollers",
      price: 25.99,
      image: "/placeholder-abmlq.png",
      description: "Popular microcontroller board based on ATmega328P",
      inStock: true,
      rating: 4.8,
      reviews: 1250,
      specifications: {
        Microcontroller: "ATmega328P",
        "Operating Voltage": "5V",
        "Digital I/O Pins": "14",
        "Analog Input Pins": "6",
        "Flash Memory": "32KB",
      },
    },
    {
      id: "2",
      name: "Raspberry Pi 4 Model B",
      sku: "RPI-4B-4GB",
      category: "Single Board Computers",
      price: 75.0,
      image: "/raspberry-pi-4-board.png",
      description: "Powerful single-board computer with 4GB RAM",
      inStock: true,
      rating: 4.9,
      reviews: 2100,
      specifications: {
        CPU: "Quad-core ARM Cortex-A72",
        RAM: "4GB LPDDR4",
        Storage: "MicroSD",
        Connectivity: "WiFi, Bluetooth, Ethernet",
        "USB Ports": "2x USB 3.0, 2x USB 2.0",
      },
    },
    {
      id: "3",
      name: "ESP32 Development Board",
      sku: "ESP32-DEV-KIT",
      category: "Microcontrollers",
      price: 12.5,
      image: "/esp32-microcontroller.png",
      description: "WiFi and Bluetooth enabled microcontroller",
      inStock: true,
      rating: 4.7,
      reviews: 890,
      specifications: {
        CPU: "Dual-core Xtensa LX6",
        WiFi: "802.11 b/g/n",
        Bluetooth: "v4.2 BR/EDR and BLE",
        "GPIO Pins": "30",
        "Flash Memory": "4MB",
      },
    },
    {
      id: "4",
      name: "STM32F103C8T6 Blue Pill",
      sku: "STM32-BLUEPILL",
      category: "Microcontrollers",
      price: 8.99,
      image: "/stm32-blue-pill.png",
      description: "ARM Cortex-M3 development board",
      inStock: false,
      rating: 4.5,
      reviews: 650,
      specifications: {
        CPU: "ARM Cortex-M3",
        "Clock Speed": "72MHz",
        "Flash Memory": "64KB",
        RAM: "20KB",
        "GPIO Pins": "37",
      },
    },
    {
      id: "5",
      name: "Breadboard 830 Points",
      sku: "BB-830-WHITE",
      category: "Prototyping",
      price: 5.99,
      image: "/placeholder-48jcx.png",
      description: "Solderless breadboard for prototyping",
      inStock: true,
      rating: 4.3,
      reviews: 420,
      specifications: {
        "Tie Points": "830",
        Size: "165 x 55mm",
        Material: "ABS Plastic",
        Color: "White",
        "Contact Rating": "1A @ 5VDC",
      },
    },
    {
      id: "6",
      name: "Jumper Wire Set",
      sku: "JW-MM-40PCS",
      category: "Prototyping",
      price: 3.5,
      image: "/placeholder-zjlb1.png",
      description: "40pcs Male to Male jumper wires",
      inStock: true,
      rating: 4.2,
      reviews: 310,
      specifications: {
        Length: "20cm",
        "Wire Gauge": "26AWG",
        Connector: "Male to Male",
        Quantity: "40 pieces",
        Colors: "Assorted",
      },
    },
  ]

  const categories = [
    { value: "all", label: "All Categories", icon: <Package className="h-4 w-4" /> },
    { value: "Microcontrollers", label: "Microcontrollers", icon: <Cpu className="h-4 w-4" /> },
    { value: "Single Board Computers", label: "Single Board Computers", icon: <Zap className="h-4 w-4" /> },
    { value: "Prototyping", label: "Prototyping", icon: <Wrench className="h-4 w-4" /> },
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(sampleProducts)
      setFilteredProducts(sampleProducts)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = products

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return b.rating - a.rating
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchQuery, selectedCategory, sortBy])

  const addToCart = (product: Product) => {
    // Add to cart logic
    console.log("Adding to cart:", product)
    // Update cart count in localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    cart.push(product)
    localStorage.setItem("cart", JSON.stringify(cart))
  }

  const addToWishlist = (product: Product) => {
    // Add to wishlist logic
    console.log("Adding to wishlist:", product)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">Product Catalog</h1>
          <p className="text-slate-600">
            Discover our comprehensive range of electronic components and development boards
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}
            >
              <div className={viewMode === "list" ? "w-48 flex-shrink-0" : ""}>
                <div className="relative">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className={`w-full object-cover ${viewMode === "list" ? "h-32" : "h-48"} rounded-t-lg`}
                  />
                  {!product.inStock && <Badge className="absolute top-2 left-2 bg-red-500">Out of Stock</Badge>}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => addToWishlist(product)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-heading text-lg text-slate-900 line-clamp-2">{product.name}</CardTitle>
                      <p className="text-sm text-slate-500 mb-2">SKU: {product.sku}</p>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">
                      {product.rating} ({product.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-slate-900">${product.price}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/product/${product.id}`)}>
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        disabled={!product.inStock}
                        className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductPage() {
  return (
    <ProtectedRoute>
      <ProductCatalogContent />
    </ProtectedRoute>
  )
}
