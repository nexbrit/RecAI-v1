'use client';

import { cn } from '@/lib/utils';
import { LiveCounter } from '@/components/shared/LiveCounter';
import { KeyHint } from '@/components/shared/KeyHint';

export type PipelineStage =
  | 'all'
  | 'new'
  | 'screening'
  | 'qualified'
  | 'interview'
  | 'submitted'
  | 'offer'
  | 'rejected';

interface StageTab {
  id: PipelineStage;
  label: string;
  count: number;
  shortcut?: string;
}

interface StageTabsProps {
  tabs: StageTab[];
  activeTab: PipelineStage;
  onTabChange: (tab: PipelineStage) => void;
  className?: string;
}

const stageColors: Record<PipelineStage, string> = {
  all: 'border-accent',
  new: 'border-stage-new',
  screening: 'border-stage-screening',
  qualified: 'border-stage-qualified',
  interview: 'border-stage-interview',
  submitted: 'border-stage-submitted',
  offer: 'border-stage-offer',
  rejected: 'border-stage-rejected',
};

const stageTextColors: Record<PipelineStage, string> = {
  all: 'text-accent',
  new: 'text-stage-new',
  screening: 'text-stage-screening',
  qualified: 'text-stage-qualified',
  interview: 'text-stage-interview',
  submitted: 'text-stage-submitted',
  offer: 'text-stage-offer',
  rejected: 'text-stage-rejected',
};

export function StageTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: StageTabsProps) {
  return (
    <div className={cn("tabs-terminal", className)}>
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "tab-terminal",
              isActive && [
                "active",
                stageColors[tab.id],
                stageTextColors[tab.id],
              ]
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "tab-count",
              isActive && `bg-${tab.id === 'all' ? 'accent' : `stage-${tab.id}`}/20`
            )}>
              <LiveCounter value={tab.count} />
            </span>
            {tab.shortcut && (
              <KeyHint keys={[tab.shortcut]} size="sm" className="opacity-50 ml-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Default tabs for demo
export const defaultStageTabs: StageTab[] = [
  { id: 'all', label: 'All', count: 55, shortcut: '0' },
  { id: 'new', label: 'New', count: 12, shortcut: '1' },
  { id: 'screening', label: 'Screening', count: 8, shortcut: '2' },
  { id: 'qualified', label: 'Qualified', count: 24, shortcut: '3' },
  { id: 'interview', label: 'Interview', count: 3, shortcut: '4' },
  { id: 'submitted', label: 'Submitted', count: 6, shortcut: '5' },
  { id: 'offer', label: 'Offer', count: 2, shortcut: '6' },
];
