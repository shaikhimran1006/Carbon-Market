import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Get total users
        const totalUsers = await prisma.user.count();

        // Get users by role
        const usersByRole = await prisma.user.groupBy({
            by: ["role"],
            _count: { role: true },
        });

        // Get total projects
        const totalProjects = await prisma.project.count();

        // Get total orders
        const totalOrders = await prisma.order.count({
            where: { status: "COMPLETED" },
        });

        // Get total revenue
        const revenueData = await prisma.order.aggregate({
            where: { status: "COMPLETED" },
            _sum: { totalAmount: true },
        });
        const totalRevenue = revenueData._sum.totalAmount || 0;

        // Get total credits traded
        const creditsData = await prisma.orderItem.aggregate({
            where: {
                order: { status: "COMPLETED" },
            },
            _sum: { quantity: true },
        });
        const totalCreditsTraded = creditsData._sum.quantity || 0;

        // Get recent orders
        const recentOrders = await prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { name: true },
                },
            },
        });

        // Get top projects by revenue
        const topProjects = await prisma.project.findMany({
            take: 5,
            include: {
                seller: {
                    select: { name: true },
                },
                orderItems: {
                    where: {
                        order: { status: "COMPLETED" },
                    },
                    select: {
                        quantity: true,
                        pricePerCredit: true,
                    },
                },
            },
        });

        const formattedTopProjects = topProjects
            .map((project) => ({
                id: project.id,
                title: project.title,
                country: project.country,
                pricePerCredit: project.pricePerCredit,
                orderCount: project.orderItems.length,
                revenue: project.orderItems.reduce(
                    (sum, item) => sum + item.quantity * item.pricePerCredit,
                    0
                ),
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        return NextResponse.json({
            totalUsers,
            totalProjects,
            totalOrders,
            totalRevenue,
            totalCreditsTraded,
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                userName: order.user.name,
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt,
            })),
            topProjects: formattedTopProjects,
            usersByRole: usersByRole.map((group) => ({
                role: group.role,
                count: group._count.role,
            })),
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
