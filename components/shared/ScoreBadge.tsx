'use client';

import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export function ScoreBadge({
  score,
  maxScore = 10,
  size = 'md',
  showLabel = false,
  className,
  animated = false,
}: ScoreBadgeProps) {
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const scoreClass = getScoreClass(normalizedScore, maxScore);

  const sizeClasses = {
    sm: 'min-w-[24px] h-5 text-2xs px-1.5',
    md: 'min-w-[28px] h-6 text-xs px-2',
    lg: 'min-w-[36px] h-8 text-sm px-2.5',
  };

  return (
    <span
      className={cn(
        "score-badge inline-flex items-center justify-center",
        "rounded font-mono font-semibold",
        sizeClasses[size],
        scoreClass,
        animated && "hover:animate-score-pulse",
        className
      )}
    >
      {normalizedScore.toFixed(1)}
      {showLabel && <span className="ml-0.5 text-2xs opacity-70">/{maxScore}</span>}
    </span>
  );
}

function getScoreClass(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return 'score-10';
  if (percentage >= 80) return 'score-9';
  if (percentage >= 70) return 'score-8';
  if (percentage >= 60) return 'score-7';
  if (percentage >= 50) return 'score-6';
  if (percentage >= 40) return 'score-5';
  if (percentage >= 30) return 'score-4';
  if (percentage >= 20) return 'score-3';
  if (percentage >= 10) return 'score-2';
  return 'score-1';
}

// Match percentage badge
interface MatchBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MatchBadge({ percentage, size = 'md', className }: MatchBadgeProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  const getMatchClass = () => {
    if (clampedPercentage >= 90) return 'score-10';
    if (clampedPercentage >= 75) return 'score-8';
    if (clampedPercentage >= 60) return 'score-6';
    if (clampedPercentage >= 40) return 'score-4';
    return 'score-2';
  };

  const sizeClasses = {
    sm: 'min-w-[32px] h-5 text-2xs px-1.5',
    md: 'min-w-[40px] h-6 text-xs px-2',
    lg: 'min-w-[48px] h-8 text-sm px-2.5',
  };

  return (
    <span
      className={cn(
        "score-badge inline-flex items-center justify-center",
        "rounded font-mono font-semibold",
        sizeClasses[size],
        getMatchClass(),
        className
      )}
    >
      {clampedPercentage}%
    </span>
  );
}

// Score breakdown display
interface ScoreBreakdownProps {
  scores: {
    label: string;
    score: number;
    maxScore?: number;
    weight?: number;
  }[];
  className?: string;
}

export function ScoreBreakdown({ scores, className }: ScoreBreakdownProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {scores.map((item, index) => (
        <div key={index} className="flex items-center justify-between gap-4">
          <span className="text-sm text-text-secondary flex-1">{item.label}</span>
          <div className="flex items-center gap-2">
            {item.weight && (
              <span className="text-2xs text-text-muted font-mono">
                x{item.weight}
              </span>
            )}
            <ScoreBadge score={item.score} maxScore={item.maxScore} size="sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
