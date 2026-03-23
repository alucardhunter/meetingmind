'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import type { Commitment } from '@/types';
import { Calendar, DollarSign, User, CheckCircle2, Circle, AlertTriangle, ExternalLink } from 'lucide-react';

interface CommitmentCardProps {
  commitment: Commitment;
  onToggleStatus?: (commitment: Commitment) => void;
  showMeetingLink?: boolean;
  compact?: boolean;
}

export function CommitmentCard({
  commitment,
  onToggleStatus,
  showMeetingLink = true,
  compact = false,
}: CommitmentCardProps) {
  const { t } = useI18n();

  const statusConfig = {
    open: { variant: 'warning' as const, icon: Circle, color: 'text-amber-500', label: t('commitments.status.open') },
    fulfilled: { variant: 'success' as const, icon: CheckCircle2, color: 'text-green-500', label: t('commitments.status.fulfilled') },
    overdue: { variant: 'error' as const, icon: AlertTriangle, color: 'text-red-500', label: t('commitments.status.overdue') },
  };

  const status = commitment.status;
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const isOverdue = commitment.deadline && new Date(commitment.deadline) < new Date() && status === 'open';

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (compact) {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
        <button
          onClick={() => onToggleStatus?.(commitment)}
          className={`mt-0.5 flex-shrink-0 ${isOverdue ? 'text-red-500' : config.color}`}
        >
          <StatusIcon className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${status === 'fulfilled' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {commitment.text}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {commitment.deadline && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDeadline(commitment.deadline)}
              </span>
            )}
            {commitment.amount && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {commitment.amount}
              </span>
            )}
            {showMeetingLink && (
              <Link
                href={`/meetings/${commitment.meetingId}`}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                {commitment.meetingTitle}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`transition-all duration-200 ${
        isOverdue ? 'border-red-300 bg-red-50/30' : status === 'fulfilled' ? 'border-green-200 bg-green-50/20' : ''
      }`}
    >
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={() => onToggleStatus?.(commitment)}
              className={`mt-0.5 flex-shrink-0 ${isOverdue ? 'text-red-500' : config.color}`}
            >
              <StatusIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-base font-medium leading-snug ${
                status === 'fulfilled' ? 'line-through text-slate-400' : 'text-slate-900'
              }`}>
                {commitment.text}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {commitment.deadline && (
                  <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                    <Calendar className="w-4 h-4" />
                    <span className={isOverdue ? 'font-semibold' : ''}>
                      {formatDeadline(commitment.deadline)}
                    </span>
                  </div>
                )}
                {commitment.amount && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{commitment.amount}</span>
                  </div>
                )}
                {commitment.owner && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-600">
                    <User className="w-4 h-4" />
                    <span>{commitment.owner}</span>
                  </div>
                )}
              </div>

              {showMeetingLink && (
                <Link
                  href={`/meetings/${commitment.meetingId}`}
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-3 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('commitments.goToMeeting')}: {commitment.meetingTitle}
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <Badge variant={isOverdue ? 'error' : config.variant}>
              {isOverdue ? t('commitments.status.overdue') : config.label}
            </Badge>
            {onToggleStatus && commitment.status !== 'fulfilled' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleStatus(commitment)}
                className="text-xs"
              >
                {t('commitments.actions.markFulfilled')}
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
