/**
 * Ollama Transcription Service
 * 
 * Note: Ollama doesn't have a native Whisper model in standard Ollama.
 * This service provides text-based extraction using the Ollama chat API.
 * For audio transcription, you would need a dedicated speech-to-text service.
 */

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
  source: 'ollama' | 'sample';
}

/**
 * Transcribe audio using Ollama. Since Ollama doesn't have native Whisper,
 * this uses a text-based approach for the demo.
 * 
 * In production, you would integrate with a dedicated STT service.
 */
export async function transcribeWithOllama(
  audioUrl: string,
  _meetingId: string
): Promise<TranscriptionResult> {
  // For demo purposes, return the sample transcript
  // In a real implementation, you would:
  // 1. Download the audio file from audioUrl
  // 2. Send it to a speech-to-text service (like OpenAI Whisper, DeepGram, etc.)
  // 3. Return the transcription
  
  return {
    transcript: SAMPLE_TRANSCRIPT,
    source: 'sample',
  };
}

/**
 * Get a sample transcript for testing
 */
export function getSampleTranscript(): string {
  return SAMPLE_TRANSCRIPT;
}
