'use client';

import { useState, useCallback } from 'react';
import {
  getMeetings,
  getMeeting,
  createMeeting,
  deleteMeeting,
  getStats,
  exportToNotion,
  exportToSlack,
  getCommitments,
  updateCommitment,
  getCommitmentStats,
} from '@/services/api';
import type { Meeting, Stats, Commitment, CommitmentFilters } from '@/types';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeetings();
      setMeetings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMeeting = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeeting(id);
      setMeeting(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (err: unknown) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const uploadMeeting = useCallback(async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const newMeeting = await createMeeting(formData);
      setMeetings((prev) => [newMeeting, ...prev]);
      return newMeeting;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload meeting');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMeeting = useCallback(async (id: string) => {
    try {
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
      throw err;
    }
  }, []);

  const sendToNotion = useCallback(async (meetingId: string) => {
    try {
      await exportToNotion(meetingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to export to Notion');
      throw err;
    }
  }, []);

  const sendToSlack = useCallback(async (meetingId: string) => {
    try {
      await exportToSlack(meetingId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to export to Slack');
      throw err;
    }
  }, []);

  return {
    meetings,
    meeting,
    stats,
    loading,
    error,
    fetchMeetings,
    fetchMeeting,
    fetchStats,
    uploadMeeting,
    removeMeeting,
    sendToNotion,
    sendToSlack,
  };
}

export function useCommitments() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [commitmentStats, setCommitmentStats] = useState<{
    total: number;
    open: number;
    fulfilled: number;
    overdue: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommitments = useCallback(async (filters?: CommitmentFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommitments(filters);
      setCommitments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch commitments');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommitmentStats = useCallback(async () => {
    try {
      const data = await getCommitmentStats();
      setCommitmentStats(data);
    } catch (err: unknown) {
      console.error('Failed to fetch commitment stats:', err);
    }
  }, []);

  const toggleCommitmentStatus = useCallback(async (commitment: Commitment) => {
    const newStatus = commitment.status === 'fulfilled' ? 'open' : 'fulfilled';
    try {
      const updated = await updateCommitment(commitment.id, { status: newStatus });
      setCommitments((prev) =>
        prev.map((c) => (c.id === commitment.id ? { ...c, status: updated.status } : c))
      );
      if (commitmentStats) {
        setCommitmentStats({
          ...commitmentStats,
          open: newStatus === 'open' ? commitmentStats.open + 1 : commitmentStats.open - 1,
          fulfilled: newStatus === 'fulfilled' ? commitmentStats.fulfilled + 1 : commitmentStats.fulfilled - 1,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update commitment');
      throw err;
    }
  }, [commitmentStats]);

  const updateCommitmentField = useCallback(
    async (id: string, updates: { text?: string; deadline?: string; status?: string }) => {
      try {
        const updated = await updateCommitment(id, updates);
        setCommitments((prev) =>
          prev.map((c) => (c.id === id ? updated : c))
        );
        return updated;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to update commitment');
        throw err;
      }
    },
    []
  );

  return {
    commitments,
    commitmentStats,
    loading,
    error,
    fetchCommitments,
    fetchCommitmentStats,
    toggleCommitmentStatus,
    updateCommitmentField,
  };
}
