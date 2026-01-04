import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        priceHistory: {
          orderBy: { date: "asc" },
          take: 12,
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating =
      project.reviews.length > 0
        ? project.reviews.reduce((sum, r) => sum + r.rating, 0) / project.reviews.length
        : 0;

    const formattedProject = {
      ...project,
      sdgGoals: JSON.parse(project.sdgGoals),
      images: JSON.parse(project.images),
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: project.reviews.length,
      isVerraCertified: ["VCS", "Gold Standard"].includes(project.standard),
      priceHistory: project.priceHistory.map((ph) => ({
        date: ph.date.toISOString().split("T")[0],
        price: ph.price,
      })),
    };

    return NextResponse.json(formattedProject);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
