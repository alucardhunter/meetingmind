'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Card, CardBody, Badge, Button } from '@/components/ui';
import type { Commitment } from '@/types';
import { Calendar, DollarSign, User, CheckCircle2, Circle, AlertTriangle, ExternalLink, Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';

interface CommitmentCardProps {
  commitment: Commitment;
  onToggleStatus?: (commitment: Commitment) => void;
  onUpdate?: (id: string, updates: { text?: string; deadline?: string }) => void;
  showMeetingLink?: boolean;
  compact?: boolean;
}

export function CommitmentCard({
  commitment,
  onToggleStatus,
  onUpdate,
  showMeetingLink = true,
  compact = false,
}: CommitmentCardProps) {
  const { t } = useI18n();
  const [editingText, setEditingText] = useState(false);
  const [editTextValue, setEditTextValue] = useState(commitment.text);
  const [editingDeadline, setEditingDeadline] = useState(false);
  const [editDeadlineValue, setEditDeadlineValue] = useState(
    commitment.deadline ? commitment.deadline.split('T')[0] : ''
  );

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

  const handleTextSave = () => {
    const trimmed = editTextValue.trim();
    if (trimmed && trimmed !== commitment.text) {
      onUpdate?.(commitment.id, { text: trimmed });
    }
    setEditingText(false);
  };

  const handleTextCancel = () => {
    setEditTextValue(commitment.text);
    setEditingText(false);
  };

  const handleDeadlineSave = () => {
    if (editDeadlineValue) {
      const isoDeadline = new Date(editDeadlineValue).toISOString();
      onUpdate?.(commitment.id, { deadline: isoDeadline });
    } else {
      onUpdate?.(commitment.id, { deadline: '' });
    }
    setEditingDeadline(false);
  };

  const handleDeadlineCancel = () => {
    setEditDeadlineValue(commitment.deadline ? commitment.deadline.split('T')[0] : '');
    setEditingDeadline(false);
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
          {editingText ? (
            <div className="flex items-start gap-2">
              <textarea
                className="flex-1 text-sm border border-indigo-300 rounded px-2 py-1 resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={editTextValue}
                onChange={(e) => setEditTextValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSave(); } if (e.key === 'Escape') { handleTextCancel(); } }}
                autoFocus
                rows={2}
              />
              <button onClick={handleTextSave} className="text-green-600 hover:text-green-700 mt-1"><Save className="w-4 h-4" /></button>
              <button onClick={handleTextCancel} className="text-slate-400 hover:text-slate-600 mt-1"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <div className="flex items-start gap-1">
              <p className={`text-sm flex-1 ${status === 'fulfilled' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                {commitment.text}
              </p>
              {onUpdate && status !== 'fulfilled' && (
                <button
                  onClick={() => setEditingText(true)}
                  className="text-slate-400 hover:text-indigo-600 mt-0.5 flex-shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
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
              {/* Text row */}
              <div className="flex items-start gap-2">
                {editingText ? (
                  <div className="flex-1">
                    <textarea
                      className="w-full border border-indigo-300 rounded-lg px-3 py-2 text-base resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={editTextValue}
                      onChange={(e) => setEditTextValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSave(); } if (e.key === 'Escape') { handleTextCancel(); } }}
                      autoFocus
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={handleTextSave} className="text-green-600 border-green-300 hover:bg-green-50">
                        <Save className="w-3 h-3 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleTextCancel}>
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={`text-base font-medium leading-snug flex-1 ${
                      status === 'fulfilled' ? 'line-through text-slate-400' : 'text-slate-900'
                    }`}>
                      {commitment.text}
                    </p>
                    {onUpdate && status !== 'fulfilled' && (
                      <button
                        onClick={() => setEditingText(true)}
                        className="text-slate-400 hover:text-indigo-600 flex-shrink-0 mt-0.5"
                        title="Edit text"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Deadline row */}
              {editingDeadline ? (
                <div className="flex items-center gap-2 mt-3">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <input
                    type="date"
                    className="border border-indigo-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editDeadlineValue}
                    onChange={(e) => setEditDeadlineValue(e.target.value)}
                    autoFocus
                  />
                  <Button size="sm" variant="outline" onClick={handleDeadlineSave} className="text-green-600 border-green-300 hover:bg-green-50">
                    <Save className="w-3 h-3 mr-1" /> Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDeadlineCancel}>
                    <X className="w-3 h-3 mr-1" /> Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {commitment.deadline && (
                    <button
                      onClick={() => onUpdate && setEditingDeadline(true)}
                      className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-600' : 'text-slate-600'} ${onUpdate && status !== 'fulfilled' ? 'cursor-pointer hover:text-indigo-600 group' : ''}`}
                      title={onUpdate && status !== 'fulfilled' ? 'Click to edit deadline' : undefined}
                    >
                      <Calendar className={`w-4 h-4 ${onUpdate && status !== 'fulfilled' ? 'group-hover:text-indigo-600' : ''}`} />
                      <span className={isOverdue ? 'font-semibold' : ''}>
                        {formatDeadline(commitment.deadline)}
                      </span>
                      {onUpdate && status !== 'fulfilled' && (
                        <Pencil className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 ml-1" />
                      )}
                    </button>
                  )}
                  {!commitment.deadline && onUpdate && status !== 'fulfilled' && (
                    <button
                      onClick={() => setEditingDeadline(true)}
                      className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Add deadline</span>
                      <Pencil className="w-3 h-3 ml-1" />
                    </button>
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
              )}

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
