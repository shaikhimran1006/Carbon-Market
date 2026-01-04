"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, Download, Leaf, Mail, TreePine, Car, Home } from "lucide-react";
import { jsPDF } from "jspdf";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const orders = await res.json();
          const foundOrder = orders.find((o: any) => o.id === orderId);
          setOrder(foundOrder);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  const totalCredits = order?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  // Download certificate as PDF
  const handleDownloadCertificate = () => {
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
    doc.text(`${totalCredits} TONS OF CO₂`, centerX, 112, { align: "center" });

    // Green checkmark in the middle - VERIFIED badge
    drawCheckmark(centerX, 128, 8);
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129);
    doc.setFont("helvetica", "bold");
    doc.text("VERIFIED", centerX, 140, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text("through verified carbon credit projects", centerX, 152, { align: "center" });

    // Projects list
    if (order?.items?.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      const projectNames = order.items.map((item: any) => item.project.title).join(", ");
      const truncatedProjects = projectNames.length > 100 ? projectNames.substring(0, 97) + "..." : projectNames;
      doc.text(`Projects: ${truncatedProjects}`, centerX, 165, { align: "center" });
    }

    // Certificate details
    const certId = `CC-${orderId?.substring(0, 8).toUpperCase() || Date.now().toString(36).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Certificate ID: ${certId}`, centerX - 60, 178);
    doc.text(`Issue Date: ${issueDate}`, centerX + 20, 178);
    doc.text(`Total Investment: ${formatCurrency(order?.totalAmount || 0)}`, centerX, 186, { align: "center" });

    // Footer message
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text("Thank you for contributing to a sustainable future.", centerX, 196, { align: "center" });

    // Save
    doc.save(`carbon-certificate-${orderId || Date.now()}.pdf`);
  };

  // Email certificate (opens email client)
  const handleEmailCertificate = () => {
    const subject = encodeURIComponent("Your Carbon Credit Certificate from CarbonMarket");
    const body = encodeURIComponent(`
Dear ${session?.user?.name || "Valued Customer"},

Thank you for your carbon credit purchase!

Order Summary:
- Order ID: ${orderId}
- Total Credits: ${totalCredits} tons of CO₂
- Total Amount: ${formatCurrency(order?.totalAmount || 0)}
- Date: ${formatDate(new Date())}

Environmental Impact:
- Trees Equivalent: ${totalCredits * 45}
- Miles of Driving Offset: ${(totalCredits * 2600).toLocaleString()}
- Homes Powered for a Year: ${(totalCredits / 7.5).toFixed(1)}

To download your official certificate, please visit your portfolio at CarbonMarket.

Thank you for making a positive environmental impact!

Best regards,
CarbonMarket Team
    `.trim());

    window.location.href = `mailto:${session?.user?.email || ""}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Purchase!</h1>
        <p className="text-lg text-gray-600">
          Your carbon offset order has been confirmed. You're making a real difference in the fight
          against climate change.
        </p>
      </div>

      {/* Order Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Order Details</span>
            <span className="text-sm font-normal text-gray-500">#{orderId?.slice(0, 8)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order?.items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="font-medium">{item.project.title}</p>
                <p className="text-sm text-gray-500">{item.quantity} credits</p>
              </div>
              <span className="font-medium">{formatCurrency(item.pricePerCredit * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4 text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order?.totalAmount || 0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card className="mb-8 bg-gradient-to-br from-primary-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" />
            Your Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TreePine className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalCredits * 45}</div>
              <div className="text-sm text-gray-600">Trees Equivalent</div>
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{(totalCredits * 2600).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Miles Offset</div>
            </div>
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Home className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{(totalCredits / 7.5).toFixed(1)}</div>
              <div className="text-sm text-gray-600">Home Years Powered</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-primary font-semibold text-xl">
              {totalCredits} tons of CO₂ offset!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Preview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Carbon Offset Certificate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-lg border-2 border-dashed border-primary/30 text-center">
            <div className="flex justify-center mb-4">
              <Leaf className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Certificate of Carbon Offset</h3>
            <p className="text-gray-600 mb-4">This certifies that</p>
            <p className="text-xl font-semibold text-primary mb-4">{totalCredits} tons of CO₂</p>
            <p className="text-gray-600 mb-4">
              have been offset through verified carbon credit projects
            </p>
            <p className="text-sm text-gray-500">
              Order ID: {orderId} | Date: {formatDate(new Date())}
            </p>
          </div>
          <div className="flex gap-4 mt-6">
            <Button className="flex-1" variant="outline" onClick={handleDownloadCertificate}>
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
            <Button className="flex-1" variant="outline" onClick={handleEmailCertificate}>
              <Mail className="w-4 h-4 mr-2" />
              Email Certificate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="text-center space-y-4">
        <p className="text-gray-600">What would you like to do next?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/portfolio">
            <Button size="lg">View My Portfolio</Button>
          </Link>
          <Link href="/projects">
            <Button size="lg" variant="outline">
              Browse More Projects
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
