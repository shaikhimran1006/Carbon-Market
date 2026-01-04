import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.update({
      where: { id: params.id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
