"use client"

import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, CheckCircle, Layers, Clock, Shield, Settings, Award, Phone } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"

function FabricationContent() {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [uploadStatus, setUploadStatus] = useState("")
  const [pcbImage, setPcbImage] = useState("")
  const [dimensions, setDimensions] = useState({ width: "", height: "" })
  
  // Form state
  const [layers, setLayers] = useState("")
  const [quantity, setQuantity] = useState("")
  const [thickness, setThickness] = useState("")
  const [material, setMaterial] = useState("FR4")
  const [color, setColor] = useState("Green")
  const [silkscreen, setSilkscreen] = useState("White")
  const [surfaceFinish, setSurfaceFinish] = useState("HASL")
  const [copperWeight, setCopperWeight] = useState("1oz")
  const [delivery, setDelivery] = useState("Standard")
  const [tgRating, setTgRating] = useState("Standard")
  const [viaCovering, setViaCovering] = useState("No")
  const [goldFingers, setGoldFingers] = useState("No")

  // Options
  const layerOptions = [1, 2, 4, 6, 8, 10, "10+"]
  const thicknessOptions = ["0.8mm", "1.6mm", "2.4mm", "3.2mm"]
  const colorOptions = ["Green", "Blue", "Red", "Yellow", "Black", "White"]
  const finishOptions = ["HASL", "Lead-free HASL", "ENIG", "Immersion Silver", "OSP"]
  const copperOptions = ["0.5oz", "1oz", "2oz", "3oz", "4oz"]
  const deliveryOptions = ["Standard (10 days)", "Express (7 days)", "Urgent (5 days)"]
  const tgOptions = ["Standard (130-140°C)", "Mid (150°C)", "High (170°C+)"]

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setUploadStatus("")
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a file first")
      return
    }
    
    setUploadStatus("Uploading...")
    // Simulate upload
    setTimeout(() => {
      setUploadStatus("Upload successful!")
      setPcbImage("/placeholder-pcb.png") // Replace with actual image URL
      setDimensions({ width: "100", height: "80" }) // Example dimensions
    }, 1500)
  }

  const calculatePrice = () => {
    // Simple pricing calculation - replace with your actual logic
    const basePrice = layers * 500
    const sizeFactor = (dimensions.width * dimensions.height) / 1000
    const quantityFactor = quantity > 10 ? 0.9 : 1
    return (basePrice * sizeFactor * quantityFactor).toFixed(2)
  }

  const handleSubmit = () => {
    if (!file || !layers || !quantity || !thickness) {
      alert("Please complete all required fields")
      return
    }
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <h1 className="font-bold text-lg">PCB Fabrication</h1>
            </div>
          </div>
          <Button onClick={() => router.push("/contact")}>Contact Support</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Gerber Files
                </CardTitle>
                <CardDescription>
                  Upload your PCB design files to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".zip,.rar,.gerber"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current.click()}
                      className="mb-4"
                    >
                      {file ? "Change File" : "Select Files"}
                    </Button>
                    <p className="text-sm text-gray-500">
                      Supported formats: .zip, .rar, .gerber
                    </p>
                    {file && (
                      <p className="mt-2 text-sm font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {file.name}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={!file}
                    className="w-full"
                  >
                    Process Files
                  </Button>
                  {uploadStatus && (
                    <p className={`text-sm ${
                      uploadStatus.includes("success") ? "text-green-600" : "text-gray-600"
                    }`}>
                      {uploadStatus}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* PCB Preview */}
            {pcbImage && (
              <Card>
                <CardHeader>
                  <CardTitle>PCB Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
                    <img 
                      src={pcbImage} 
                      alt="PCB Preview" 
                      className="max-h-64 object-contain" 
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <Label>Width (mm)</Label>
                      <Input 
                        value={dimensions.width} 
                        onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Height (mm)</Label>
                      <Input 
                        value={dimensions.height} 
                        onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PCB Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>PCB Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Number of Layers</Label>
                    <Select value={layers} onValueChange={setLayers}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select layers" />
                      </SelectTrigger>
                      <SelectContent>
                        {layerOptions.map((option) => (
                          <SelectItem key={option} value={option.toString()}>
                            {option} {option === 1 ? "Layer" : "Layers"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input 
                      type="number" 
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div>
                    <Label>PCB Thickness</Label>
                    <Select value={thickness} onValueChange={setThickness}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select thickness" />
                      </SelectTrigger>
                      <SelectContent>
                        {thicknessOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Material</Label>
                    <Select value={material} onValueChange={setMaterial}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FR4">FR4 Standard</SelectItem>
                        <SelectItem value="FR4-HighTG">FR4 High TG</SelectItem>
                        <SelectItem value="Aluminum">Aluminum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Solder Mask Color</Label>
                    <Select value={color} onValueChange={setColor}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorOptions.map((color) => (
                          <SelectItem key={color} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Silkscreen Color</Label>
                    <Select value={silkscreen} onValueChange={setSilkscreen}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="White">White</SelectItem>
                        <SelectItem value="Black">Black</SelectItem>
                        <SelectItem value="Yellow">Yellow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Surface Finish</Label>
                    <Select value={surfaceFinish} onValueChange={setSurfaceFinish}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {finishOptions.map((finish) => (
                          <SelectItem key={finish} value={finish}>
                            {finish}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Copper Weight</Label>
                    <Select value={copperWeight} onValueChange={setCopperWeight}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {copperOptions.map((weight) => (
                          <SelectItem key={weight} value={weight}>
                            {weight}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Delivery Option</Label>
                    <Select value={delivery} onValueChange={setDelivery}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>TG Rating</Label>
                    <Select value={tgRating} onValueChange={setTgRating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tgOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Via Covering</Label>
                    <Select value={viaCovering} onValueChange={setViaCovering}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Gold Fingers</Label>
                    <Select value={goldFingers} onValueChange={setGoldFingers}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No">No</SelectItem>
                        <SelectItem value="Yes">Yes (+₹500)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Layers:</span>
                    <span className="font-medium">{layers || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">
                      {dimensions.width && dimensions.height 
                        ? `${dimensions.width}mm × ${dimensions.height}mm` 
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{quantity || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thickness:</span>
                    <span className="font-medium">{thickness || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">{material || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Color:</span>
                    <span className="font-medium">{color || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Surface Finish:</span>
                    <span className="font-medium">{surfaceFinish || "-"}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Estimated Price:</span>
                    <span>₹{calculatePrice()}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Final price may vary after file review
                  </p>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full mt-4"
                  disabled={!file || !layers || !quantity || !thickness}
                >
                  Proceed to Checkout
                </Button>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Quality Guarantee
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We guarantee 100% quality with our ISO-certified manufacturing process.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Fast Turnaround</h4>
                    <p className="text-sm text-gray-600">
                      Standard delivery in 7-10 days, expedited options available
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Quality Certified</h4>
                    <p className="text-sm text-gray-600">
                      ISO 9001 certified manufacturing with rigorous quality control
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Advanced Capabilities</h4>
                    <p className="text-sm text-gray-600">
                      Up to 16 layers, 0.1mm trace/space, and advanced finishes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FabricationPage() {
  return (
    <ProtectedRoute>
      <FabricationContent />
    </ProtectedRoute>
  )
}