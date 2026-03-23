'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMeetings, useCommitments } from '@/hooks/useMeetings';
import { useI18n } from '@/i18n';
import { CommitmentCard } from '@/components/meetings/CommitmentCard';
import { Card, CardHeader, CardBody, Button, Spinner } from '@/components/ui';
import { Plus, AlertTriangle, CheckCircle2, Circle, ListTodo } from 'lucide-react';
import type { Commitment } from '@/types';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { loading: statsLoading, fetchStats } = useMeetings();
  const { commitments, commitmentStats, fetchCommitments, fetchCommitmentStats, toggleCommitmentStatus } =
    useCommitments();
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchCommitments();
      fetchCommitmentStats();
    }
  }, [isAuthenticated, fetchStats, fetchCommitments, fetchCommitmentStats]);

  const handleToggle = useCallback(
    async (commitment: Commitment) => {
      await toggleCommitmentStatus(commitment);
      fetchCommitmentStats();
    },
    [toggleCommitmentStatus, fetchCommitmentStats]
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const overdueCommitments = commitments.filter(
    (c) => c.deadline && new Date(c.deadline) < new Date() && c.status === 'open'
  );
  const recentCommitments = commitments.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {t('dashboard.welcome', { name: user?.name || '' })}
          </h1>
        </div>
        <Link href="/meetings/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {t('dashboard.quickUpload')}
          </Button>
        </Link>
      </div>

      {/* Commitment Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={t('dashboard.stats.totalCommitments')}
          value={commitmentStats?.total ?? '-'}
          icon={<ListTodo className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          title={t('dashboard.stats.open')}
          value={commitmentStats?.open ?? '-'}
          icon={<Circle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title={t('dashboard.stats.fulfilled')}
          value={commitmentStats?.fulfilled ?? '-'}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title={t('dashboard.stats.overdue')}
          value={commitmentStats?.overdue ?? '-'}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          highlight={!!commitmentStats?.overdue}
        />
      </div>

      {/* Overdue Alert */}
      {overdueCommitments.length > 0 && (
        <Card className="border-red-300 bg-red-50/50 mb-8">
          <CardBody>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {t('dashboard.alerts.overdueTitle')}
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  {t('dashboard.alerts.overdueDescription', { count: String(overdueCommitments.length) })}
                </p>
                <Link href="/commitments?status=overdue">
                  <Button variant="danger" size="sm">
                    {t('dashboard.alerts.viewAll')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Commitments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.recentCommitments')}</h2>
            <Link href="/commitments" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              {t('dashboard.viewAllCommitments')}
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-6 h-6" />
              </div>
            ) : recentCommitments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentCommitments.map((c) => (
                  <CommitmentCard
                    key={c.id}
                    commitment={c}
                    onToggleStatus={handleToggle}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ListTodo className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">{t('dashboard.commitments.empty.title')}</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">{t('dashboard.commitments.empty.description')}</p>
                <Link href="/meetings/new">
                  <Button size="sm">{t('dashboard.commitments.empty.cta')}</Button>
                </Link>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
          </CardHeader>
          <CardBody className="p-0">
            {upcomingDeadlines(commitments).length > 0 ? (
              <div className="divide-y divide-slate-100">
                {upcomingDeadlines(commitments).map((c) => (
                  <CommitmentCard
                    key={c.id}
                    commitment={c}
                    onToggleStatus={handleToggle}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">No upcoming deadlines</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Meetings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('dashboard.meetings.title')}</h2>
        </CardHeader>
        <CardBody className="p-0">
          <MeetingsList />
        </CardBody>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  highlight,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'amber' | 'green' | 'red';
  highlight?: boolean;
}) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
  };
  return (
    <Card className={highlight ? 'ring-2 ring-red-300' : ''}>
      <CardBody className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function MeetingsList() {
  const { meetings, loading, fetchMeetings, removeMeeting } = useMeetings();
  const { t } = useI18n();

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (window.confirm('Delete this meeting?')) {
        await removeMeeting(id);
      }
    },
    [removeMeeting]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-6 h-6" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-500">{t('dashboard.meetings.empty.title')}</p>
        <p className="text-xs text-slate-400 mt-1 mb-4">{t('dashboard.meetings.empty.description')}</p>
        <Link href="/meetings/new">
          <Button size="sm">{t('dashboard.meetings.empty.cta')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {meetings.slice(0, 5).map((meeting) => (
        <div key={meeting.id} className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{meeting.title}</p>
              <p className="text-sm text-slate-500">
                {meeting.date
                  ? new Date(meeting.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/meetings/${meeting.id}`}>
              <Button variant="ghost" size="sm">View</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(meeting.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function upcomingDeadlines(commitments: Commitment[]): Commitment[] {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return commitments
    .filter(
      (c) =>
        c.deadline &&
        new Date(c.deadline) >= now &&
        new Date(c.deadline) <= weekFromNow &&
        c.status === 'open'
    )
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
}
