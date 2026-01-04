"use client";

import { SDG_COLORS, SDG_NAMES } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SDGBadgesProps {
  goals: number[];
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function SDGBadges({ goals, size = "md", showLabel = false }: SDGBadgesProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {goals.map((goal) => (
          <Tooltip key={goal}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "rounded-full flex items-center justify-center font-bold text-white cursor-help transition-transform hover:scale-110",
                  sizeClasses[size]
                )}
                style={{ backgroundColor: SDG_COLORS[goal] }}
              >
                {goal}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">SDG {goal}: {SDG_NAMES[goal]}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {showLabel && goals.length > 0 && (
          <span className="text-sm text-gray-500 ml-2 self-center">
            {goals.length} SDG{goals.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
}
