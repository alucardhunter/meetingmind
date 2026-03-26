'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { useMeetings, useCommitments } from '@/hooks/useMeetings';
import { TranscriptViewer } from '@/components/meetings/TranscriptViewer';
import { CommitmentCard } from '@/components/commitments';
import { mockTranscribeMeeting, extractMeetingCommitments, ollamaTranscribeMeeting, ollamaExtractCommitments, setMeetingTranscript, updateCommitment } from '@/services/api';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  Spinner,
  Alert,
} from '@/components/ui';
import {
  Calendar,
  Copy,
  Check,
  Send,
  ArrowLeft,
  ListTodo,
  Play,
  FileText,
  X,
} from 'lucide-react';
import type { Meeting, Commitment } from '@/types';

export default function MeetingDetailPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const { meeting, loading, error, fetchMeeting, sendToNotion, sendToSlack } = useMeetings();
  const { commitments, fetchCommitments, toggleCommitmentStatus } = useCommitments();
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id as string;

  const [copied, setCopied] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string>('');
  const [transcribeLoading, setTranscribeLoading] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [showManualTranscript, setShowManualTranscript] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [manualTranscriptLoading, setManualTranscriptLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && meetingId) {
      fetchMeeting(meetingId);
      fetchCommitments({});
    }
  }, [isAuthenticated, meetingId, fetchMeeting, fetchCommitments]);

  // Filter commitments for this meeting
  const meetingCommitments = commitments.filter((c) => c.meetingId === meetingId);

  const handleToggle = useCallback(
    async (commitment: Commitment) => {
      await toggleCommitmentStatus(commitment);
    },
    [toggleCommitmentStatus]
  );

  const handleUpdate = useCallback(
    async (id: string, updates: { text?: string; deadline?: string }) => {
      await updateCommitment(id, updates);
      await fetchCommitments({});
    },
    [fetchCommitments]
  );

  const handleCopy = useCallback(() => {
    if (!meeting) return;
    const content = buildExportText(meeting, meetingCommitments);
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [meeting, meetingCommitments]);

  const handleExport = useCallback(
    async (type: 'notion' | 'slack') => {
      setExportLoading(type);
      try {
        if (type === 'notion') {
          await sendToNotion(meetingId);
        } else {
          await sendToSlack(meetingId);
        }
      } catch {
        // handled in hook
      } finally {
        setExportLoading(null);
      }
    },
    [meetingId, sendToNotion, sendToSlack]
  );

  const handleMockTranscribe = useCallback(async () => {
    setTranscribeLoading(true);
    try {
      await mockTranscribeMeeting(meetingId);
      await fetchMeeting(meetingId);
    } catch (err) {
      console.error('Mock transcription failed:', err);
    } finally {
      setTranscribeLoading(false);
    }
  }, [meetingId, fetchMeeting]);

  const handleManualTranscript = useCallback(async () => {
    if (!manualTranscript.trim()) return;
    setManualTranscriptLoading(true);
    try {
      await setMeetingTranscript(meetingId, manualTranscript);
      await fetchMeeting(meetingId);
      setShowManualTranscript(false);
      setManualTranscript('');
    } catch (err) {
      console.error('Manual transcript failed:', err);
    } finally {
      setManualTranscriptLoading(false);
    }
  }, [meetingId, manualTranscript, fetchMeeting]);

  const handleExtractCommitments = useCallback(async () => {
    setExtractLoading(true);
    try {
      await extractMeetingCommitments(meetingId);
      await fetchCommitments({});
      await fetchMeeting(meetingId);
    } catch (err) {
      console.error('Mock extraction failed:', err);
    } finally {
      setExtractLoading(false);
    }
  }, [meetingId, fetchCommitments, fetchMeeting]);

  const buildExportText = (m: Meeting, comms: Commitment[]): string => {
    let text = `# ${m.title}\n`;
    text += `**Date:** ${new Date(m.date).toLocaleDateString()}\n`;
    if (m.contact) text += `**Contact:** ${m.contact}\n\n`;
    else text += '\n';

    text += `## Commitments (${comms.filter((c) => c.status === 'open').length} open)\n`;
    comms.forEach((c) => {
      const status = c.status === 'fulfilled' ? '✅' : c.status === 'overdue' ? '🔴' : '⬜';
      text += `${status} ${c.text}`;
      if (c.deadline) text += ` [Due: ${c.deadline}]`;
      if (c.amount) text += ` [$${c.amount}]`;
      text += '\n';
    });

    if (m.summary?.dates.length) {
      text += `\n## Key Dates\n`;
      m.summary.dates.forEach((d) => { text += `- ${d.date}: ${d.context}\n`; });
    }
    if (m.summary?.amounts.length) {
      text += `\n## Money Mentioned\n`;
      m.summary.amounts.forEach((a) => { text += `- ${a.amount}: ${a.context}\n`; });
    }
    if (m.transcript) {
      text += `\n## Transcript\n${m.transcript}`;
    }
    return text;
  };

  const statusVariant = (status: Meeting['status']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'transcribed': return 'info';
      case 'summarized': return 'success';
      default: return 'default';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (error || !meeting) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Alert variant="error" className="mb-6">{error || 'Meeting not found'}</Alert>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900">{meeting.title}</h1>
              <Badge variant={statusVariant(meeting.status)}>
                {t(`meetings.detail.status.${meeting.status}`)}
              </Badge>
              {meeting.status === 'pending' && (
                <>
                  <Button size="sm" onClick={handleMockTranscribe} loading={transcribeLoading}>
                    <Play className="w-4 h-4 mr-1" /> Mock Transcribe
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => { setTranscribeLoading(true); try { await ollamaTranscribeMeeting(meetingId); await fetchMeeting(meetingId); } catch (e) { console.error(e); } finally { setTranscribeLoading(false); } }}>
                    🤖 Ollama Transcribe
                  </Button>
                  {!showManualTranscript ? (
                    <Button size="sm" variant="outline" onClick={() => setShowManualTranscript(true)}>
                      <FileText className="w-4 h-4 mr-1" /> Enter Transcript Manually
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setShowManualTranscript(false); setManualTranscript(''); }}>
                      <X className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  )}
                </>
              )}
              {meeting.status === 'transcribed' && (
                <>
                  <Button size="sm" onClick={handleExtractCommitments} loading={extractLoading}>
                    Extract Commitments
                  </Button>
                  <Button size="sm" variant="outline" onClick={async () => { setExtractLoading(true); try { await ollamaExtractCommitments(meetingId); await fetchCommitments({}); await fetchMeeting(meetingId); } catch (e) { console.error(e); } finally { setExtractLoading(false); } }}>
                    🤖 Ollama Extract
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-slate-500 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(meeting.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
              </div>
              {meeting.contact && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{meeting.contact}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      {/* Manual Transcript Input */}
      {showManualTranscript && (
        <Card className="mb-8 border-2 border-indigo-200">
          <CardHeader>
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Enter Transcript Manually
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Paste or type the meeting transcript below. The Ollama extract button will use this transcript.
            </p>
          </CardHeader>
          <CardBody>
            <textarea
              className="w-full h-48 p-3 border border-slate-300 rounded-lg text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Meeting title on March 15th, 2026.

John: I need the project proposal by next Friday, March 21st.
John: The budget should be around $15,000.
Sarah: I can deliver the designs by Thursday, March 20th.

John: Let's schedule a follow-up for next week.`}
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-3">
              <Button variant="ghost" onClick={() => { setShowManualTranscript(false); setManualTranscript(''); }}>
                Cancel
              </Button>
              <Button onClick={handleManualTranscript} loading={manualTranscriptLoading} disabled={!manualTranscript.trim()}>
                Save Transcript
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Audio Player */}
      {meeting.audioUrl && (
        <Card className="mb-8">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Play className="w-6 h-6 text-indigo-600" />
              </div>
              <audio src={meeting.audioUrl} controls preload="metadata" crossOrigin="anonymous" className="flex-1 h-10" onError={() => setAudioError(`Failed to load: ${meeting.audioUrl}`)} />
            </div>
            {audioError && (
              <p className="text-sm text-red-600 mt-2">⚠️ {audioError}</p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Commitment Cards — PRIMARY */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <ListTodo className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">
            {t('meetings.detail.commitments')}
          </h2>
          {meetingCommitments.length > 0 && (
            <Badge variant="info">{meetingCommitments.length}</Badge>
          )}
        </div>

        {meetingCommitments.length > 0 ? (
          <div className="space-y-4">
            {meetingCommitments.map((c) => (
              <CommitmentCard key={c.id} commitment={c} onToggleStatus={handleToggle} onUpdate={handleUpdate} />
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="py-10 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ListTodo className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500">{t('meetings.detail.noCommitments')}</p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Export Section */}
      <Card className="mb-8">
        <CardHeader>
          <h3 className="font-semibold text-slate-900">{t('meetings.detail.export.title')}</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleCopy} className="flex items-center gap-2">
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? t('meetings.detail.export.copied') : t('meetings.detail.export.copy')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('notion')}
              loading={exportLoading === 'notion'}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t('meetings.detail.export.notion')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('slack')}
              loading={exportLoading === 'slack'}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {t('meetings.detail.export.slack')}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Transcript */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-slate-900">{t('meetings.detail.transcript')}</h3>
        </CardHeader>
        <CardBody>
          <TranscriptViewer transcript={meeting.transcript} />
        </CardBody>
      </Card>
    </div>
  );
}
