import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "newest";

    let orderBy: any = { createdAt: "desc" };
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highest":
        orderBy = { rating: "desc" };
        break;
      case "lowest":
        orderBy = { rating: "asc" };
        break;
      case "helpful":
        orderBy = { helpfulCount: "desc" };
        break;
    }

    const reviews = await prisma.review.findMany({
      where: { projectId: params.projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { rating, title, comment } = await request.json();

    if (!rating || rating < 1 || rating > 10) {
      return NextResponse.json(
        { message: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    // Check if user already reviewed this project
    const existingReview = await prisma.review.findFirst({
      where: {
        projectId: params.projectId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { message: "You have already reviewed this project" },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        projectId: params.projectId,
        userId: session.user.id,
        rating,
        title: title || "",
        comment: comment || "",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
