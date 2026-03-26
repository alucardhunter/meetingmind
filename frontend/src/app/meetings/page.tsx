'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMeetings } from '@/hooks/useMeetings';
import { useI18n } from '@/i18n';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { Button, Spinner, Card, CardBody } from '@/components/ui';
import { Plus, Mic } from 'lucide-react';

export default function MeetingsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { meetings, loading, error, fetchMeetings } = useMeetings();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMeetings();
    }
  }, [isAuthenticated, fetchMeetings]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {t('meetings.title', 'Meetings')}
        </h1>
        <Link href="/meetings/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {t('meetings.newMeeting', 'New Meeting')}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="w-8 h-8" />
        </div>
      ) : meetings.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {t('meetings.empty.title', 'No meetings yet')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              {t(
                'meetings.empty.description',
                'Upload your first meeting recording to get started with commitment tracking.'
              )}
            </p>
            <Link href="/meetings/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('meetings.empty.cta', 'Upload Meeting')}
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
              <MeetingCard meeting={meeting} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
