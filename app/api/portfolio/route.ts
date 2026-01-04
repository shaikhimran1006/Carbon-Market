import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all completed orders for user
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        items: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                category: true,
                imageUrl: true,
                location: true,
                country: true,
                pricePerCredit: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate totals and build holdings
    let totalCredits = 0;
    let totalSpent = 0;
    const categoryBreakdown: Record<string, number> = {};
    const timeline: { date: string; credits: number; amount: number }[] = [];
    const holdingsMap: Record<string, {
      project: any;
      totalCredits: number;
      totalValue: number;
      purchases: { date: string; quantity: number; price: number }[];
    }> = {};

    for (const order of orders) {
      const orderCredits = order.items.reduce((sum, item) => sum + item.quantity, 0);
      totalCredits += orderCredits;
      totalSpent += order.totalAmount;

      for (const item of order.items) {
        const category = item.project.category;
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + item.quantity;

        // Build holdings
        if (!holdingsMap[item.project.id]) {
          holdingsMap[item.project.id] = {
            project: item.project,
            totalCredits: 0,
            totalValue: 0,
            purchases: [],
          };
        }
        holdingsMap[item.project.id].totalCredits += item.quantity;
        holdingsMap[item.project.id].totalValue += item.quantity * item.pricePerCredit;
        holdingsMap[item.project.id].purchases.push({
          date: order.createdAt.toISOString(),
          quantity: item.quantity,
          price: item.pricePerCredit,
        });
      }

      timeline.push({
        date: order.createdAt.toISOString().split("T")[0],
        credits: orderCredits,
        amount: order.totalAmount,
      });
    }

    // Convert holdings map to array
    const holdings = Object.values(holdingsMap).map(h => ({
      ...h,
      currentValue: h.totalCredits * h.project.pricePerCredit,
      avgPurchasePrice: h.totalValue / h.totalCredits,
      firstPurchase: h.purchases.length > 0 ? h.purchases[h.purchases.length - 1].date : null,
      purchaseCount: h.purchases.length,
    }));

    // Calculate impact equivalents
    // 1 carbon credit = 1 ton CO2
    // 1 tree absorbs ~22kg CO2/year, so ~45 trees = 1 ton
    // Average car emits ~4.6 tons/year, ~12,000 miles
    // Average home uses ~7.5 tons/year
    const impactEquivalents = {
      treesPlanted: Math.round(totalCredits * 45),
      milesDrivenOffset: Math.round(totalCredits * 2600), // miles
      homesPowered: Math.round((totalCredits / 7.5) * 10) / 10, // years
      flightsOffset: Math.round(totalCredits / 0.9), // Average flight = 0.9 tons
    };

    return NextResponse.json({
      totalCredits,
      totalSpent,
      totalOrders: orders.length,
      holdings,
      categoryBreakdown: Object.entries(categoryBreakdown).map(([category, credits]) => ({
        category,
        credits,
      })),
      timeline: timeline.reverse(), // Oldest first for charts
      impactEquivalents,
      recentOrders: orders.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
