/**
 * Ollama Transcription Service
 * 
 * Uses Ollama's audio transcription API when available (requires local Ollama with whisper model).
 * Falls back to sample transcript for demo purposes when Ollama Cloud is used.
 */

import fs from 'fs';
import path from 'path';
import { ollamaConfig } from '../config/ollama';

// Sample transcript for demo purposes when audio transcription is not available
export const SAMPLE_TRANSCRIPT = `Meeting with John Smith on March 15th, 2026.

John: I need the project proposal by next Friday, March 21st.
John: The budget should be around $15,000.
John: Sarah will handle the design work.

Sarah: I can deliver the designs by Thursday, March 20th.

John: Let's schedule a follow-up for next week.`;

export interface TranscriptionResult {
  transcript: string;
  source: 'ollama' | 'sample' | 'error';
  error?: string;
}

const OLLAMA_API = ollamaConfig.baseUrl;
const API_KEY = ollamaConfig.apiKey;

/**
 * Determine MIME type from file extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.mp4': 'audio/mp4',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.opus': 'audio/opus',
  };
  return mimeTypes[ext.toLowerCase()] || 'audio/mpeg';
}

/**
 * Transcribe audio using Ollama's whisper model.
 * 
 * Note: Ollama Cloud (ollama.com/api) does NOT currently support audio transcription.
 * Only local Ollama installations with the whisper model support this feature.
 * 
 * This implementation attempts to use Ollama's audio API and falls back to
 * sample transcript if the API is not available.
 */
export async function transcribeWithOllama(
  audioPath: string,
  _meetingId: string
): Promise<TranscriptionResult> {
  // Resolve the audio file path
  const fullPath = path.resolve(process.cwd(), audioPath);

  console.log('[Ollama Transcription] Attempting transcription for:', fullPath);
  console.log('[Ollama Transcription] Ollama API:', OLLAMA_API);
  console.log('[Ollama Transcription] API Key present:', !!API_KEY, '(length:', API_KEY?.length || 0, ')');

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.log('[Ollama Transcription] File not found, using sample transcript');
    return {
      transcript: SAMPLE_TRANSCRIPT,
      source: 'sample',
      error: `File not found: ${fullPath}`,
    };
  }

  // Read file and convert to base64
  let audioBuffer: Buffer;
  try {
    audioBuffer = fs.readFileSync(fullPath);
    console.log('[Ollama Transcription] File size:', audioBuffer.length, 'bytes');
  } catch (readError) {
    console.error('[Ollama Transcription] Failed to read audio file:', readError);
    return {
      transcript: SAMPLE_TRANSCRIPT,
      source: 'sample',
      error: `Failed to read audio file: ${readError}`,
    };
  }

  const base64Audio = audioBuffer.toString('base64');
  const ext = path.extname(fullPath);
  const mimeType = getMimeType(ext);

  console.log('[Ollama Transcription] MIME type:', mimeType);

  try {
    // Attempt to use Ollama's audio transcription endpoint
    // Note: This endpoint requires local Ollama with whisper model
    const response = await fetch(`${OLLAMA_API}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'whisper',
        file: base64Audio,
        mimeType: mimeType,
      }),
    });

    console.log('[Ollama Transcription] Response status:', response.status);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[Ollama Transcription] Ollama API error:', response.status, errorBody);
      
      // Ollama Cloud doesn't support audio - fall back to sample
      return {
        transcript: SAMPLE_TRANSCRIPT,
        source: 'sample',
        error: `Ollama audio API not available (${response.status}): ${errorBody}`,
      };
    }

    const data = await response.json() as { text?: string };
    const transcript = data.text || '';

    if (!transcript) {
      console.log('[Ollama Transcription] Empty response, using sample');
      return {
        transcript: SAMPLE_TRANSCRIPT,
        source: 'sample',
        error: 'Empty transcript from Ollama',
      };
    }

    console.log('[Ollama Transcription] Success, transcript length:', transcript.length);
    return {
      transcript,
      source: 'ollama',
    };
  } catch (error) {
    // Network error or other issue - Ollama Cloud doesn't support audio transcription
    console.error('[Ollama Transcription] Request failed:', error);
    
    return {
      transcript: SAMPLE_TRANSCRIPT,
      source: 'sample',
      error: `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get a sample transcript for testing
 */
export function getSampleTranscript(): string {
  return SAMPLE_TRANSCRIPT;
}
