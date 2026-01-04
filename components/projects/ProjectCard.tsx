"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SDGBadges } from "@/components/projects/SDGBadges";
import { StarRating } from "@/components/projects/StarRating";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatNumber, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { MapPin, ShoppingCart, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { ProjectCardProps } from "@/types";

export function ProjectCard({
  id,
  title,
  category,
  pricePerCredit,
  location,
  country,
  isVerraCertified,
  sdgGoals,
  imageUrl,
  rating,
  reviewCount,
  availableCredits,
}: ProjectCardProps) {
  const { addItem, isLoading } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(id, 1);
      toast({
        title: "Added to cart",
        description: `1 credit from ${title} added to your cart.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Link href={`/projects/${id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-800">
              {CATEGORY_ICONS[category]} {CATEGORY_LABELS[category]}
            </Badge>
          </div>
          {isVerraCertified && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                VERRA
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mt-2">
            <MapPin className="w-4 h-4 mr-1" />
            {location}, {country}
          </div>

          {/* SDG Goals */}
          <div className="mt-3">
            <SDGBadges goals={sdgGoals} size="sm" />
          </div>

          {/* Rating */}
          <div className="flex items-center mt-3">
            <StarRating rating={rating} size="sm" />
            <span className="ml-2 text-sm text-gray-500">({reviewCount})</span>
          </div>

          {/* Available Credits */}
          <p className="text-sm text-gray-500 mt-2">
            {formatNumber(availableCredits)} credits available
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Price */}
          <div>
            <span className="text-2xl font-bold text-primary">{formatCurrency(pricePerCredit)}</span>
            <span className="text-sm text-gray-500">/credit</span>
          </div>

          {/* Add to Cart */}
          <Button
            size="sm"
            variant="accent"
            onClick={handleAddToCart}
            disabled={isAdding || isLoading}
            className="gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
