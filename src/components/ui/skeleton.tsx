import React from "react";
import { cn } from "@/lib/utils";

// ── Skeleton base ──────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={cn(
        "animate-pulse rounded-md bg-surface-200/70",
        className
      )}
    />
  );
}

// ── StatCard Skeleton ──────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="card p-6 border border-surface-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

// ── Table Row Skeleton ─────────────────────────────────────────────────────

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-surface-100">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className="h-4 flex-1"
              style={{ maxWidth: j === 0 ? "40%" : undefined }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Card Grid Skeleton ─────────────────────────────────────────────────────

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 border border-surface-200/80 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title?: string;
  message: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
}

export function EmptyState({
  title = "Nenhum dado encontrado",
  message,
  action,
  icon: Icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-surface-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
      <p className="text-sm text-surface-500 max-w-xs">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
