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
  source: 'openai' | 'sample' | 'error';
  error?: string;
}

// Sample transcript for demo purposes when transcription fails
export const SAMPLE_TRANSCRIPT = `Meeting with John Smith on March 15th, 2026.

John: I need the project proposal by next Friday, March 21st.
John: The budget should be around $15,000.
John: Sarah will handle the design work.

Sarah: I can deliver the designs by Thursday, March 20th.

John: Let's schedule a follow-up for next week.`;

/**
 * Transcribe audio using OpenAI Whisper API.
 */
export async function transcribeWithOllama(
  audioPath: string,
  _meetingId: string
): Promise<TranscriptionResult> {
  const fullPath = path.resolve(process.cwd(), audioPath);

  if (!fs.existsSync(fullPath)) {
    return {
      transcript: SAMPLE_TRANSCRIPT,
      source: 'sample',
      error: `File not found: ${fullPath}`,
    };
  }

  if (!OPENAI_API_KEY) {
    return {
      transcript: SAMPLE_TRANSCRIPT,
      source: 'sample',
      error: 'OPENAI_API_KEY not configured',
    };
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
      return {
        transcript: SAMPLE_TRANSCRIPT,
        source: 'sample',
        error: 'Empty transcript from OpenAI Whisper',
      };
    }

    return {
      transcript,
      source: 'openai',
    };
  } catch (error: any) {
    return {
      transcript: SAMPLE_TRANSCRIPT,
      source: 'sample',
      error: `OpenAI Whisper transcription failed: ${error.message}`,
    };
  }
}

/**
 * Get a sample transcript for testing
 */
export function getSampleTranscript(): string {
  return SAMPLE_TRANSCRIPT;
}
