/**
 * Ollama Commitment Extraction Service
 * 
 * Uses Ollama's chat API to extract commitments from meeting transcripts.
 */

import { ollamaConfig } from '../config/ollama';

export interface ExtractedCommitment {
  text: string;
  deadline?: string;
  amount?: number;
  owner?: string;
}

export interface ExtractionResult {
  commitments: ExtractedCommitment[];
  model: string;
  success: boolean;
}

/**
 * Custom error class for Ollama API errors
 */
export class OllamaApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly responseBody?: string
  ) {
    super(message);
    this.name = 'OllamaApiError';
  }
}

/**
 * Extract commitments from a transcript using Ollama's chat API
 */
export async function extractCommitmentsWithOllama(
  transcript: string
): Promise<ExtractionResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${ollamaConfig.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ollamaConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaConfig.model,
        messages: [
          {
            role: 'system',
            content: `You are a commitment extraction AI. Extract all commitments from the transcript.
Return a JSON array with this format:
[{"text": "...", "deadline": "YYYY-MM-DD", "amount": 123, "owner": "..."}]

Rules:
- Only extract explicit commitments (promises, tasks, amounts, deadlines)
- deadline format must be YYYY-MM-DD (convert natural language like "next Friday" to YYYY-MM-DD)
- amount should be a number if mentioned (e.g., 15000 for $15,000)
- owner is who made the commitment
- If no commitment found, return empty array
- Extract exact wording of the commitment`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new OllamaApiError(
        `Ollama API error: ${response.status}`,
        response.status,
        errorBody
      );
    }

    const data = await response.json() as { message?: { content?: string } };
    const content = data.message?.content || '[]';

    // Parse JSON from response
    const commitments = JSON.parse(content);
    if (!Array.isArray(commitments)) {
      throw new OllamaApiError('Invalid response format: expected JSON array');
    }

    return {
      commitments,
      model: ollamaConfig.model,
      success: true
    };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof OllamaApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new OllamaApiError('Request timeout: Ollama API did not respond within 30 seconds');
    }

    throw new OllamaApiError(
      error instanceof Error ? error.message : 'Unknown error calling Ollama API'
    );
  }
}

/**
 * Extract commitments using fallback regex-based extraction
 * This is used when Ollama API is unavailable
 */
export function extractCommitmentsWithRegex(transcript: string): ExtractedCommitment[] {
  const commitments: ExtractedCommitment[] = [];
  
  const lines = transcript.split('\n');
  const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|march|april|may|june|july|august|september|october|november|december\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|tomorrow|today)\b/gi;
  const amountRegex = /\$([\d,]+(?:\.\d{2})?)/g;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 10) continue;
    
    // Check for commitment indicators
    const hasIndicator = /\b(will|need|should|can|must|going to|promised|agreed)\b/i.test(trimmed);
    if (!hasIndicator) continue;
    
    // Extract deadline
    const dateMatch = trimmed.match(dateRegex);
    let deadline: string | undefined;
    if (dateMatch) {
      // Simple date normalization to YYYY-MM-DD
      deadline = normalizeDate(dateMatch[0]);
    }
    
    // Extract amount
    const amountMatch = trimmed.match(amountRegex);
    let amount: number | undefined;
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }
    
    // Extract owner (usually the name before colon)
    let owner: string | undefined;
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex > 0 && colonIndex < 50) {
      owner = trimmed.substring(0, colonIndex).trim();
    }
    
    // Clean up the commitment text
    let text = trimmed
      .replace(/^(John|Sarah|Mike|Jane|Tom|Bob|Alice):\s*/i, '')
      .trim();
    
    commitments.push({
      text,
      deadline,
      amount,
      owner
    });
  }
  
  return commitments;
}

function normalizeDate(dateText: string): string {
  const lower = dateText.toLowerCase().trim();
  const now = new Date();
  const year = now.getFullYear();
  
  if (lower === 'today') {
    return now.toISOString().split('T')[0];
  }
  if (lower === 'tomorrow') {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower.startsWith('next ')) {
    const dayMap: Record<string, number> = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6,
    };
    const dayName = lower.replace('next ', '');
    const targetDay = dayMap[dayName];
    if (targetDay !== undefined) {
      const d = new Date(now);
      const currentDay = d.getDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil <= 0) daysUntil += 7;
      d.setDate(d.getDate() + daysUntil);
      return d.toISOString().split('T')[0];
    }
  }
  
  // Try natural language parsing
  try {
    const parsed = new Date(dateText);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch {
    // Fall through
  }
  
  // Default to today if we can't parse
  return now.toISOString().split('T')[0];
}
