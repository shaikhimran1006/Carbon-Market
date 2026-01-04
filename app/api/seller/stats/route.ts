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

    // Check if user is a seller or admin
    if (session.user.role !== "SELLER" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Not authorized as seller" },
        { status: 403 }
      );
    }

    // Get seller's projects
    const projects = await prisma.project.findMany({
      where: { sellerId: session.user.id },
      include: {
        reviews: {
          select: {
            rating: true,
          },
        },
        orderItems: {
          where: {
            order: {
              status: "COMPLETED",
            },
          },
          include: {
            order: {
              select: {
                createdAt: true,
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    let totalRevenue = 0;
    let totalCreditsSold = 0;
    let totalRating = 0;
    let totalReviews = 0;
    const activeProjects = projects.filter(p => p.availableCredits > 0).length;

    // Monthly revenue data (last 6 months)
    const monthlyData: Record<string, { revenue: number; credits: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short" });
      monthlyData[monthKey] = { revenue: 0, credits: 0 };
    }

    for (const project of projects) {
      // Calculate reviews
      for (const review of project.reviews) {
        totalRating += review.rating;
        totalReviews++;
      }

      // Calculate sales
      for (const item of project.orderItems) {
        const revenue = item.quantity * item.pricePerCredit;
        totalRevenue += revenue;
        totalCreditsSold += item.quantity;

        // Add to monthly data
        const orderDate = new Date(item.order.createdAt);
        const monthKey = orderDate.toLocaleDateString("en-US", { month: "short" });
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += revenue;
          monthlyData[monthKey].credits += item.quantity;
        }
      }
    }

    const avgRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    // Convert monthly data to array
    const revenueData = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: Math.round(data.revenue * 100) / 100,
      credits: data.credits,
    }));

    // Project performance data
    const projectPerformance = projects.map((p) => {
      const creditsSold = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      return {
        id: p.id,
        name: p.title.length > 20 ? p.title.substring(0, 17) + "..." : p.title,
        fullName: p.title,
        sold: creditsSold,
        available: p.availableCredits,
        total: p.totalCredits,
        revenue: p.orderItems.reduce((sum, item) => sum + item.quantity * item.pricePerCredit, 0),
      };
    });

    // Format projects for display
    const formattedProjects = projects.map((p) => {
      const creditsSold = p.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const projectRevenue = p.orderItems.reduce((sum, item) => sum + item.quantity * item.pricePerCredit, 0);
      const reviewCount = p.reviews.length;
      const projectRating = reviewCount > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

      return {
        id: p.id,
        title: p.title,
        description: p.description,
        category: p.category,
        imageUrl: p.imageUrl,
        location: p.location,
        country: p.country,
        pricePerCredit: p.pricePerCredit,
        availableCredits: p.availableCredits,
        totalCredits: p.totalCredits,
        isActive: p.availableCredits > 0,
        isVerified: true, // All projects are verified by default
        rating: projectRating,
        reviewCount,
        creditsSold,
        revenue: projectRevenue,
        createdAt: p.createdAt,
      };
    });

    // Recent orders
    const recentOrders = await prisma.orderItem.findMany({
      where: {
        project: {
          sellerId: session.user.id,
        },
        order: {
          status: "COMPLETED",
        },
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        project: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: "desc",
        },
      },
      take: 10,
    });

    const formattedOrders = recentOrders.map((item) => ({
      id: item.id,
      projectTitle: item.project.title,
      quantity: item.quantity,
      total: item.quantity * item.pricePerCredit,
      buyerName: item.order.user.name,
      buyerEmail: item.order.user.email,
      date: item.order.createdAt,
    }));

    return NextResponse.json({
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCreditsSold,
        activeProjects,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        totalProjects: projects.length,
      },
      revenueData,
      projectPerformance,
      projects: formattedProjects,
      recentOrders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching seller stats:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
