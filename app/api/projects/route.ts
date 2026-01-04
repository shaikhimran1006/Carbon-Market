import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const certified = searchParams.get("certified");
    const country = searchParams.get("country");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sdgGoals = searchParams.get("sdgGoals");

    // Build where clause
    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.pricePerCredit = {};
      if (minPrice) where.pricePerCredit.gte = parseFloat(minPrice);
      if (maxPrice) where.pricePerCredit.lte = parseFloat(maxPrice);
    }

    if (certified === "true") {
      where.standard = { in: ["VCS", "Gold Standard"] }; // VCS and Gold Standard are certified
    }

    if (country) {
      where.country = country;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { country: { contains: search } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "price-asc":
        orderBy = { pricePerCredit: "asc" };
        break;
      case "price-desc":
        orderBy = { pricePerCredit: "desc" };
        break;
      case "credits":
        orderBy = { availableCredits: "desc" };
        break;
      case "rating":
        // Will sort by computed rating below
        break;
    }

    // Get projects with reviews for rating calculation
    const projects = await prisma.project.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate average rating and format response
    let formattedProjects = projects.map((project) => {
      const avgRating =
        project.reviews.length > 0
          ? project.reviews.reduce((sum, r) => sum + r.rating, 0) / project.reviews.length
          : 0;

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        category: project.category,
        pricePerCredit: project.pricePerCredit,
        location: project.location,
        country: project.country,
        latitude: project.latitude,
        longitude: project.longitude,
        isVerraCertified: ["VCS", "Gold Standard"].includes(project.standard),
        standard: project.standard,
        sdgGoals: JSON.parse(project.sdgGoals),
        imageUrl: project.imageUrl,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: project.reviews.length,
        availableCredits: project.availableCredits,
      };
    });

    // Filter by SDG goals if specified
    if (sdgGoals) {
      const goalArray = sdgGoals.split(",").map(Number);
      formattedProjects = formattedProjects.filter((p) =>
        goalArray.some((g) => p.sdgGoals.includes(g))
      );
    }

    // Sort by rating if needed
    if (sort === "rating") {
      formattedProjects.sort((a, b) => b.rating - a.rating);
    }

    // Get total count
    const total = await prisma.project.count({ where });

    // Get unique countries for filter
    const countries = await prisma.project.findMany({
      select: { country: true },
      distinct: ["country"],
    });

    return NextResponse.json({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      countries: countries.map((c) => c.country),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
