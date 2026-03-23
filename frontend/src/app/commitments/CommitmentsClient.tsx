'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { useCommitments } from '@/hooks/useMeetings';
import { CommitmentCard } from '@/components/meetings/CommitmentCard';
import { Card, CardBody, Button, Spinner, Input } from '@/components/ui';
import type { Commitment, CommitmentFilters, CommitmentStatus } from '@/types';
import { ListTodo, Filter, X, Plus, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';

export default function CommitmentsClient() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    commitments,
    commitmentStats,
    loading,
    fetchCommitments,
    fetchCommitmentStats,
    toggleCommitmentStatus,
  } = useCommitments();

  const [filters, setFilters] = useState<CommitmentFilters>({
    status: (searchParams.get('status') as CommitmentStatus | '') || '',
    contact: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'deadline',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCommitments(filters);
      fetchCommitmentStats();
    }
  }, [isAuthenticated, filters, fetchCommitments, fetchCommitmentStats]);

  const handleToggle = useCallback(
    async (commitment: Commitment) => {
      await toggleCommitmentStatus(commitment);
      fetchCommitments(filters);
      fetchCommitmentStats();
    },
    [toggleCommitmentStatus, fetchCommitments, fetchCommitmentStats, filters]
  );

  const handleFilterChange = (key: keyof CommitmentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', contact: '', dateFrom: '', dateTo: '', sortBy: 'deadline' });
  };

  const hasActiveFilters = filters.status || filters.contact || filters.dateFrom || filters.dateTo;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const filteredCommitments = commitments.filter((c) => {
    if (filters.status === 'overdue') {
      return c.deadline && new Date(c.deadline) < new Date() && c.status === 'open';
    }
    return true;
  });

  const totalOpen = commitmentStats?.open ?? 0;
  const totalFulfilled = commitmentStats?.fulfilled ?? 0;
  const totalOverdue = commitmentStats?.overdue ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('commitments.title')}</h1>
          <p className="text-slate-600 mt-1">{t('commitments.subtitle')}</p>
        </div>
        <Link href="/meetings/new">
          <Button size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {t('dashboard.quickUpload')}
          </Button>
        </Link>
      </div>

      {/* Status Summary Pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        <StatusPill
          icon={<Circle className="w-4 h-4" />}
          label={t('commitments.status.open')}
          count={totalOpen}
          color="amber"
          active={filters.status === 'open'}
          onClick={() => handleFilterChange('status', filters.status === 'open' ? '' : 'open')}
        />
        <StatusPill
          icon={<CheckCircle2 className="w-4 h-4" />}
          label={t('commitments.status.fulfilled')}
          count={totalFulfilled}
          color="green"
          active={filters.status === 'fulfilled'}
          onClick={() => handleFilterChange('status', filters.status === 'fulfilled' ? '' : 'fulfilled')}
        />
        <StatusPill
          icon={<AlertTriangle className="w-4 h-4" />}
          label={t('commitments.status.overdue')}
          count={totalOverdue}
          color="red"
          active={filters.status === 'overdue'}
          onClick={() => handleFilterChange('status', filters.status === 'overdue' ? '' : 'overdue')}
        />
        <Button
          variant={showFilters ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="ml-auto"
        >
          <Filter className="w-4 h-4 mr-1" />
          {t('common.filter')}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="mb-8">
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label={t('commitments.filters.client')}
                placeholder="Client or contact name"
                value={filters.contact || ''}
                onChange={(e) => handleFilterChange('contact', e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('commitments.filters.from')}
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('commitments.filters.to')}
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('commitments.filters.sortBy')}
                </label>
                <select
                  value={filters.sortBy || 'deadline'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="deadline">{t('commitments.filters.sort.deadline')}</option>
                  <option value="createdAt">{t('commitments.filters.sort.created')}</option>
                  <option value="amount">{t('commitments.filters.sort.amount')}</option>
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  {t('common.clear')}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="w-8 h-8" />
        </div>
      ) : filteredCommitments.length === 0 ? (
        <Card>
          <CardBody className="py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('commitments.empty.title')}</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">{t('commitments.empty.description')}</p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={clearFilters}>{t('common.clear')} Filters</Button>
            ) : (
              <Link href="/meetings/new">
                <Button>{t('dashboard.quickUpload')}</Button>
              </Link>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCommitments.map((c) => (
            <CommitmentCard key={c.id} commitment={c} onToggleStatus={handleToggle} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({
  icon,
  label,
  count,
  color,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: 'amber' | 'green' | 'red' | 'indigo';
  active: boolean;
  onClick: () => void;
}) {
  const colors = {
    amber: active ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200',
    green: active ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 border border-green-200',
    red: active ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 border border-red-200',
    indigo: active ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${colors[color]}`}
    >
      {icon}
      <span>{label}</span>
      <span className={`font-bold ${active ? '' : 'opacity-70'}`}>{count}</span>
    </button>
  );
}
