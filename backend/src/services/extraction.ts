import OpenAI from 'openai';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MeetingSummary {
  actionItems: string[];
  dates: { text: string; value: string }[];
  amounts: { text: string; value: string; currency: string }[];
  deliverables: string[];
  keyPoints: string[];
}

export interface ExtractedCommitment {
  text: string;
  deadline: Date | null;
  amountValue: Prisma.Decimal | null;
  amountCurrency: string | null;
  owner: string | null;
}

const DATE_REGEX = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|january|february|march|april|may|june|july|august|september|october|november|december\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|tomorrow|today)\b/gi;
const AMOUNT_REGEX = /\$[\d,]+(?:\.\d{2})?|\€[\d,]+(?:\.\d{2})?|\£[\d,]+(?:\.\d{2})?/g;

function parseDate(dateText: string): Date | null {
  try {
    const lower = dateText.toLowerCase().trim();

    if (lower === 'today') {
      return new Date();
    }
    if (lower === 'tomorrow') {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    }
    if (lower.startsWith('next ')) {
      const dayMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const dayName = lower.replace('next ', '');
      const targetDay = dayMap[dayName];
      if (targetDay !== undefined) {
        const d = new Date();
        const currentDay = d.getDay();
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7;
        d.setDate(d.getDate() + daysUntil);
        return d;
      }
    }

    // Try natural language parsing
    const parsed = new Date(dateText);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Try common formats
    const formats = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
    ];

    for (const fmt of formats) {
      const m = dateText.match(fmt);
      if (m) {
        const parsed2 = new Date(dateText);
        if (!isNaN(parsed2.getTime())) {
          return parsed2;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function parseAmount(amountText: string): { value: string; currency: string } {
  const match = amountText.match(/([\$€£])([\d,]+(?:\.\d{2})?)/);
  if (match) {
    return {
      currency: match[1],
      value: match[2].replace(/,/g, ''),
    };
  }
  return { currency: '$', value: amountText.replace(/[^\d.]/g, '') };
}

async function extractCommitmentsWithGPT(
  transcript: string
): Promise<ExtractedCommitment[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a meeting assistant. Analyze this transcript and extract ALL commitments made by anyone in the meeting. A commitment is any promise, agreement, or task someone explicitly says they will do.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "commitments": [
    {
      "text": "the exact commitment text",
      "deadline": "YYYY-MM-DD or null if no deadline mentioned",
      "amountValue": "number as string or null if no dollar amount",
      "amountCurrency": "$ or € or £ or null",
      "owner": "name of person who made the commitment or null"
    }
  ]
}`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      return parsed.commitments || [];
    }
    return [];
  } catch (error) {
    // GPT extraction error — return empty array
    return [];
  }
}

async function extractCommitmentsWithRegex(
  transcript: string
): Promise<ExtractedCommitment[]> {
  const commitments: ExtractedCommitment[] = [];

  // Patterns for commitments
  const patterns = [
    /(?:i will|i'm going to|i'll|we'll|we will|will) ([^\n.!?]+)/gi,
    /(?:action[:\s]|todo[:\s])[^\n]*/gi,
    /(?:will deliver|will send|will provide|will share|will create|will build|will complete|will finish|will do|to be delivered)[^\n]*/gi,
    /(?:needs? to|has to|must) ([^\n.!?]+)/gi,
  ];

  const lines = transcript.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 10) continue;

    // Check if line looks like a commitment
    const commitmentIndicators = [
      /\bwill\b/i, /\bsend\b/i, /\bcreate\b/i, /\bbuild\b/i,
      /\bcomplete\b/i, /\bdeliver\b/i, /\bprovide\b/i,
      /\bshare\b/i, /\bdo\b/i, /\bfinish\b/i, /\bupdate\b/i,
      /\breview\b/i, /\bfix\b/i, /\bneed to\b/i, /\bmust\b/i,
    ];

    const hasIndicator = commitmentIndicators.some(r => r.test(trimmed));
    if (!hasIndicator) continue;

    // Extract deadline if present
    let deadline: Date | null = null;
    const dateMatch = trimmed.match(DATE_REGEX);
    if (dateMatch) {
      deadline = parseDate(dateMatch[0]);
    }

    // Extract amount if present
    let amountValue: Prisma.Decimal | null = null;
    let amountCurrency: string | null = null;
    const amountMatch = trimmed.match(AMOUNT_REGEX);
    if (amountMatch) {
      const parsed = parseAmount(amountMatch[0]);
      amountValue = new Prisma.Decimal(parsed.value);
      amountCurrency = parsed.currency;
    }

    commitments.push({
      text: trimmed,
      deadline,
      amountValue,
      amountCurrency,
      owner: null,
    });
  }

  return commitments;
}

export const summarizeMeeting = async (meetingId: string): Promise<void> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting || !meeting.transcript) {
    throw new Error('Meeting not found or not transcribed');
  }

  const transcript = meeting.transcript;

  // Get commitments from GPT
  let commitments = await extractCommitmentsWithGPT(transcript);

  // If GPT failed or returned too few, fall back to regex
  if (commitments.length === 0) {
    commitments = await extractCommitmentsWithRegex(transcript);
  }

  const now = new Date();

  // Create Commitment records in the database
  const commitmentData = commitments.map((c) => ({
    meetingId,
    text: c.text,
    deadline: c.deadline,
    amountValue: c.amountValue,
    amountCurrency: c.amountCurrency,
    owner: c.owner,
    status: c.deadline && c.deadline < now ? 'overdue' : 'open',
  }));

  // Delete any existing commitments for this meeting (re-extraction)
  await prisma.commitment.deleteMany({
    where: { meetingId },
  });

  // Create new commitments
  if (commitmentData.length > 0) {
    await prisma.commitment.createMany({
      data: commitmentData,
    });
  }

  // Build legacy summary blob for backwards compatibility
  const summary: MeetingSummary = {
    actionItems: commitments.map((c) => c.text),
    dates: commitments
      .filter((c) => c.deadline)
      .map((c) => ({
        text: c.deadline!.toISOString().split('T')[0],
        value: c.deadline!.toISOString().split('T')[0],
      })),
    amounts: commitments
      .filter((c) => c.amountValue)
      .map((c) => ({
        text: `${c.amountCurrency}${c.amountValue?.toString()}`,
        value: c.amountValue!.toString(),
        currency: c.amountCurrency!,
      })),
    deliverables: commitments.map((c) => c.text),
    keyPoints: [],
  };

  // Update meeting status
  await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      summary: summary as any,
      status: 'summarized',
    },
  });


};

export const extractCommitments = async (meetingId: string): Promise<ExtractedCommitment[]> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting || !meeting.transcript) {
    throw new Error('Meeting not found or not transcribed');
  }

  const transcript = meeting.transcript;

  // Get commitments from GPT
  let commitments = await extractCommitmentsWithGPT(transcript);

  // If GPT failed or returned too few, fall back to regex
  if (commitments.length === 0) {
    commitments = await extractCommitmentsWithRegex(transcript);
  }

  return commitments;
};

export const getSummary = async (meetingId: string): Promise<MeetingSummary | null> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { summary: true, status: true },
  });

  if (!meeting) {
    return null;
  }

  return meeting.summary as MeetingSummary | null;
};
mmary as MeetingSummary | null;
};
