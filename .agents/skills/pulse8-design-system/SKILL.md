---
name: pulse8-design-system
description: Design System cheatsheet, component templates, and UI guidelines for Pulse8 (Next.js + Tailwind CSS)
---

# Pulse8 Design System & Component Library

This skill provides guidelines and snippets for building pixel-perfect Pulse8 UI components matching the 65-screen specification.

## Core UI Components

### 1. StatCard
Used in executive dashboards to display KPIs.

```tsx
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
}

export function StatCard({ title, value, change, isPositive = true, icon: Icon }: StatCardProps) {
  return (
    <div className="card p-6 border border-surface-200/80 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-surface-500">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-display text-surface-900">{value}</span>
        {change && (
          <span className={`text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? '↑' : '↓'} {change}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 2. Badge Status Tokens
* `VIP`: `bg-purple-100 text-purple-700 border-purple-200`
* `Confirmado`: `bg-emerald-100 text-emerald-700 border-emerald-200`
* `Pendente`: `bg-amber-100 text-amber-700 border-amber-200`
* `Cancelado`: `bg-rose-100 text-rose-700 border-rose-200`
