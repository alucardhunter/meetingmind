/**
 * Ollama Commitment Extraction Service
 * 
 * Uses Ollama's chat API to extract commitments from meeting transcripts.
 * Endpoint: https://ollama.com/api/chat
 * Model: minimax-m2.7:cloud
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
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for cloud models

  const endpoint = `${ollamaConfig.baseUrl}/chat`;
  const model = ollamaConfig.model;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ollamaConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a commitment extraction AI. Analyze meeting transcripts and extract ALL commitments made by participants.

Extract commitments using this EXACT JSON format (no markdown, no explanation):
{"commitments": [{"text": "exact commitment text", "deadline": "YYYY-MM-DD or null", "amount": number or null, "owner": "person name or null"}]}

Rules:
- A commitment is any promise, task, or agreement someone explicitly says they will do
- Include: will do X, agreed to Y, needs to Z, promised to W, going to V, should U
- text: the exact commitment text or a concise summary (max 200 chars)
- deadline: YYYY-MM-DD format - convert natural language dates like "March 30th", "next Friday", "by the 15th" to YYYY-MM-DD. Use null if no deadline mentioned
- amount: numeric value only (e.g., 15000 not $15000). Use null if no dollar amount mentioned
- owner: the name of the person who made the commitment (typically the speaker before colon or "I will" speaker)
- If no commitments found, return: {"commitments": []}
- Only extract real commitments, not general discussion or opinions`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        stream: false,
        format: 'json'
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const body = await response.text();
      throw new OllamaApiError(`Ollama API error: ${response.status} ${response.statusText}`, response.status, body);
    }

    const data = await response.json() as { message?: { content?: string } };
    let content = data.message?.content || '{"commitments": []}';

    // Try to extract JSON from content if it has extra text around it
    const jsonMatch = content.match(/\{[\s\S]*"commitments"[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Parse JSON from response
    let parsed: { commitments: ExtractedCommitment[] };
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new OllamaApiError(`Failed to parse JSON response: ${content.substring(0, 200)}`);
    }

    const commitments = parsed.commitments || [];

    if (!Array.isArray(commitments)) {
      throw new OllamaApiError('Invalid response format: expected commitments array');
    }

    return {
      commitments,
      model: model,
      success: true
    };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof OllamaApiError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new OllamaApiError('Request timeout: Ollama API did not respond within 60 seconds');
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error calling Ollama API';
    throw new OllamaApiError(errorMessage);
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
