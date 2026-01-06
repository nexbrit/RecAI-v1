'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CandidateData } from './CandidateRow';
import { ScoreBadge, MatchBadge, ScoreBreakdown } from '@/components/shared/ScoreBadge';
import { PipelineStatusBadge } from '@/components/shared/StatusIndicator';
import { SkillBar } from '@/components/shared/SkillBar';
import { KeyHint } from '@/components/shared/KeyHint';
import { Button } from '@/components/ui/button';
import {
  X,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Mail,
  FileText,
  Play,
  ArrowRight,
} from 'lucide-react';

interface QuickPreviewProps {
  candidate: CandidateData;
  onClose: () => void;
  onEvaluate?: () => void;
  onMoveStage?: (stage: string) => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

export function QuickPreview({
  candidate,
  onClose,
  onEvaluate,
  onMoveStage,
  onNavigate,
}: QuickPreviewProps) {
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate?.('next');
      }
      if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate?.('prev');
      }
      if (e.key === 'e') {
        e.preventDefault();
        onEvaluate?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, onEvaluate]);

  // Mock score breakdown (would come from real data)
  const scoreBreakdown = [
    { label: 'Experience', score: 8.5 },
    { label: 'Skills Match', score: 7.2 },
    { label: 'Education', score: 9.0 },
    { label: 'Communication', score: 8.0 },
  ];

  // Skills with deterministic levels based on skill name hash (avoids hydration mismatch)
  const skillsWithLevels = candidate.skills.slice(0, 5).map((skill, i) => ({
    name: skill,
    level: 60 + ((skill.charCodeAt(0) + skill.length * 7 + i * 13) % 40),
  }));

  return (
    <div className="preview-panel animate-slide-in-right">
      {/* Header */}
      <div className="preview-panel-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-terminal-hover flex items-center justify-center text-text-primary font-semibold">
            {candidate.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {candidate.name}
            </h3>
            <p className="text-xs text-text-muted">{candidate.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.('prev')}
            className="p-1 rounded hover:bg-terminal-hover text-text-muted hover:text-text-primary transition-colors"
            title="Previous (K)"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigate?.('next')}
            className="p-1 rounded hover:bg-terminal-hover text-text-muted hover:text-text-primary transition-colors"
            title="Next (J)"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-terminal-hover text-text-muted hover:text-text-primary transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="preview-panel-content space-y-6">
        {/* Status & Scores */}
        <div className="flex items-center justify-between">
          <PipelineStatusBadge status={candidate.stage} size="md" />
          <div className="flex items-center gap-3">
            {candidate.score !== undefined && (
              <div className="text-center">
                <ScoreBadge score={candidate.score} size="lg" animated />
                <p className="text-2xs text-text-muted mt-1">Score</p>
              </div>
            )}
            {candidate.matchPercentage !== undefined && (
              <div className="text-center">
                <MatchBadge percentage={candidate.matchPercentage} size="lg" />
                <p className="text-2xs text-text-muted mt-1">Match</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="terminal-card space-y-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Mail className="w-4 h-4 text-text-muted" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.rate && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <span className="w-4 h-4 flex items-center justify-center text-text-muted font-mono text-xs">
                $
              </span>
              <span>
                {candidate.rate.currency}{candidate.rate.amount}/{candidate.rate.period}
              </span>
            </div>
          )}
          {candidate.source && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <ExternalLink className="w-4 h-4 text-text-muted" />
              <span>Source: {candidate.source}</span>
            </div>
          )}
        </div>

        {/* Score Breakdown */}
        {candidate.score !== undefined && (
          <div>
            <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
              Score Breakdown
            </h4>
            <ScoreBreakdown scores={scoreBreakdown} />
          </div>
        )}

        {/* Skills */}
        <div>
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            Skills
          </h4>
          <div className="space-y-2">
            {skillsWithLevels.map((skill, index) => (
              <SkillBar
                key={index}
                name={skill.name}
                level={skill.level}
                color="score"
              />
            ))}
            {candidate.skills.length > 5 && (
              <p className="text-xs text-text-muted">
                +{candidate.skills.length - 5} more skills
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="btn-terminal-secondary"
              onClick={onEvaluate}
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Evaluate
              <KeyHint keys={['E']} size="sm" className="ml-auto" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="btn-terminal-secondary"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              View CV
            </Button>
          </div>
          <Button
            className="w-full btn-terminal btn-terminal-primary"
            onClick={() => onMoveStage?.(getNextStage(candidate.stage))}
          >
            Move to {getNextStageName(candidate.stage)}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer with shortcuts */}
      <div className="px-4 py-2 border-t border-border-subtle bg-terminal-base">
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <KeyHint keys={['J', 'K']} size="sm" />
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <KeyHint keys={['E']} size="sm" />
              Evaluate
            </span>
          </div>
          <span className="flex items-center gap-1">
            <KeyHint keys={['Esc']} size="sm" />
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

function getNextStage(currentStage: CandidateData['stage']): string {
  const stageOrder = ['new', 'screening', 'qualified', 'interview', 'submitted', 'offer'];
  const currentIndex = stageOrder.indexOf(currentStage);
  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) {
    return currentStage;
  }
  return stageOrder[currentIndex + 1];
}

function getNextStageName(currentStage: CandidateData['stage']): string {
  const stageNames: Record<string, string> = {
    new: 'Screening',
    screening: 'Qualified',
    qualified: 'Interview',
    interview: 'Submitted',
    submitted: 'Offer',
    offer: 'Offer',
    rejected: 'Rejected',
  };
  return stageNames[currentStage] || currentStage;
}
