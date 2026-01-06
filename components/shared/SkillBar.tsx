'use client';

import { cn } from '@/lib/utils';

interface SkillBarProps {
  name: string;
  level: number; // 0-100
  maxLevel?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'accent' | 'score';
  className?: string;
}

export function SkillBar({
  name,
  level,
  maxLevel = 100,
  showPercentage = true,
  size = 'md',
  color = 'accent',
  className,
}: SkillBarProps) {
  const percentage = Math.min(Math.max((level / maxLevel) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2',
  };

  const getBarColor = () => {
    if (color === 'score') {
      if (percentage >= 80) return 'bg-score-10';
      if (percentage >= 60) return 'bg-score-8';
      if (percentage >= 40) return 'bg-score-6';
      if (percentage >= 20) return 'bg-score-4';
      return 'bg-score-2';
    }
    return 'bg-accent';
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-primary truncate">{name}</span>
        {showPercentage && (
          <span className="text-2xs font-mono text-text-muted ml-2">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className={cn("skill-bar", sizeClasses[size])}>
        <div
          className={cn("skill-bar-fill", getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Compact skill pills for table display
interface SkillPillsProps {
  skills: string[];
  max?: number;
  className?: string;
}

export function SkillPills({ skills, max = 3, className }: SkillPillsProps) {
  const displaySkills = skills.slice(0, max);
  const remaining = skills.length - max;

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {displaySkills.map((skill, index) => (
        <span
          key={index}
          className={cn(
            "inline-flex items-center",
            "px-1.5 py-0.5 rounded",
            "bg-terminal-hover border border-border-subtle",
            "text-2xs text-text-secondary"
          )}
        >
          {skill}
        </span>
      ))}
      {remaining > 0 && (
        <span className="text-2xs text-text-muted font-mono">
          +{remaining}
        </span>
      )}
    </div>
  );
}

// Skill comparison display
interface SkillComparisonProps {
  required: { name: string; level: number }[];
  candidate: { name: string; level: number }[];
  className?: string;
}

export function SkillComparison({
  required,
  candidate,
  className,
}: SkillComparisonProps) {
  // Create a map of candidate skills for easy lookup
  const candidateSkillMap = new Map(
    candidate.map((s) => [s.name.toLowerCase(), s.level])
  );

  return (
    <div className={cn("space-y-3", className)}>
      {required.map((skill, index) => {
        const candidateLevel = candidateSkillMap.get(skill.name.toLowerCase()) || 0;
        const isMet = candidateLevel >= skill.level;

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-primary">{skill.name}</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-2xs font-mono",
                  isMet ? "text-stage-qualified" : "text-stage-rejected"
                )}>
                  {candidateLevel}/{skill.level}
                </span>
                {isMet ? (
                  <span className="text-stage-qualified text-xs">&#10003;</span>
                ) : (
                  <span className="text-stage-rejected text-xs">&#10007;</span>
                )}
              </div>
            </div>
            <div className="relative h-1.5 bg-terminal-hover rounded-full overflow-hidden">
              {/* Required level marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-text-muted z-10"
                style={{ left: `${skill.level}%` }}
              />
              {/* Candidate level */}
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  isMet ? "bg-stage-qualified" : "bg-stage-rejected"
                )}
                style={{ width: `${candidateLevel}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
