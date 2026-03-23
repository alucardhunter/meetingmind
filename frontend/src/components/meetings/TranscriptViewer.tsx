'use client';

import { useMemo } from 'react';

interface TranscriptViewerProps {
  transcript?: string;
}

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

// Parse simple transcript format: [00:00:00 - 00:00:05] Speaker: Text
// or plain text
function parseTranscript(transcript: string): TranscriptSegment[] {
  const lines = transcript.split('\n');
  const segments: TranscriptSegment[] = [];
  const timeRegex = /\[(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})\]\s*(?:(\w+):\s*)?(.*)/;

  for (const line of lines) {
    const match = line.match(timeRegex);
    if (match) {
      const [, start, end, speaker, text] = match;
      const startSecs = parseTime(start);
      const endSecs = parseTime(end);
      segments.push({ start: startSecs, end: endSecs, speaker, text });
    } else if (line.trim()) {
      // Plain text line
      segments.push({
        start: 0,
        end: 0,
        text: line.trim(),
      });
    }
  }

  return segments;
}

function parseTime(time: string): number {
  const parts = time.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function TranscriptViewer({ transcript }: TranscriptViewerProps) {
  const segments = useMemo(() => {
    if (!transcript) return [];
    return parseTranscript(transcript);
  }, [transcript]);

  if (!transcript) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <p>Transcript not available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
      {segments.map((segment, index) => (
        <div key={index} className="flex gap-3 py-2 hover:bg-slate-50 rounded-lg px-2">
          {segment.start > 0 && (
            <span className="text-xs text-slate-400 font-mono flex-shrink-0 mt-0.5 w-16">
              {formatTime(segment.start)}
            </span>
          )}
          <div className="flex-1">
            {segment.speaker && (
              <span className="text-xs font-semibold text-indigo-600 mr-2">
                {segment.speaker}:
              </span>
            )}
            <span className="text-sm text-slate-700 leading-relaxed">{segment.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
