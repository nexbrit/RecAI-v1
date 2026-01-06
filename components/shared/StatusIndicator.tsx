'use client';

import { cn } from '@/lib/utils';
import {
  Zap,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  Send,
  DollarSign,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export type PipelineStatus =
  | 'new'
  | 'screening'
  | 'qualified'
  | 'interview'
  | 'submitted'
  | 'offer'
  | 'rejected';

export type ProcessStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'error'
  | 'warning';

interface StatusIndicatorProps {
  status: PipelineStatus | ProcessStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const pipelineIcons: Record<PipelineStatus, React.ComponentType<{ className?: string }>> = {
  new: Zap,
  screening: RotateCcw,
  qualified: CheckCircle2,
  interview: MessageSquare,
  submitted: Send,
  offer: DollarSign,
  rejected: XCircle,
};

const processIcons: Record<ProcessStatus, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
};

const pipelineLabels: Record<PipelineStatus, string> = {
  new: 'New',
  screening: 'Screening',
  qualified: 'Qualified',
  interview: 'Interview',
  submitted: 'Submitted',
  offer: 'Offer',
  rejected: 'Rejected',
};

const processLabels: Record<ProcessStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  error: 'Error',
  warning: 'Warning',
};

const statusColors: Record<string, string> = {
  new: 'text-stage-new',
  screening: 'text-stage-screening',
  qualified: 'text-stage-qualified',
  interview: 'text-stage-interview',
  submitted: 'text-stage-submitted',
  offer: 'text-stage-offer',
  rejected: 'text-stage-rejected',
  pending: 'text-text-muted',
  processing: 'text-accent',
  completed: 'text-stage-qualified',
  error: 'text-stage-rejected',
  warning: 'text-stage-screening',
};

export function StatusIndicator({
  status,
  size = 'md',
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const isPipeline = status in pipelineIcons;
  const Icon = isPipeline
    ? pipelineIcons[status as PipelineStatus]
    : processIcons[status as ProcessStatus];
  const label = isPipeline
    ? pipelineLabels[status as PipelineStatus]
    : processLabels[status as ProcessStatus];
  const colorClass = statusColors[status];

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isSpinning = status === 'processing';

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon
        className={cn(
          sizeClasses[size],
          colorClass,
          isSpinning && "animate-spin"
        )}
      />
      {showLabel && (
        <span className={cn("text-sm", colorClass)}>{label}</span>
      )}
    </span>
  );
}

// Pipeline status badge with background
interface PipelineStatusBadgeProps {
  status: PipelineStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PipelineStatusBadge({
  status,
  size = 'md',
  className,
}: PipelineStatusBadgeProps) {
  const Icon = pipelineIcons[status];
  const label = pipelineLabels[status];

  const sizeClasses = {
    sm: 'text-2xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-2.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        "stage-pill inline-flex items-center rounded-full font-medium",
        `stage-${status}`,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{label}</span>
    </span>
  );
}
