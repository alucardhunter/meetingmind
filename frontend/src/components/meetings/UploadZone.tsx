'use client';

import { useState, useRef, useCallback } from 'react';
import { useI18n } from '@/i18n';
import { cn } from '@/components/ui';
import { Upload, Mic, CheckCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // MB
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  recordingBlob?: Blob | null;
}

export function UploadZone({
  onFileSelect,
  accept = 'audio/*',
  maxSize = 500,
  isRecording = false,
  onStartRecording,
  onStopRecording,
  recordingBlob,
}: UploadZoneProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        if (file.size > maxSize * 1024 * 1024) {
          alert(`File must be smaller than ${maxSize}MB`);
          return;
        }
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [maxSize, onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File must be smaller than ${maxSize}MB`);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const hasFile = selectedFile || recordingBlob;

  return (
    <div className="space-y-6">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer',
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100',
          hasFile && 'border-green-500 bg-green-50'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {hasFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-medium text-slate-900">
              {selectedFile?.name || 'Recording ready'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {selectedFile && `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
              {recordingBlob && 'Recording captured'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900">
                {t('meetings.new.dropzone.title')}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {t('meetings.new.dropzone.subtitle')}
              </p>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t('meetings.new.dropzone.formats')}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-sm text-slate-500 dark:text-slate-300">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-700 mb-3">{t('meetings.new.record.title')}</p>
        <button
          type="button"
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200',
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          )}
        >
          {isRecording ? (
            <>
              <div className="w-3 h-3 bg-white rounded-sm" />
              {t('meetings.new.record.stop')}
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              {t('meetings.new.record.start')}
            </>
          )}
        </button>
        {isRecording && (
          <p className="text-sm text-red-600 mt-2 font-medium">
            {t('meetings.new.record.recording')}
          </p>
        )}
      </div>
    </div>
  );
}
