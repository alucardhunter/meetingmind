/**
 * Transcription Service
 * 
 * Uses OpenAI Whisper API for audio transcription.
 */

import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface TranscriptionResult {
  transcript: string;
  source: 'openai' | 'error';
  error?: string;
}

/**
 * Custom error class for transcription errors
 */
export class TranscriptionError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'TranscriptionError';
  }
}

/**
 * Transcribe audio using OpenAI Whisper API.
 * Throws TranscriptionError if audio file doesn't exist or API fails.
 */
export async function transcribeWithOllama(
  audioPath: string,
  _meetingId: string
): Promise<TranscriptionResult> {
  const fullPath = path.resolve(process.cwd(), audioPath);

  if (!fs.existsSync(fullPath)) {
    throw new TranscriptionError(`Audio file not found: ${audioPath}`);
  }

  if (!OPENAI_API_KEY) {
    throw new TranscriptionError('OPENAI_API_KEY not configured');
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

    const transcript = response.data.text || '';

    if (!transcript) {
      throw new TranscriptionError('Empty transcription response from OpenAI Whisper');
    }

    return {
      transcript,
      source: 'openai',
    };
  } catch (error: any) {
    if (error instanceof TranscriptionError) {
      throw error;
    }
    if (error.response) {
      throw new TranscriptionError(
        `OpenAI Whisper API error: ${error.response.status} - ${error.response.data?.error?.message || error.message}`,
        error.response.status
      );
    }
    throw new TranscriptionError(`OpenAI Whisper transcription failed: ${error.message}`);
  }
}
