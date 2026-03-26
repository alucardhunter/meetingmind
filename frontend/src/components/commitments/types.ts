import type { Commitment } from '@/types';

export interface CommitmentCardProps {
  commitment: Commitment;
  onToggleStatus?: (commitment: Commitment) => void;
  onUpdate?: (id: string, updates: { text?: string; deadline?: string }) => void;
  variant?: 'full' | 'compact';
  showMeetingLink?: boolean;
}
