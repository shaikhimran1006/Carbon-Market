import { NextRequest, NextResponse } from "next/server";
import { calculateFootprint, FootprintData } from "@/lib/calculator";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const data: FootprintData = await request.json();

    // Validate input
    const requiredFields = [
      "carType",
      "milesPerWeek",
      "publicTransit",
      "homeSize",
      "energySource",
      "heatingType",
      "diet",
      "shortFlights",
      "mediumFlights",
      "longFlights",
    ];

    for (const field of requiredFields) {
      if (data[field as keyof FootprintData] === undefined) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const result = calculateFootprint(data);

    // Save calculation if user is logged in
    if (session?.user?.id) {
      await prisma.footprintCalculation.create({
        data: {
          userId: session.user.id,
          totalEmissions: result.total,
          transportation: result.breakdown.transportation,
          homeEnergy: result.breakdown.homeEnergy,
          diet: result.breakdown.diet,
          travel: result.breakdown.travel,
          inputData: JSON.stringify(data),
        },
      });
    }

    // Get recommended projects to offset
    const recommendedProjects = await prisma.project.findMany({
      take: 4,
      orderBy: { pricePerCredit: "asc" },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    const formattedProjects = recommendedProjects.map((project) => {
      const avgRating =
        project.reviews.length > 0
          ? project.reviews.reduce((sum, r) => sum + r.rating, 0) / project.reviews.length
          : 0;

      return {
        id: project.id,
        title: project.title,
        category: project.category,
        pricePerCredit: project.pricePerCredit,
        imageUrl: project.imageUrl,
        rating: Math.round(avgRating * 10) / 10,
        sdgGoals: JSON.parse(project.sdgGoals),
      };
    });

    // Calculate offset cost
    const avgPrice =
      recommendedProjects.reduce((sum, p) => sum + p.pricePerCredit, 0) /
      recommendedProjects.length;
    const offsetCost = Math.round(result.total * avgPrice * 100) / 100;

    return NextResponse.json({
      ...result,
      recommendedProjects: formattedProjects,
      offsetCost,
      creditsNeeded: Math.ceil(result.total),
    });
  } catch (error) {
    console.error("Error calculating footprint:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
