'use client';

import { useI18n } from '@/i18n';
import { Card, CardBody, Badge } from '@/components/ui';
import type { Meeting } from '@/types';
import { Calendar, Mic, CheckCircle2 } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const { t } = useI18n();

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
    <Card hover className="overflow-hidden">
      <CardBody className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{meeting.title}</h3>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(meeting.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={statusVariant(meeting.status)}>
            {t(`meetings.detail.status.${meeting.status}`)}
          </Badge>
        </div>

        {meeting.audioUrl && (
          <div className="mb-4">
            <audio
              src={meeting.audioUrl}
              controls
              className="w-full h-10 rounded-lg"
            />
          </div>
        )}

        {meeting.summary && (
          <div className="space-y-3">
            {meeting.summary.actionItems.length > 0 && (
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Action Items
                </p>
                <ul className="space-y-1">
                  {meeting.summary.actionItems.slice(0, 3).map((item) => (
                    <li key={item.id} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
