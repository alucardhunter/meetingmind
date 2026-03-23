'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { getMeetings } from '@/services/api';
import { MeetingCard } from './MeetingCard';
import type { Meeting } from '@/types';
import { Button } from '@/components/ui';
import { Mic } from 'lucide-react';

export function MeetingsList() {
  const { t } = useI18n();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMeetings() {
      try {
        const data = await getMeetings();
        // Show only the 5 most recent
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
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-dark-800 rounded-lg animate-pulse" />
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
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <MeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </div>
  );
}
