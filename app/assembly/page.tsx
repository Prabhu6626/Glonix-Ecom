"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ArrowLeft, CheckCircle, Cpu, Shield, Settings, Award, Phone, Target, Microscope } from "lucide-react"

function AssemblyContent() {
  const router = useRouter()

  const services = [
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "SMT Assembly",
      description: "Surface Mount Technology assembly with high precision placement",
      features: ["0201 components", "BGA/QFN packages", "Fine pitch components"],
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Through-hole Assembly",
      description: "Traditional through-hole component assembly and soldering",
      features: ["Manual insertion", "Wave soldering", "Selective soldering"],
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Mixed Technology",
      description: "Combined SMT and through-hole assembly on single boards",
      features: ["Hybrid assembly", "Complex layouts", "Multi-stage process"],
    },
    {
      icon: <Microscope className="h-6 w-6" />,
      title: "Testing & QC",
      description: "Comprehensive testing and quality control procedures",
      features: ["AOI inspection", "Functional testing", "X-ray inspection"],
    },
  ]

  const capabilities = [
    { parameter: "Component Size", value: "0201 to large connectors" },
    { parameter: "BGA Pitch", value: "Down to 0.4mm" },
    { parameter: "Placement Accuracy", value: "±0.05mm" },
    { parameter: "Board Size", value: "Up to 500mm x 400mm" },
    { parameter: "Board Thickness", value: "0.6mm - 6.0mm" },
    { parameter: "Production Volume", value: "Prototype to high volume" },
  ]

  const qualityStandards = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "IPC Standards",
      description: "Compliant with IPC-A-610 Class 2 and Class 3 standards",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "ISO Certified",
      description: "ISO 9001:2015 certified quality management system",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "100% Testing",
      description: "Every assembled board undergoes comprehensive testing",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-lime-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            PCB Assembly Services
          </Badge>
          <h1 className="font-heading font-bold text-4xl lg:text-5xl text-slate-900 mb-6">Professional PCB Assembly</h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Advanced PCB assembly services with SMT and through-hole capabilities. From prototypes to production
            volumes, we deliver precisely assembled electronics with rigorous quality control and testing.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  {service.icon}
                </div>
                <CardTitle className="font-heading text-lg text-slate-900">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-slate-600">{service.description}</CardDescription>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-lime-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Capabilities and Quality */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">Assembly Capabilities</h2>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {capabilities.map((capability, index) => (
                    <div
                      key={capability.parameter}
                      className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0"
                    >
                      <span className="font-medium text-slate-700">{capability.parameter}</span>
                      <span className="text-slate-600 font-mono text-sm">{capability.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-8">Quality Standards</h2>
            <div className="space-y-6">
              {qualityStandards.map((standard, index) => (
                <Card key={standard.title} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-lime-500 to-lime-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                        {standard.icon}
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">{standard.title}</h3>
                        <p className="text-slate-600">{standard.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Assembly Process</h2>
            <p className="text-xl text-slate-600">Precision assembly with comprehensive quality control</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  <span className="font-bold text-xl">1</span>
                </div>
                <CardTitle className="font-heading text-xl text-slate-900">Setup & Programming</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Machine programming, stencil preparation, and component loading for your specific assembly
                  requirements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-lime-500 to-lime-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  <span className="font-bold text-xl">2</span>
                </div>
                <CardTitle className="font-heading text-xl text-slate-900">Assembly & Soldering</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Precise component placement, reflow soldering, and through-hole assembly using advanced equipment.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  <span className="font-bold text-xl">3</span>
                </div>
                <CardTitle className="font-heading text-xl text-slate-900">Testing & Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Comprehensive testing, quality inspection, and secure packaging for timely delivery.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-lime-500 to-cyan-600 rounded-3xl p-12 text-white text-center">
          <h2 className="font-heading font-bold text-3xl mb-6">Ready for Professional Assembly?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get your PCBs assembled with precision and quality. Contact us for a detailed quote and timeline for your
            project.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/contact")}
              className="bg-white text-lime-700 hover:bg-slate-100"
            >
              Request Assembly Quote
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              Call: 9944237235
            </Button>
          </div>

          <div className="text-sm opacity-90">
            <p>Email: info@glonix.in | Fast turnaround times available</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AssemblyPage() {
  return (
    <ProtectedRoute>
      <AssemblyContent />
    </ProtectedRoute>
  )
}
