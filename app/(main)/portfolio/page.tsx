"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { jsPDF } from "jspdf";
import {
  Leaf,
  Download,
  Share2,
  Award,
  MapPin,
  Calendar,
  TreePine,
  Waves,
  Sun,
  Factory,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#10B981", "#0EA5E9", "#F59E0B", "#8B5CF6", "#EF4444", "#6B7280"];

const CATEGORY_COLORS: Record<string, string> = {
  REFORESTATION: "#10B981",
  RENEWABLE_ENERGY: "#F59E0B",
  OCEAN_CONSERVATION: "#0EA5E9",
  INDUSTRIAL: "#6B7280",
  AGRICULTURE: "#84CC16",
  COMMUNITY: "#8B5CF6",
};

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?redirect=/portfolio");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch("/api/portfolio");
        if (res.ok) {
          const data = await res.json();
          setPortfolio(data);
        }
      } catch (error) {
        console.error("Failed to fetch portfolio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchPortfolio();
    }
  }, [session]);

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!portfolio || portfolio.holdings?.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Award className="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your portfolio is empty</h1>
        <p className="text-gray-600 mb-8">
          Start making an impact by purchasing carbon credits from verified projects.
        </p>
        <Link href="/projects">
          <Button size="lg">
            <Leaf className="w-5 h-5 mr-2" />
            Browse Projects
          </Button>
        </Link>
      </div>
    );
  }

  const categoryData = portfolio.categoryBreakdown
    ? Object.entries(portfolio.categoryBreakdown).map(([name, value]) => ({
      name: CATEGORY_LABELS[name] || name,
      value: value as number,
      color: CATEGORY_COLORS[name] || "#6B7280",
    }))
    : [];

  const timelineData = portfolio.timeline || [];

  // Download portfolio report as PDF
  const handleDownloadReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header with gradient-like effect
    doc.setFillColor(16, 185, 129); // Primary green
    doc.rect(0, 0, pageWidth, 45, "F");

    // Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CarbonMarket", 20, 25);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Carbon Credit Portfolio Report", 20, 35);

    // User info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 70, 55);
    doc.text(`User: ${session?.user?.name || "User"}`, pageWidth - 70, 62);

    // Summary Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("Portfolio Summary", 20, 75);

    doc.setDrawColor(16, 185, 129);
    doc.line(20, 78, pageWidth - 20, 78);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const summaryY = 88;
    doc.text(`Total CO2 Offset: ${portfolio.totalCredits || 0} tons`, 20, summaryY);
    doc.text(`Total Investment: ${formatCurrency(portfolio.totalSpent || 0)}`, 20, summaryY + 8);
    doc.text(`Number of Projects: ${portfolio.holdings?.length || 0}`, 20, summaryY + 16);
    doc.text(`Total Purchases: ${portfolio.totalOrders || 0}`, 20, summaryY + 24);

    // Environmental Impact Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("Environmental Impact", 20, summaryY + 45);
    doc.line(20, summaryY + 48, pageWidth - 20, summaryY + 48);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const impactY = summaryY + 58;
    doc.text(`Trees Equivalent: ${(portfolio.impactEquivalents?.treesPlanted || 0).toLocaleString()}`, 20, impactY);
    doc.text(`Miles of Driving Offset: ${(portfolio.impactEquivalents?.milesDrivenOffset || 0).toLocaleString()}`, 20, impactY + 8);
    doc.text(`Homes Powered (Years): ${portfolio.impactEquivalents?.homesPowered || 0}`, 20, impactY + 16);
    doc.text(`Flights Offset: ${portfolio.impactEquivalents?.flightsOffset || 0}`, 20, impactY + 24);

    // Holdings Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text("Holdings", 20, impactY + 45);
    doc.line(20, impactY + 48, pageWidth - 20, impactY + 48);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    let holdingY = impactY + 58;
    portfolio.holdings?.forEach((h: any, index: number) => {
      if (holdingY > 260) {
        doc.addPage();
        holdingY = 30;
      }
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${h.project.title}`, 20, holdingY);
      doc.setFont("helvetica", "normal");
      doc.text(`   Location: ${h.project.location}, ${h.project.country}`, 20, holdingY + 6);
      doc.text(`   Credits: ${h.totalCredits} | Value: ${formatCurrency(h.totalCredits * h.project.pricePerCredit)}`, 20, holdingY + 12);
      holdingY += 22;
    });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for making a positive environmental impact!", pageWidth / 2, 285, { align: "center" });
    doc.text("CarbonMarket - AI-Powered Carbon Credit Marketplace", pageWidth / 2, 291, { align: "center" });

    doc.save(`carbon-portfolio-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Share impact on social media or copy to clipboard
  const handleShareImpact = async () => {
    const shareText = `🌍 I've offset ${portfolio.totalCredits || 0} tons of CO₂ through verified carbon credit projects!\n\n🌳 That's equivalent to ${(portfolio.impactEquivalents?.treesPlanted || 0).toLocaleString()} trees planted!\n\nJoin me in fighting climate change at CarbonMarket.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Carbon Credit Impact",
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        alert("Impact summary copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Impact summary copied to clipboard!");
    }
  };

  // Download certificate for a specific holding as PDF
  const handleDownloadCertificate = (holding: any) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    // Helper function to draw a green checkmark
    const drawCheckmark = (x: number, y: number, size: number = 4) => {
      // Draw circle background
      doc.setFillColor(16, 185, 129);
      doc.circle(x, y, size, "F");
      // Draw white checkmark
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.8);
      // Checkmark path
      doc.line(x - size * 0.4, y, x - size * 0.1, y + size * 0.3);
      doc.line(x - size * 0.1, y + size * 0.3, x + size * 0.4, y - size * 0.3);
    };

    // Decorative border
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    doc.setLineWidth(1);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Corner decorations
    doc.setFillColor(16, 185, 129);
    doc.circle(10, 10, 5, "F");
    doc.circle(pageWidth - 10, 10, 5, "F");
    doc.circle(10, pageHeight - 10, 5, "F");
    doc.circle(pageWidth - 10, pageHeight - 10, 5, "F");

    // Header
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.text("CARBONMARKET", centerX, 30, { align: "center" });

    // Title
    doc.setFontSize(32);
    doc.setTextColor(40, 40, 40);
    doc.text("CARBON CREDIT CERTIFICATE", centerX, 50, { align: "center" });

    // Decorative line
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.line(centerX - 80, 55, centerX + 80, 55);

    // Certificate text
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("This is to certify that", centerX, 72, { align: "center" });

    // Recipient name
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 185, 129);
    doc.text(session?.user?.name || "Certificate Holder", centerX, 85, { align: "center" });

    // Credits info
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("has successfully offset", centerX, 98, { align: "center" });

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(`${holding.totalCredits} TONS OF CO₂`, centerX, 112, { align: "center" });

    // Green checkmark in the middle - VERIFIED badge
    drawCheckmark(centerX, 128, 8);
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED", centerX, 140, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("through verified carbon credit project:", centerX, 152, { align: "center" });

    // Project name
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    const projectTitle = holding.project.title.length > 60
      ? holding.project.title.substring(0, 57) + "..."
      : holding.project.title;
    doc.text(projectTitle, centerX, 165, { align: "center" });

    // Location
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${holding.project.location}, ${holding.project.country}`, centerX, 175, { align: "center" });

    // Certificate details
    const certId = `CC-${Date.now().toString(36).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Certificate ID: ${certId}`, centerX - 60, 188);
    doc.text(`Issue Date: ${issueDate}`, centerX + 20, 188);

    // Footer message
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Thank you for contributing to a sustainable future.", centerX, 198, { align: "center" });

    // Save
    doc.save(`certificate-${holding.project.id}-${Date.now()}.pdf`);
  };

  // Share specific holding
  const handleShareHolding = async (holding: any) => {
    const shareText = `🌱 I've invested in "${holding.project.title}" and offset ${holding.totalCredits} tons of CO₂!\n\n📍 ${holding.project.location}, ${holding.project.country}\n\nMake an impact at CarbonMarket!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: holding.project.title,
          text: shareText,
          url: `${window.location.origin}/projects/${holding.project.id}`,
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareText);
        alert("Copied to clipboard!");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Copied to clipboard!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="text-gray-600">Track your carbon credits and environmental impact</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" onClick={handleShareImpact}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Impact
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary-50 to-white">
          <CardContent className="pt-6">
            <div className="text-center">
              <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-gray-500">Total CO₂ Offset</p>
              <p className="text-3xl font-bold text-primary">
                {portfolio.totalCredits || 0}
              </p>
              <p className="text-sm text-gray-500">tons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Award className="w-8 h-8 text-secondary mx-auto mb-2" />
              <p className="text-sm text-gray-500">Credits Owned</p>
              <p className="text-3xl font-bold text-gray-900">
                {portfolio.totalCredits || 0}
              </p>
              <p className="text-sm text-gray-500">credits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-gray-500">Projects Supported</p>
              <p className="text-3xl font-bold text-gray-900">
                {portfolio.holdings?.length || 0}
              </p>
              <p className="text-sm text-gray-500">unique projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Total Investment</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolio.totalSpent || 0)}
              </p>
              <p className="text-sm text-gray-500">USD</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="holdings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        {/* Holdings Tab */}
        <TabsContent value="holdings" className="space-y-6">
          <div className="grid gap-4">
            {portfolio.holdings?.map((holding: any) => (
              <Card key={holding.project.id}>
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-40 md:h-auto">
                      <Image
                        src={holding.project.imageUrl}
                        alt={holding.project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 192px"
                        className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">
                              {CATEGORY_ICONS[holding.project.category]}{" "}
                              {CATEGORY_LABELS[holding.project.category]}
                            </Badge>
                            <Badge variant="secondary">{holding.project.standard}</Badge>
                          </div>
                          <Link
                            href={`/projects/${holding.project.id}`}
                            className="font-semibold text-lg hover:text-primary transition-colors"
                          >
                            {holding.project.title}
                          </Link>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {holding.project.location}, {holding.project.country}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{holding.totalCredits}</p>
                          <p className="text-sm text-gray-500">credits owned</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Value: {formatCurrency(holding.totalCredits * holding.project.pricePerCredit)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                        <div className="flex gap-6 text-gray-500">
                          <span>First purchased: {formatDate(holding.firstPurchase)}</span>
                          <span>Purchases: {holding.purchaseCount}</span>
                        </div>
                        <Link href={`/projects/${holding.project.id}`}>
                          <Button variant="ghost" size="sm">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Credits by project category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value} credits`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Offset Timeline</CardTitle>
                <CardDescription>Cumulative carbon offset over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData}>
                        <defs>
                          <linearGradient id="colorOffset" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value: number) => `${value} tons`} />
                        <Area
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#10B981"
                          fillOpacity={1}
                          fill="url(#colorOffset)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No timeline data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Impact Equivalents */}
          <Card>
            <CardHeader>
              <CardTitle>Environmental Impact</CardTitle>
              <CardDescription>
                Your {portfolio.totalCredits || 0} tons of CO₂ offset is equivalent to:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TreePine className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {(portfolio.totalCredits || 0) * 45}
                  </p>
                  <p className="text-sm text-gray-600">Trees planted</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="text-2xl font-bold text-gray-900">
                    {((portfolio.totalCredits || 0) * 2600).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Miles not driven</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Sun className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {((portfolio.totalCredits || 0) * 111).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Light bulbs for a year</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Factory className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {((portfolio.totalCredits || 0) / 7.5).toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Homes powered for a year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Offset Certificates</CardTitle>
              <CardDescription>Official certificates for your carbon offset purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.holdings?.map((holding: any, index: number) => (
                  <div
                    key={holding.project.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{holding.project.title}</p>
                        <p className="text-sm text-gray-500">
                          {holding.totalCredits} credits | {formatDate(holding.firstPurchase)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCertificate(holding)}>
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShareHolding(holding)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
