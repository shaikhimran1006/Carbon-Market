import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Leaf,
  TreePine,
  Sun,
  Waves,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Verified Projects",
      description: "All projects are certified by recognized standards like VERRA",
    },
    {
      icon: TrendingUp,
      title: "Track Your Impact",
      description: "Monitor your carbon offset portfolio and environmental impact",
    },
    {
      icon: Calculator,
      title: "Footprint Calculator",
      description: "Calculate your carbon footprint and find the right offset",
    },
    {
      icon: Globe,
      title: "Global Projects",
      description: "Support sustainable projects from around the world",
    },
  ];

  const categories = [
    { icon: TreePine, name: "Forestry", count: 4, color: "bg-green-500" },
    { icon: Sun, name: "Renewable Energy", count: 4, color: "bg-yellow-500" },
    { icon: Waves, name: "Ocean & Blue Carbon", count: 2, color: "bg-blue-500" },
  ];

  const stats = [
    { value: "1M+", label: "Tons CO₂ Offset" },
    { value: "500+", label: "Projects Available" },
    { value: "50K+", label: "Happy Customers" },
    { value: "100%", label: "Verified Credits" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Leaf className="w-4 h-4" />
                The Future of Carbon Offsetting
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Offset Your Carbon Footprint,{" "}
                <span className="text-primary">Save the Planet</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of individuals and businesses making a real impact on climate change.
                Browse verified carbon credit projects and start your sustainability journey today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/projects">
                  <Button size="lg" className="text-lg px-8">
                    Browse Projects
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/calculator">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    <Calculator className="mr-2 w-5 h-5" />
                    Calculate Footprint
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-primary-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose CarbonMarket?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We make it easy to offset your carbon footprint with verified, high-quality projects
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Project Categories</h2>
              <p className="text-lg text-gray-600">
                From forests to renewable energy, find projects that match your values
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {categories.map((category, index) => (
                <Link key={index} href={`/projects?category=${category.name.toUpperCase().replace(/ /g, "_")}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-8 text-center">
                      <div
                        className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600">{category.count} Projects</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600">
                Offset your carbon footprint in three simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Calculate Your Footprint",
                  description: "Use our calculator to measure your annual carbon emissions",
                },
                {
                  step: "2",
                  title: "Choose Projects",
                  description: "Browse verified projects and select ones you want to support",
                },
                {
                  step: "3",
                  title: "Offset & Track",
                  description: "Purchase credits and track your environmental impact",
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-primary-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of climate-conscious individuals and businesses. Start offsetting your
              carbon footprint today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/projects">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-white text-white hover:bg-white/10"
                >
                  View All Projects
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center items-center gap-8">
              {["VERRA Verified", "Gold Standard", "Climate Neutral", "B Corp Certified"].map(
                (badge, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-500">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium">{badge}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
