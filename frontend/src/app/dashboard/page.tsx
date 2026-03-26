'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMeetings, useCommitments } from '@/hooks/useMeetings';
import { useI18n } from '@/i18n';
import { CommitmentCard } from '@/components/commitments';
import { MeetingsList } from '@/components/meetings';
import { Card, CardBody, Button, Spinner } from '@/components/ui';
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
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
        />
      </div>

      {/* Overdue Alert */}
      {overdueCommitments.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardBody>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200">
                  {t('dashboard.alerts.overdue', { count: String(overdueCommitments.length) })}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {t('dashboard.alerts.overdueDescription')}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Recent Commitments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t('dashboard.recentCommitments')}
          </h2>
          <Link href="/commitments" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('dashboard.meetings.viewAll')}
          </Link>
        </div>

        {statsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : recentCommitments.length > 0 ? (
          <div className="space-y-4">
            {recentCommitments.map((c) => (
              <CommitmentCard key={c.id} commitment={c} onToggleStatus={handleToggle} />
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="py-12 text-center">
              <ListTodo className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-300">{t('dashboard.noCommitments')}</p>
              <Link href="/meetings/new" className="mt-4 inline-block">
                <Button>{t('dashboard.quickUpload')}</Button>
              </Link>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Recent Meetings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {t('dashboard.meetings.title')}
          </h2>
          <Link href="/meetings" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            {t('dashboard.meetings.viewAll')}
          </Link>
        </div>
        <MeetingsList />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'indigo' | 'amber' | 'green' | 'red';
}) {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    red: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-sm text-slate-500 dark:text-slate-300">{title}</p>
        </div>
      </CardBody>
    </Card>
  );
}
