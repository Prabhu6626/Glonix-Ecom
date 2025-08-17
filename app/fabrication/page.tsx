"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ArrowLeft, CheckCircle, Clock, Shield, Zap, Layers, Settings, Award, Phone } from "lucide-react"

function FabricationContent() {
  const router = useRouter()

  const features = [
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Multi-layer PCBs",
      description: "From single-layer to complex multi-layer boards up to 16 layers",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Quick Turnaround",
      description: "Fast delivery times without compromising on quality",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "Rigorous testing and quality control at every step",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Custom Specifications",
      description: "Tailored solutions for your specific requirements",
    },
  ]

  const specifications = [
    { parameter: "Board Thickness", value: "0.4mm - 6.0mm" },
    { parameter: "Copper Weight", value: "0.5oz - 4oz" },
    { parameter: "Min Track/Space", value: "0.1mm/0.1mm" },
    { parameter: "Min Via Size", value: "0.15mm" },
    { parameter: "Surface Finish", value: "HASL, OSP, ENIG, Immersion Silver" },
    { parameter: "Solder Mask", value: "Green, Red, Blue, Black, White, Yellow" },
  ]

  const processSteps = [
    {
      step: "1",
      title: "Design Review",
      description: "Our engineers review your PCB design files for manufacturability",
    },
    {
      step: "2",
      title: "Material Selection",
      description: "Choose the right substrate and materials for your application",
    },
    {
      step: "3",
      title: "Fabrication",
      description: "State-of-the-art manufacturing with precision equipment",
    },
    {
      step: "4",
      title: "Testing & QC",
      description: "Comprehensive testing including electrical and visual inspection",
    },
    {
      step: "5",
      title: "Delivery",
      description: "Secure packaging and timely delivery to your location",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-cyan-700 hover:text-cyan-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl flex items-center justify-center ml-4">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900">PCB Fabrication</h1>
              <p className="text-xs text-slate-600">Professional PCB Manufacturing</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button onClick={() => router.push("/contact")}>Get Quote</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            PCB Fabrication Services
          </Badge>
          <h1 className="font-heading font-bold text-4xl lg:text-5xl text-slate-900 mb-6">
            High-Quality PCB Manufacturing
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Professional PCB fabrication services with precision engineering, quick turnaround times, and uncompromising
            quality. From prototypes to production runs, we deliver reliable PCBs that meet your exact specifications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="font-heading text-lg text-slate-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Specifications */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">Technical Specifications</h2>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {specifications.map((spec, index) => (
                    <div
                      key={spec.parameter}
                      className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="font-medium text-slate-700">{spec.parameter}</span>
                      <span className="text-slate-600 font-mono text-sm">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">Why Choose Our PCB Fabrication?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Advanced Manufacturing</h3>
                  <p className="text-slate-600">
                    State-of-the-art equipment and processes ensure consistent quality and precision.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Fast Turnaround</h3>
                  <p className="text-slate-600">Quick delivery times without compromising on quality or reliability.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Quality Certified</h3>
                  <p className="text-slate-600">ISO certified processes and rigorous quality control at every step.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Our Fabrication Process</h2>
            <p className="text-xl text-slate-600">From design to delivery, we ensure quality at every step</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {processSteps.map((process, index) => (
              <div key={process.step} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-lime-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">
                    {process.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-300 to-lime-300 -translate-y-1/2"></div>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{process.title}</h3>
                <p className="text-sm text-slate-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-600 to-lime-600 rounded-3xl p-12 text-white text-center">
          <h2 className="font-heading font-bold text-3xl mb-6">Ready to Start Your PCB Project?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get a free quote for your PCB fabrication requirements. Our experts are ready to help bring your designs to
            life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/contact")}
              className="bg-white text-cyan-700 hover:bg-slate-100"
            >
              Get Free Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              Call: 9444312035
            </Button>
          </div>

          <div className="text-sm opacity-90">
            <p>Email us at: info@glonix.in | Quick response guaranteed</p>
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
