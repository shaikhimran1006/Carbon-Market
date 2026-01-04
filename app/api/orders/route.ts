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

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paymentMethod, sessionId } = await request.json();

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { project: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Calculate total
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.project.pricePerCredit,
      0
    );

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: "COMPLETED",
        paymentMethod: paymentMethod || "credit_card",
        items: {
          create: cartItems.map((item) => ({
            projectId: item.projectId,
            quantity: item.quantity,
            pricePerCredit: item.project.pricePerCredit,
          })),
        },
      },
      include: {
        items: {
          include: {
            project: true,
          },
        },
      },
    });

    // Update available credits for each project
    for (const item of cartItems) {
      await prisma.project.update({
        where: { id: item.projectId },
        data: {
          availableCredits: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
