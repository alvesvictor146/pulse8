import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs mês anterior",
  icon: Icon,
  iconColor = "text-brand-600",
  iconBg = "bg-brand-50",
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className="card p-5 flex flex-col gap-3 animate-slide-up group">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
            iconBg
          )}
        >
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "stat-change",
              isPositive && "positive",
              isNegative && "negative",
              isNeutral && "text-surface-400"
            )}
          >
            {isPositive && <TrendingUp className="w-3 h-3" />}
            {isNegative && <TrendingDown className="w-3 h-3" />}
            {isNeutral && <Minus className="w-3 h-3" />}
            <span>
              {isPositive ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="stat-value">{value}</p>
        <p className="stat-label mt-1">{title}</p>
      </div>
      {changeLabel && change !== undefined && (
        <p className="text-2xs text-surface-400">{changeLabel}</p>
      )}
    </div>
  );
}
