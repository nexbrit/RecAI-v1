'use client';

import { cn } from '@/lib/utils';
import { LiveCounter } from '@/components/shared/LiveCounter';

export type PipelineStage =
  | 'new'
  | 'screening'
  | 'qualified'
  | 'interview'
  | 'submitted'
  | 'offer'
  | 'rejected';

interface StageMetric {
  stage: PipelineStage;
  label: string;
  count: number;
  icon: string;
}

interface MetricsRibbonProps {
  metrics: StageMetric[];
  activeStage?: PipelineStage | null;
  onStageClick?: (stage: PipelineStage) => void;
}

const stageStyles: Record<PipelineStage, string> = {
  new: 'stage-new',
  screening: 'stage-screening',
  qualified: 'stage-qualified',
  interview: 'stage-interview',
  submitted: 'stage-submitted',
  offer: 'stage-offer',
  rejected: 'stage-rejected',
};

const stageRingColors: Record<PipelineStage, string> = {
  new: 'ring-stage-new',
  screening: 'ring-stage-screening',
  qualified: 'ring-stage-qualified',
  interview: 'ring-stage-interview',
  submitted: 'ring-stage-submitted',
  offer: 'ring-stage-offer',
  rejected: 'ring-stage-rejected',
};

export function MetricsRibbon({
  metrics,
  activeStage,
  onStageClick
}: MetricsRibbonProps) {
  return (
    <div className="metrics-ribbon">
      {metrics.map((metric) => (
        <button
          key={metric.stage}
          onClick={() => onStageClick?.(metric.stage)}
          className={cn(
            "metric-pill stage-pill",
            stageStyles[metric.stage],
            activeStage === metric.stage && [
              "active",
              stageRingColors[metric.stage]
            ]
          )}
        >
          <span>{metric.icon}</span>
          <span className="font-medium">{metric.label}</span>
          <LiveCounter
            value={metric.count}
            className="font-mono font-semibold"
          />
        </button>
      ))}
    </div>
  );
}

// Default metrics for demo/placeholder purposes
export const defaultPipelineMetrics: StageMetric[] = [
  { stage: 'new', label: 'NEW', count: 12, icon: '⚡' },
  { stage: 'screening', label: 'L1', count: 8, icon: '🔄' },
  { stage: 'qualified', label: 'QUAL', count: 24, icon: '✓' },
  { stage: 'interview', label: 'INT', count: 3, icon: '💬' },
  { stage: 'submitted', label: 'SUB', count: 6, icon: '📤' },
  { stage: 'offer', label: 'OFFER', count: 2, icon: '💰' },
];
