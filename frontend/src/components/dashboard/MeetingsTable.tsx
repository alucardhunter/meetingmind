'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Button, Badge } from '@/components/ui';
import type { Meeting } from '@/types';
import { Calendar, Mic, Eye, Trash2 } from 'lucide-react';

interface MeetingsTableProps {
  meetings: Meeting[];
  onDelete: (id: string) => void;
  loading?: boolean;
}

export function MeetingsTable({ meetings, onDelete, loading }: MeetingsTableProps) {
  const { t } = useI18n();

  if (!loading && meetings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          {t('dashboard.meetings.empty.title')}
        </h3>
        <p className="text-slate-500 mb-6 max-w-sm mx-auto">
          {t('dashboard.meetings.empty.description')}
        </p>
        <Link href="/meetings/new">
          <Button>
            <Mic className="w-4 h-4 mr-2" />
            {t('dashboard.meetings.empty.cta')}
          </Button>
        </Link>
      </div>
    );
  }

  const statusVariant = (status: Meeting['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'transcribed':
        return 'info';
      case 'summarized':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Meeting
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Date
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Status
            </th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {meetings.map((meeting) => (
            <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mic className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="font-medium text-slate-900">{meeting.title}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(meeting.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge variant={statusVariant(meeting.status)}>
                  {t(`dashboard.meetings.status.${meeting.status}`)}
                </Badge>
              </td>
              <td className="py-4 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/meetings/${meeting.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(meeting.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
