'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { CandidateRow, CandidateData } from './CandidateRow';
import { BulkActionsBar } from './BulkActionsBar';
import { QuickPreview } from './QuickPreview';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type SortField = 'name' | 'score' | 'matchPercentage' | 'stage';
type SortDirection = 'asc' | 'desc';

interface CandidateTableProps {
  candidates: CandidateData[];
  onCandidateSelect?: (ids: string[]) => void;
  onCandidateView?: (id: string) => void;
  onCandidateEvaluate?: (id: string) => void;
  onCandidateMoveStage?: (id: string, stage: string) => void;
  onBulkAction?: (action: string, ids: string[]) => void;
  className?: string;
}

export function CandidateTable({
  candidates,
  onCandidateSelect,
  onCandidateView,
  onCandidateEvaluate,
  onCandidateMoveStage,
  onBulkAction,
  className,
}: CandidateTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [previewCandidate, setPreviewCandidate] = useState<CandidateData | null>(null);

  const tableRef = useRef<HTMLTableElement>(null);
  const rowRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Keyboard navigation hook
  const { focusedIndex, setFocusedIndex } = useKeyboardNavigation({
    itemCount: candidates.length,
    onSelect: (index) => {
      const candidate = sortedCandidates[index];
      if (candidate) {
        handleSelect(candidate.id, !selectedIds.has(candidate.id));
      }
    },
    onView: (index) => {
      const candidate = sortedCandidates[index];
      if (candidate) {
        setPreviewCandidate(candidate);
      }
    },
    onEscape: () => {
      setPreviewCandidate(null);
    },
    enabled: !previewCandidate, // Disable when preview is open
  });

  // Sort candidates
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'score':
          comparison = (a.score ?? 0) - (b.score ?? 0);
          break;
        case 'matchPercentage':
          comparison = (a.matchPercentage ?? 0) - (b.matchPercentage ?? 0);
          break;
        case 'stage':
          comparison = a.stage.localeCompare(b.stage);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [candidates, sortField, sortDirection]);

  // Handle selection
  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      onCandidateSelect?.(Array.from(next));
      return next;
    });
  }, [onCandidateSelect]);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const allIds = new Set(candidates.map((c) => c.id));
      setSelectedIds(allIds);
      onCandidateSelect?.(Array.from(allIds));
    } else {
      setSelectedIds(new Set());
      onCandidateSelect?.([]);
    }
  }, [candidates, onCandidateSelect]);

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField]);

  // Scroll focused row into view
  useEffect(() => {
    const candidate = sortedCandidates[focusedIndex];
    if (candidate) {
      const row = rowRefs.current.get(candidate.id);
      row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIndex, sortedCandidates]);

  // Handle bulk actions
  const handleBulkAction = useCallback((action: string) => {
    onBulkAction?.(action, Array.from(selectedIds));
    if (action === 'clear') {
      setSelectedIds(new Set());
    }
  }, [selectedIds, onBulkAction]);

  const isAllSelected = selectedIds.size === candidates.length && candidates.length > 0;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < candidates.length;

  // Get sort icon
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="overflow-x-auto scrollbar-terminal">
          <table ref={tableRef} className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border-default bg-terminal-raised">
                <th className="w-10 px-3 py-2">
                  <Checkbox
                    checked={isIndeterminate ? "indeterminate" : isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="checkbox-terminal"
                  />
                </th>
                <th className="px-3 py-2 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Name
                    <SortIcon field="name" />
                  </button>
                </th>
                <th className="w-20 px-3 py-2 text-center">
                  <button
                    onClick={() => handleSort('score')}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors w-full"
                  >
                    Score
                    <SortIcon field="score" />
                  </button>
                </th>
                <th className="w-20 px-3 py-2 text-center">
                  <button
                    onClick={() => handleSort('matchPercentage')}
                    className="flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors w-full"
                  >
                    Match
                    <SortIcon field="matchPercentage" />
                  </button>
                </th>
                <th className="px-3 py-2 text-left">
                  <span className="text-xs font-medium text-text-secondary">Skills</span>
                </th>
                <th className="w-28 px-3 py-2 text-left">
                  <span className="text-xs font-medium text-text-secondary">Rate</span>
                </th>
                <th className="w-28 px-3 py-2 text-left">
                  <button
                    onClick={() => handleSort('stage')}
                    className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Stage
                    <SortIcon field="stage" />
                  </button>
                </th>
                <th className="w-16 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {sortedCandidates.map((candidate, index) => (
                <CandidateRow
                  key={candidate.id}
                  ref={(el) => {
                    if (el) rowRefs.current.set(candidate.id, el);
                  }}
                  candidate={candidate}
                  isSelected={selectedIds.has(candidate.id)}
                  isFocused={index === focusedIndex}
                  onSelect={handleSelect}
                  onView={onCandidateView}
                  onEvaluate={onCandidateEvaluate}
                  onMoveStage={onCandidateMoveStage}
                  onClick={() => {
                    setFocusedIndex(index);
                    setPreviewCandidate(candidate);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {candidates.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-terminal-hover flex items-center justify-center mb-4">
              <span className="text-2xl">&#128100;</span>
            </div>
            <p className="text-text-primary font-medium mb-1">No candidates found</p>
            <p className="text-text-muted text-sm">
              Try adjusting your filters or add new candidates
            </p>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedIds.size}
          onAction={handleBulkAction}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* Quick Preview Panel */}
      {previewCandidate && (
        <QuickPreview
          candidate={previewCandidate}
          onClose={() => setPreviewCandidate(null)}
          onEvaluate={() => onCandidateEvaluate?.(previewCandidate.id)}
          onMoveStage={(stage) => onCandidateMoveStage?.(previewCandidate.id, stage)}
          onNavigate={(direction) => {
            const currentIndex = sortedCandidates.findIndex(
              (c) => c.id === previewCandidate.id
            );
            const newIndex = direction === 'prev'
              ? Math.max(0, currentIndex - 1)
              : Math.min(sortedCandidates.length - 1, currentIndex + 1);
            setPreviewCandidate(sortedCandidates[newIndex]);
            setFocusedIndex(newIndex);
          }}
        />
      )}
    </>
  );
}
