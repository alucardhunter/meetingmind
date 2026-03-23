'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n';
import { getMeetings } from '@/services/api';
import type { Meeting } from '@/types';
import { Button } from '@/components/ui';
import { Mic, Calendar, ChevronRight } from 'lucide-react';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function MeetingsList() {
  const { t } = useI18n();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const data = await getMeetings();
        setMeetings(data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch meetings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-dark-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mic className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          {t('dashboard.meetings.empty.title')}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {t('dashboard.meetings.empty.description')}
        </p>
        <Link href="/meetings/new">
          <Button>{t('dashboard.meetings.empty.cta')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-200 dark:divide-dark-700">
      {meetings.map((meeting) => (
        <Link
          key={meeting.id}
          href={`/meetings/${meeting.id}`}
          className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mic className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{meeting.title}</h4>
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{meeting.date ? formatDate(meeting.date) : '—'}</span>
                {meeting.contact && (
                  <>
                    <span>•</span>
                    <span>{meeting.contact}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Link>
      ))}
    </div>
  );
}
