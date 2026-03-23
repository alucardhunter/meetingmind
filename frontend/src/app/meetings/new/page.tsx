'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/i18n';
import { useMeetings } from '@/hooks/useMeetings';
import { UploadZone } from '@/components/meetings/UploadZone';
import { Input, Button, Card, CardBody, ProgressBar, Alert, Spinner } from '@/components/ui';

export default function NewMeetingPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useI18n();
  const { uploadMeeting, loading: uploadLoading } = useMeetings();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [contact, setContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [apiError, setApiError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleFileSelect = useCallback((file: File) => {
    setAudioFile(file);
    setRecordingBlob(null);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setRecordingBlob(blob);
        setAudioFile(null);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setApiError('Could not access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setApiError('Please enter a meeting title');
      return;
    }
    if (!audioFile && !recordingBlob) {
      setApiError('Please select or record an audio file');
      return;
    }

    setApiError('');
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('date', date);
      if (contact.trim()) {
        formData.append('contact', contact.trim());
      }

      if (audioFile) {
        formData.append('audio', audioFile);
      } else if (recordingBlob) {
        const fileName = `recording-${Date.now()}.webm`;
        const file = new File([recordingBlob], fileName, { type: 'audio/webm' });
        formData.append('audio', file);
      }

      setUploadProgress(30);
      const meeting = await uploadMeeting(formData);
      setUploadProgress(100);

      setTimeout(() => {
        router.push(`/meetings/${meeting.id}`);
      }, 500);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : t('common.error'));
      setUploadProgress(0);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('meetings.new.title')}</h1>
        <p className="text-slate-600">{t('meetings.new.subtitle')}</p>
      </div>

      {apiError && (
        <Alert variant="error" className="mb-6">
          {apiError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardBody className="space-y-6">
            <Input
              label={t('meetings.new.titleLabel')}
              placeholder={t('meetings.new.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label={t('meetings.new.contactLabel')}
              placeholder={t('meetings.new.contactPlaceholder')}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('meetings.new.dateLabel')}
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <UploadZone
              onFileSelect={handleFileSelect}
              isRecording={isRecording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              recordingBlob={recordingBlob}
            />
          </CardBody>
        </Card>

        {uploadLoading && <ProgressBar value={uploadProgress} showLabel className="mb-4" />}

        <div className="flex gap-4">
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => router.back()}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" size="lg" className="flex-1" loading={uploadLoading} disabled={uploadLoading}>
            {uploadLoading ? t('meetings.new.uploading') : t('meetings.new.upload')}
          </Button>
        </div>
      </form>
    </div>
  );
}
