import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { sessionId } = await request.json();

    let where: any = {};

    if (session?.user?.id) {
      where.userId = session.user.id;
    } else if (sessionId) {
      where.sessionId = sessionId;
    } else {
      return NextResponse.json({ message: "No cart to clear" });
    }

    await prisma.cartItem.deleteMany({ where });

    return NextResponse.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
