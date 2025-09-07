"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { getProductById, initializeEmptyData } from "@/lib/admin-utils"
import { ShoppingCart, Heart, Star, Package, Truck, Shield, RefreshCw, Plus, Minus } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  price: number
  images: string[]
  description: string
  longDescription: string
  inStock: boolean
  stockQuantity: number
  rating: number
  reviews: number
  specifications: Record<string, string>
  features: string[]
  applications: string[]
}

function ProductDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  // Fetch product data from localStorage
  useEffect(() => {
    const fetchProduct = () => {
      try {
        setLoading(true)
        
        // Initialize empty data structure
        initializeEmptyData()
        
        // Get product from localStorage
        const productData = getProductById(params.id as string)
        
        if (productData) {
          // Map localStorage product to component interface
          const mappedProduct: Product = {
            id: productData.id,
            name: productData.name,
            sku: productData.sku,
            category: productData.category,
            price: productData.price,
            images: productData.images || [productData.image].filter(Boolean),
            description: productData.description,
            longDescription: productData.long_description || "",
            inStock: productData.inStock,
            stockQuantity: productData.stock_quantity,
            rating: productData.rating || 0,
            reviews: productData.reviews || 0,
            specifications: productData.specifications || {},
            features: productData.features || [],
            applications: productData.applications || [],
          }
          setProduct(mappedProduct)
        } else {
          // Fallback to sample data if product not found
          setProduct({
            id: params.id as string,
            name: "Arduino Uno R3",
            sku: "ARD-UNO-R3",
            category: "Microcontrollers",
            price: 25.99,
            images: ["/arduino-uno-front.png", "/arduino-uno-back.png", "/arduino-uno-side.png"],
            description: "Popular microcontroller board based on ATmega328P",
            longDescription:
              "The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins (of which 6 can be used as PWM outputs), 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header, and a reset button. It contains everything needed to support the microcontroller; simply connect it to a computer with a USB cable or power it with a AC-to-DC adapter or battery to get started.",
            inStock: true,
            stockQuantity: 150,
            rating: 4.8,
            reviews: 1250,
            specifications: {
              Microcontroller: "ATmega328P",
              "Operating Voltage": "5V",
              "Input Voltage (recommended)": "7-12V",
              "Input Voltage (limit)": "6-20V",
              "Digital I/O Pins": "14 (of which 6 provide PWM output)",
              "PWM Digital I/O Pins": "6",
              "Analog Input Pins": "6",
              "DC Current per I/O Pin": "20 mA",
              "DC Current for 3.3V Pin": "50 mA",
              "Flash Memory": "32 KB (ATmega328P) of which 0.5 KB used by bootloader",
              SRAM: "2 KB (ATmega328P)",
              EEPROM: "1 KB (ATmega328P)",
              "Clock Speed": "16 MHz",
              LED_BUILTIN: "13",
              Length: "68.6 mm",
              Width: "53.4 mm",
              Weight: "25 g",
            },
            features: [
              "USB connectivity for easy programming",
              "Built-in LED on pin 13",
              "Reset button for easy restart",
              "Power jack for external power supply",
              "ICSP header for in-circuit programming",
              "Compatible with Arduino IDE",
              "Extensive library support",
              "Large community and tutorials",
            ],
            applications: [
              "IoT projects and prototyping",
              "Educational electronics learning",
              "Home automation systems",
              "Robotics and motor control",
              "Sensor data acquisition",
              "LED lighting control",
              "Temperature monitoring",
              "Arduino shield compatibility",
            ],
          })
        }
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const addToCart = () => {
    if (!product) return

    const cartItem = { ...product, quantity }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item.id === product.id)
    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    console.log("Added to cart:", cartItem)
  }

  const addToWishlist = () => {
    if (!product) return
    console.log("Added to wishlist:", product)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Product not found</h3>
          <Button onClick={() => router.push("/product")}>Back to Catalog</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-600">
          <button onClick={() => router.push("/product")} className="hover:text-cyan-600 transition-colors">
            Products
          </button>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? "border-cyan-500" : "border-gray-200"
                    }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">{product.name}</h1>
              <p className="text-slate-600 mb-4">SKU: {product.sku}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <span className="text-slate-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              <div className="text-3xl font-bold text-slate-900 mb-4">${product.price}</div>

              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">In Stock ({product.stockQuantity} available)</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium text-slate-900">Quantity:</label>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    disabled={quantity >= product.stockQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={addToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" onClick={addToWishlist}>
                  <Heart className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">Free shipping over $50</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">1 year warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">30-day returns</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-600" />
                <span className="text-sm text-slate-600">Secure packaging</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="applications">Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Product Description</h3>
              <p className="text-slate-600 leading-relaxed">{product.longDescription}</p>
            </TabsContent>

            <TabsContent value="specifications" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Technical Specifications</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-200">
                    <span className="font-medium text-slate-900">{key}:</span>
                    <span className="text-slate-600">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="features" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Key Features</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="applications" className="p-6">
              <h3 className="font-heading font-semibold text-xl mb-4">Applications</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {product.applications.map((application, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-lime-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-slate-600">{application}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <ProtectedRoute>
      <ProductDetailContent />
    </ProtectedRoute>
  )
}
