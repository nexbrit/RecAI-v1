'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface LiveCounterProps {
  value: number;
  className?: string;
  animate?: boolean;
}

export function LiveCounter({ value, className, animate = true }: LiveCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current && animate) {
      setIsAnimating(true);

      // Animate to new value
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsAnimating(false);
      }, 150);

      prevValueRef.current = value;

      return () => clearTimeout(timeout);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  return (
    <span
      className={cn(
        "live-counter",
        isAnimating && "animate-counter-tick",
        className
      )}
    >
      {formatNumber(displayValue)}
    </span>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// Large counter for dashboard displays
interface LargeCounterProps {
  value: number;
  label: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

export function LargeCounter({ value, label, trend, className }: LargeCounterProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-3xl font-mono font-bold text-text-primary tabular-nums">
        <LiveCounter value={value} />
      </span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-sm text-text-secondary">{label}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-mono",
              trend.direction === 'up' && "text-stage-qualified",
              trend.direction === 'down' && "text-stage-rejected",
              trend.direction === 'neutral' && "text-text-muted"
            )}
          >
            {trend.direction === 'up' && '+'}
            {trend.direction === 'down' && '-'}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  );
}
