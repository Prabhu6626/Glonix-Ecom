"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { ArrowLeft, Lightbulb, Cpu, Zap, Settings, CheckCircle, Phone, Rocket, Target, Users } from "lucide-react"

function DesignEnquiryContent() {
  const router = useRouter()

  const services = [
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Concept Development",
      description: "Transform your ideas into viable electronic product concepts",
      features: ["Feasibility analysis", "Technology selection", "Concept validation"],
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Hardware Design",
      description: "Complete electronic hardware design and development",
      features: ["Schematic design", "PCB layout", "Component selection"],
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Prototyping",
      description: "Rapid prototyping and proof-of-concept development",
      features: ["Quick turnaround", "Iterative design", "Testing & validation"],
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Production Ready",
      description: "Design for manufacturing and production scaling",
      features: ["DFM optimization", "Cost reduction", "Volume production"],
    },
  ]

  const designCapabilities = [
    {
      category: "Analog Design",
      items: ["Power supplies", "Signal conditioning", "Sensor interfaces", "Audio circuits"],
    },
    {
      category: "Digital Design",
      items: ["Microcontroller systems", "FPGA design", "Communication interfaces", "Memory systems"],
    },
    {
      category: "Mixed Signal",
      items: ["ADC/DAC circuits", "PLL design", "Clock distribution", "Power management"],
    },
    {
      category: "RF Design",
      items: ["Wireless communication", "Antenna design", "RF front-ends", "EMC compliance"],
    },
  ]

  const developmentProcess = [
    {
      phase: "Discovery",
      description: "Understanding requirements, constraints, and objectives",
      deliverables: ["Requirements document", "Technical specifications", "Project timeline"],
    },
    {
      phase: "Design",
      description: "Schematic design, simulation, and component selection",
      deliverables: ["Schematic diagrams", "Simulation results", "BOM and cost analysis"],
    },
    {
      phase: "Prototype",
      description: "PCB layout, fabrication, and initial testing",
      deliverables: ["PCB layouts", "Prototype boards", "Test results"],
    },
    {
      phase: "Validation",
      description: "Comprehensive testing, optimization, and documentation",
      deliverables: ["Test reports", "Design documentation", "Production files"],
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
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center ml-4">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-slate-900">Design Enquiry</h1>
              <p className="text-xs text-slate-600">Custom Hardware Development</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button onClick={() => router.push("/contact")}>Start Project</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Custom Hardware Development
          </Badge>
          <h1 className="font-heading font-bold text-4xl lg:text-5xl text-slate-900 mb-6">
            From Concept to Production
          </h1>
          <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
            Complete electronic product development services from initial concept to production-ready designs. Our
            expert engineers turn your ideas into fully functional, manufacturable electronic products.
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
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  {service.icon}
                </div>
                <CardTitle className="font-heading text-lg text-slate-900">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-slate-600">{service.description}</CardDescription>
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Design Capabilities */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Design Capabilities</h2>
            <p className="text-xl text-slate-600">Comprehensive electronic design expertise across all domains</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {designCapabilities.map((capability, index) => (
              <Card key={capability.category} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="font-heading text-lg text-slate-900">{capability.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {capability.items.map((item, idx) => (
                      <div key={idx} className="flex items-center text-sm text-slate-600">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Development Process */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Development Process</h2>
            <p className="text-xl text-slate-600">Structured approach from concept to production</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {developmentProcess.map((phase, index) => (
              <Card key={phase.phase} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4">
                    <span className="font-bold text-xl">{index + 1}</span>
                  </div>
                  <CardTitle className="font-heading text-lg text-slate-900">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-slate-600">{phase.description}</CardDescription>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Deliverables:</h4>
                    <div className="space-y-1">
                      {phase.deliverables.map((deliverable, idx) => (
                        <div key={idx} className="flex items-center text-xs text-slate-600">
                          <div className="w-1 h-1 bg-purple-500 rounded-full mr-2"></div>
                          {deliverable}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl text-slate-900 mb-4">Why Choose Glonix for Your Project?</h2>
            <p className="text-xl text-slate-600">Trusted expertise in electronic product development</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="font-heading text-xl text-slate-900">Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Experienced engineers with deep expertise in analog, digital, and mixed-signal design across various
                  industries.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle className="font-heading text-xl text-slate-900">Proven Track Record</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Successfully delivered 500+ projects from startups to global OEMs with consistent quality and on-time
                  delivery.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <CardTitle className="font-heading text-xl text-slate-900">End-to-End Service</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  Complete solution from concept to production including design, prototyping, testing, and manufacturing
                  support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-500 to-cyan-600 rounded-3xl p-12 text-white text-center">
          <h2 className="font-heading font-bold text-3xl mb-6">Ready to Bring Your Idea to Life?</h2>
          <p className="text-xl mb-8 opacity-90">
            Let's discuss your project requirements and how we can help turn your concept into a successful product. Get
            started with a free consultation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/contact")}
              className="bg-white text-purple-700 hover:bg-slate-100"
            >
              Start Your Project
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
              <Phone className="h-4 w-4 mr-2" />
              Call: 9444312035
            </Button>
          </div>

          <div className="text-sm opacity-90">
            <p>Email: info@glonix.in | Free consultation available</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DesignEnquiryPage() {
  return (
    <ProtectedRoute>
      <DesignEnquiryContent />
    </ProtectedRoute>
  )
}
