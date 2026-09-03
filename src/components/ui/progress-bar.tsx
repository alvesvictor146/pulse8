import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: "brand" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  brand:   "bg-brand-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger:  "bg-danger-500",
  info:    "bg-info-500",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = "brand",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-surface-600 font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-surface-500 font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-surface-100 rounded-full overflow-hidden", sizeMap[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorMap[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
