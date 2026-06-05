'use client';

import React, { useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1200; // 1.2 seconds count up
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const ease = progress * (2 - progress);
      const current = Math.floor(ease * (end - start) + start);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="neo-card p-6 relative overflow-hidden bg-white dark:bg-zinc-950">
      {/* Background Icon Watermark */}
      <div className="absolute right-[-10px] bottom-[-10px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <Icon className="h-28 w-28" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {title}
        </span>
        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-black tracking-tight text-black dark:text-white">
          {displayValue}
        </span>
        {trend && (
          <span
            className={`text-xs font-bold ${
              trend.isPositive ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
    </div>
  );
}
