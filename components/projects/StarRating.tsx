"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 1-10 scale
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
}

export function StarRating({
  rating,
  maxRating = 10,
  size = "md",
  interactive = false,
  onRatingChange,
  showValue = false,
}: StarRatingProps) {
  // Convert 1-10 scale to 5 stars
  const normalizedRating = (rating / maxRating) * 5;
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.5;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      // Convert 5-star click to 10-point scale
      const newRating = ((starIndex + 1) / 5) * maxRating;
      onRatingChange(Math.round(newRating));
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, index) => {
        const isFull = index < fullStars;
        const isHalf = index === fullStars && hasHalfStar;

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            disabled={!interactive}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "text-gray-300"
              )}
              fill="currentColor"
            />
            {(isFull || isHalf) && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 text-amber-400",
                  isHalf && "clip-path-half"
                )}
                fill="currentColor"
                style={isHalf ? { clipPath: "inset(0 50% 0 0)" } : undefined}
              />
            )}
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// Interactive version for forms
interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
}

export function InteractiveStarRating({
  value,
  onChange,
  maxRating = 10,
  size = "lg",
}: InteractiveStarRatingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= value;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onChange(starValue)}
            className="cursor-pointer hover:scale-110 transition-transform"
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "text-amber-400" : "text-gray-300"
              )}
              fill={isFilled ? "currentColor" : "none"}
              strokeWidth={isFilled ? 0 : 1.5}
            />
          </button>
        );
      })}
      <span className="ml-2 text-lg font-semibold text-gray-700">
        {value} / {maxRating}
      </span>
    </div>
  );
}
