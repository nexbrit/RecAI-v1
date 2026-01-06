'use client';

import { forwardRef, memo } from 'react';
import { cn } from '@/lib/utils';
import { ScoreBadge, MatchBadge } from '@/components/shared/ScoreBadge';
import { PipelineStatusBadge } from '@/components/shared/StatusIndicator';
import { SkillPills } from '@/components/shared/SkillBar';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, ExternalLink, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export interface CandidateData {
  id: string;
  name: string;
  email: string;
  title?: string;
  score?: number;
  matchPercentage?: number;
  skills: string[];
  rate?: {
    amount: number;
    currency: string;
    period: 'hour' | 'day' | 'month' | 'year';
  };
  stage: 'new' | 'screening' | 'qualified' | 'interview' | 'submitted' | 'offer' | 'rejected';
  lastActivity?: string;
  source?: string;
}

interface CandidateRowProps {
  candidate: CandidateData;
  isSelected?: boolean;
  isFocused?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  onView?: (id: string) => void;
  onEvaluate?: (id: string) => void;
  onMoveStage?: (id: string, stage: string) => void;
  onClick?: () => void;
  className?: string;
}

export const CandidateRow = memo(forwardRef<HTMLTableRowElement, CandidateRowProps>(
  function CandidateRow(
    {
      candidate,
      isSelected = false,
      isFocused = false,
      onSelect,
      onView,
      onEvaluate,
      onMoveStage,
      onClick,
      className,
    },
    ref
  ) {
    return (
      <tr
        ref={ref}
        onClick={onClick}
        className={cn(
          "table-row-terminal group cursor-pointer",
          isSelected && "selected",
          isFocused && "focused",
          className
        )}
        data-candidate-id={candidate.id}
        tabIndex={0}
      >
        {/* Checkbox */}
        <td className="w-10 px-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(candidate.id, checked as boolean)}
            onClick={(e) => e.stopPropagation()}
            className="checkbox-terminal"
          />
        </td>

        {/* Name & Title */}
        <td className="px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">
              {candidate.name}
            </span>
            {candidate.title && (
              <span className="text-xs text-text-muted truncate max-w-[200px]">
                {candidate.title}
              </span>
            )}
          </div>
        </td>

        {/* Score */}
        <td className="w-20 px-3 text-center">
          {candidate.score !== undefined ? (
            <ScoreBadge score={candidate.score} size="sm" />
          ) : (
            <span className="text-xs text-text-muted">--</span>
          )}
        </td>

        {/* Match % */}
        <td className="w-20 px-3 text-center">
          {candidate.matchPercentage !== undefined ? (
            <MatchBadge percentage={candidate.matchPercentage} size="sm" />
          ) : (
            <span className="text-xs text-text-muted">--</span>
          )}
        </td>

        {/* Skills */}
        <td className="px-3 max-w-[180px]">
          <SkillPills skills={candidate.skills} max={3} />
        </td>

        {/* Rate */}
        <td className="w-28 px-3">
          {candidate.rate ? (
            <span className="text-sm font-mono text-text-secondary">
              {candidate.rate.currency}{candidate.rate.amount}
              <span className="text-text-muted text-xs">
                /{candidate.rate.period.charAt(0)}
              </span>
            </span>
          ) : (
            <span className="text-xs text-text-muted">--</span>
          )}
        </td>

        {/* Stage */}
        <td className="w-28 px-3">
          <PipelineStatusBadge status={candidate.stage} size="sm" />
        </td>

        {/* Actions */}
        <td className="w-16 px-3">
          <div className={cn(
            "flex items-center gap-1",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-100"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-muted hover:text-text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(candidate.id);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-text-muted hover:text-text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="terminal-panel-elevated">
                <DropdownMenuItem onClick={() => onView?.(candidate.id)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEvaluate?.(candidate.id)}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Run Evaluation
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onMoveStage?.(candidate.id, 'screening')}>
                  Move to Screening
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveStage?.(candidate.id, 'qualified')}>
                  Move to Qualified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMoveStage?.(candidate.id, 'interview')}>
                  Move to Interview
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onMoveStage?.(candidate.id, 'rejected')}
                  className="text-stage-rejected"
                >
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
    );
  }
));
