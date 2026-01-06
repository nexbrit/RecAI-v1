'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { KeyHint } from '@/components/shared/KeyHint';
import {
  X,
  ArrowRight,
  Play,
  Trash2,
  Download,
  Mail,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BulkActionsBarProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  onAction,
  onClear,
  className,
}: BulkActionsBarProps) {
  return (
    <div className={cn("bulk-actions-bar", className)}>
      {/* Left: Selection count */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClear}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
        </button>
      </div>

      {/* Center: Primary Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="btn-terminal btn-terminal-primary"
          onClick={() => onAction('evaluate')}
        >
          <Play className="w-4 h-4 mr-1.5" />
          Evaluate
          <KeyHint keys={['E']} size="sm" className="ml-2 opacity-70" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="btn-terminal btn-terminal-secondary"
            >
              <ArrowRight className="w-4 h-4 mr-1.5" />
              Move to...
              <KeyHint keys={['M']} size="sm" className="ml-2 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="terminal-panel-elevated min-w-[160px]">
            <DropdownMenuItem onClick={() => onAction('move:screening')}>
              <span className="w-2 h-2 rounded-full bg-stage-screening mr-2" />
              Screening
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('move:qualified')}>
              <span className="w-2 h-2 rounded-full bg-stage-qualified mr-2" />
              Qualified
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('move:interview')}>
              <span className="w-2 h-2 rounded-full bg-stage-interview mr-2" />
              Interview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('move:submitted')}>
              <span className="w-2 h-2 rounded-full bg-stage-submitted mr-2" />
              Submitted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('move:offer')}>
              <span className="w-2 h-2 rounded-full bg-stage-offer mr-2" />
              Offer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction('move:rejected')}
              className="text-stage-rejected"
            >
              <span className="w-2 h-2 rounded-full bg-stage-rejected mr-2" />
              Rejected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          variant="outline"
          className="btn-terminal btn-terminal-secondary"
          onClick={() => onAction('email')}
        >
          <Mail className="w-4 h-4 mr-1.5" />
          Email
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="btn-terminal btn-terminal-secondary"
          onClick={() => onAction('export')}
        >
          <Download className="w-4 h-4 mr-1.5" />
          Export
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="btn-terminal btn-terminal-secondary w-8 px-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="terminal-panel-elevated min-w-[180px]">
            <DropdownMenuItem onClick={() => onAction('tag')}>
              Add Tags
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('assign')}>
              Assign to Recruiter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('note')}>
              Add Note
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction('delete')}
              className="text-stage-rejected"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Keyboard hint */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <KeyHint keys={['Esc']} size="sm" />
        <span>Clear selection</span>
      </div>
    </div>
  );
}
