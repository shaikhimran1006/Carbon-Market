"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, Leaf } from "lucide-react";

export default function CartPage() {
  const { items, total, isLoading, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <p className="text-gray-600 mb-8">
          Start browsing our carbon credit projects and make a difference today.
        </p>
        <Link href="/projects">
          <Button size="lg">
            <Leaf className="w-5 h-5 mr-2" />
            Browse Projects
          </Button>
        </Link>
      </div>
    );
  }

  const totalCredits = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.project.imageUrl}
                      alt={item.project.title}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/projects/${item.project.id}`}
                      className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.project.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {CATEGORY_ICONS[item.project.category]} {CATEGORY_LABELS[item.project.category]}
                    </p>
                    <p className="text-primary font-medium mt-1">
                      {formatCurrency(item.project.pricePerCredit)} / credit
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.id,
                            Math.min(
                              item.project.availableCredits,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="w-16 h-8 text-center"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.min(item.project.availableCredits, item.quantity + 1)
                          )
                        }
                        disabled={item.quantity >= item.project.availableCredits}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    {item.quantity} credit{item.quantity > 1 ? "s" : ""} ={" "}
                    {item.quantity} ton{item.quantity > 1 ? "s" : ""} CO₂
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.project.pricePerCredit * item.quantity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items ({items.length})</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Credits</span>
                <span>{totalCredits}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CO₂ Offset</span>
                <span>{totalCredits} tons</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Link href="/checkout" className="w-full">
                <Button size="lg" className="w-full">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/projects" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Impact Preview */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Your Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">🌳 Trees equivalent</span>
                  <span className="font-medium">{totalCredits * 45} trees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🚗 Miles offset</span>
                  <span className="font-medium">{(totalCredits * 2600).toLocaleString()} mi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">🏠 Homes powered</span>
                  <span className="font-medium">{(totalCredits / 7.5).toFixed(1)} years</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
