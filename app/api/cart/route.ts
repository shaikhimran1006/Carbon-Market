import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    let where: any = {};

    if (session?.user?.id) {
      where.userId = session.user.id;
    } else if (sessionId) {
      where.sessionId = sessionId;
    } else {
      return NextResponse.json({ items: [], total: 0 });
    }

    const cartItems = await prisma.cartItem.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
            pricePerCredit: true,
            imageUrl: true,
            availableCredits: true,
            category: true,
          },
        },
      },
    });

    const total = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.project.pricePerCredit,
      0
    );

    return NextResponse.json({
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId, quantity, sessionId } = await request.json();

    if (!projectId || !quantity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if project exists and has enough credits
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }

    if (project.availableCredits < quantity) {
      return NextResponse.json(
        { message: "Not enough credits available" },
        { status: 400 }
      );
    }

    // Check if item already in cart
    let existingItem;
    if (session?.user?.id) {
      existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId,
          },
        },
      });
    } else if (sessionId) {
      existingItem = await prisma.cartItem.findUnique({
        where: {
          sessionId_projectId: {
            sessionId,
            projectId,
          },
        },
      });
    }

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > project.availableCredits) {
        return NextResponse.json(
          { message: "Not enough credits available" },
          { status: 400 }
        );
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { project: true },
      });

      return NextResponse.json(updatedItem);
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        projectId,
        quantity,
        userId: session?.user?.id || null,
        sessionId: session?.user?.id ? null : sessionId,
      },
      include: { project: true },
    });

    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
