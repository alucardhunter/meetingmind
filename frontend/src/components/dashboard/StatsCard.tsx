'use client';

import { Card, CardBody } from '@/components/ui';
import { cn } from '@/components/ui';
import { FolderOpen, Calendar, TrendingUp } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: 'total' | 'month' | 'limit';
  className?: string;
}

const iconMap = {
  total: FolderOpen,
  month: Calendar,
  limit: TrendingUp,
};

export function StatsCard({ title, value, subtitle, icon, className }: StatsCardProps) {
  const Icon = iconMap[icon];
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardBody className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-indigo-600" />
        </div>
      </CardBody>
    </Card>
  );
}
