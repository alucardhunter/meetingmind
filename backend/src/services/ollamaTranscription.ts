/**
 * Transcription Service
 * 
 * Uses OpenAI Whisper API for audio transcription.
 * NO fallbacks - errors are thrown directly.
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface TranscriptionResult {
  transcript: string;
  source: 'openai';
}

/**
 * Custom error class for transcription errors
 */
export class TranscriptionError extends Error {
  constructor(
    message: string,
    public readonly cause?: string
  ) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

/**
 * Transcribe audio using OpenAI Whisper API.
 * Throws TranscriptionError on any failure - no fallbacks.
 */
export async function transcribeWithOllama(
  audioPath: string,
  _meetingId: string
): Promise<TranscriptionResult> {
  // Extract just the filename from path or URL
  let filename = audioPath;
  if (audioPath.startsWith('http')) {
    // Full URL: extract path after /uploads/
    const match = audioPath.match(/\/uploads\/(.+)$/);
    filename = match ? match[1] : audioPath;
  } else if (filename.includes('/')) {
    // Strip any path prefix, keep only filename
    filename = filename.split('/').pop() || filename;
  }
  const fullPath = path.resolve(process.cwd(), 'uploads', filename);

  // Check file exists
  if (!fs.existsSync(fullPath)) {
    throw new TranscriptionError(
      `Audio file not found: ${fullPath}`,
      'FILE_NOT_FOUND'
    );
  }

  // Check API key
  if (!OPENAI_API_KEY) {
    throw new TranscriptionError(
      'OPENAI_API_KEY environment variable is not configured',
      'MISSING_API_KEY'
    );
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(fullPath));
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'text');

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    console.error('DEBUG: Whisper response status:', response.status);
    console.error('DEBUG: Whisper response data:', JSON.stringify(response.data));
    console.error('DEBUG: Whisper response headers:', JSON.stringify(response.headers));

    const transcript = response.data.text || '';

    if (!transcript || transcript.trim().length === 0) {
      throw new TranscriptionError(
        'OpenAI Whisper returned empty transcript',
        'EMPTY_RESPONSE'
      );
    }

    return {
      transcript,
      source: 'openai',
    };
  } catch (error: any) {
    // If it's already our error, rethrow
    if (error instanceof TranscriptionError) {
      throw error;
    }

    // Wrap axios errors
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const statusText = error.response?.statusText;
      const responseData = error.response?.data;

      throw new TranscriptionError(
        `OpenAI Whisper API failed: ${status} ${statusText}`,
        `AXIOS_ERROR_${status}`
      );
    }

    // Wrap other errors
    throw new TranscriptionError(
      `Transcription failed: ${error.message || 'Unknown error'}`,
      'UNKNOWN_ERROR'
    );
  }
}
