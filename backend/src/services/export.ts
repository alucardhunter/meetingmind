import axios from 'axios';
import prisma from '../lib/prisma';
import { MeetingSummary } from './extraction';

const NOTION_API_URL = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

export interface ExportResult {
  success: boolean;
  message: string;
  url?: string;
}

export const formatClipboardExport = (meeting: {
  title: string;
  meetingDate: Date | null;
  transcript: string | null;
  summary: MeetingSummary | null;
  commitments?: string[];
}): string => {
  const lines: string[] = [];

  lines.push(`# ${meeting.title}`);
  lines.push('');

  if (meeting.meetingDate) {
    lines.push(`**Date:** ${new Date(meeting.meetingDate).toLocaleDateString()}`);
    lines.push('');
  }

  // Format commitments as structured cards
  if (meeting.commitments && meeting.commitments.length > 0) {
    lines.push('## Commitments');
    lines.push('');
    meeting.commitments.forEach((card) => {
      lines.push(card);
    });
    lines.push('');
  } else if (meeting.summary) {
    // Fallback to legacy summary format if no commitments
    const summary = meeting.summary;

    if (summary.actionItems.length > 0) {
      lines.push('## Action Items');
      summary.actionItems.forEach(item => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }

    if (summary.dates.length > 0) {
      lines.push('## Key Dates');
      summary.dates.forEach(date => {
        lines.push(`- ${date.text}`);
      });
      lines.push('');
    }

    if (summary.amounts.length > 0) {
      lines.push('## Financial Amounts');
      summary.amounts.forEach(amount => {
        lines.push(`- ${amount.text}`);
      });
      lines.push('');
    }

    if (summary.deliverables.length > 0) {
      lines.push('## Deliverables');
      summary.deliverables.forEach(item => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }

    if (summary.keyPoints.length > 0) {
      lines.push('## Key Points');
      summary.keyPoints.forEach(point => {
        lines.push(`- ${point}`);
      });
      lines.push('');
    }
  }

  if (meeting.transcript) {
    lines.push('## Transcript');
    lines.push('');
    lines.push(meeting.transcript.substring(0, 2000));
    if (meeting.transcript.length > 2000) {
      lines.push('');
      lines.push('*(transcript truncated for clipboard export)*');
    }
  }

  return lines.join('\n');
};

export const exportToNotion = async (
  meetingId: string,
  notionApiKey: string,
  parentPageId?: string
): Promise<ExportResult> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      commitments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!meeting) {
    return { success: false, message: 'Meeting not found' };
  }

  const summary = meeting.summary as unknown as MeetingSummary | null;
  const blocks: any[] = [];

  // Title
  blocks.push({
    object: 'block',
    type: 'heading_1',
    heading_1: { rich_text: [{ type: 'text', text: { content: meeting.title } }] },
  });

  // Meeting info
  if (meeting.meetingDate) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `Meeting Date: ${new Date(meeting.meetingDate).toLocaleDateString()}` },
          },
        ],
      },
    });
  }

  if (meeting.client) {
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `Client: ${meeting.client}` },
          },
        ],
      },
    });
  }

  // Commitments as structured cards
  if (meeting.commitments.length > 0) {
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: 'Commitments' } }] },
    });

    for (const commitment of meeting.commitments) {
      const deadline = commitment.deadline
        ? `Due: ${commitment.deadline.toISOString().split('T')[0]}`
        : 'No deadline';
      const amount = commitment.amountValue
        ? `${commitment.amountCurrency || '$'}${commitment.amountValue.toString()}`
        : '';
      const owner = commitment.owner ? `Owner: ${commitment.owner}` : '';
      const status = commitment.status === 'fulfilled' ? '✓' : commitment.status === 'overdue' ? 'OVERDUE' : '○';

      const cardLines = [`${status} ${commitment.text}`];
      if (amount) cardLines.push(`  Amount: ${amount}`);
      cardLines.push(`  ${deadline}${owner ? ` • ${owner}` : ''}`);

      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: cardLines.join('\n') } }],
        },
      });
    }
  } else if (summary) {
    // Fallback to legacy summary format
    if (summary.actionItems.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Action Items' } }] },
      });
      summary.actionItems.forEach(item => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ type: 'text', text: { content: item } }] },
        });
      });
    }

    if (summary.dates.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Key Dates' } }] },
      });
      summary.dates.forEach(date => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ type: 'text', text: { content: date.text } }] },
        });
      });
    }

    if (summary.amounts.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Financial Amounts' } }] },
      });
      summary.amounts.forEach(amount => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ type: 'text', text: { content: amount.text } }] },
        });
      });
    }

    if (summary.deliverables.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: 'Deliverables' } }] },
      });
      summary.deliverables.forEach(item => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: { rich_text: [{ type: 'text', text: { content: item } }] },
        });
      });
    }
  }

  try {
    const createResponse = await axios.post(
      `${NOTION_API_URL}/pages`,
      {
        parent: parentPageId ? { page_id: parentPageId } : { database_id: process.env.NOTION_DATABASE_ID },
        properties: {
          title: {
            title: [{ type: 'text', text: { content: meeting.title } }],
          },
        },
        children: blocks,
      },
      {
        headers: {
          Authorization: `Bearer ${notionApiKey}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      message: 'Successfully exported to Notion',
      url: createResponse.data.url || createResponse.data.permalink,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to export to Notion',
    };
  }
};

export const exportToSlack = async (
  meetingId: string,
  webhookUrl: string
): Promise<ExportResult> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      commitments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!meeting) {
    return { success: false, message: 'Meeting not found' };
  }

  const summary = meeting.summary as MeetingSummary | null;
  const blocks: any[] = [];

  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `📋 ${meeting.title}`,
      emoji: true,
    },
  });

  if (meeting.meetingDate) {
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `*Date:* ${new Date(meeting.meetingDate).toLocaleDateString()}${meeting.client ? ` • *Client:* ${meeting.client}` : ''}`,
        },
      ],
    });
  }

  blocks.push({ type: 'divider' });

  // Format commitments as structured cards
  if (meeting.commitments.length > 0) {
    const commitmentText = meeting.commitments
      .map((c) => {
        const deadline = c.deadline
          ? `Due: ${c.deadline.toISOString().split('T')[0]}`
          : '';
        const amount = c.amountValue
          ? `${c.amountCurrency || '$'}${c.amountValue.toString()}`
          : '';
        const owner = c.owner ? `Owner: ${c.owner}` : '';
        const status = c.status === 'fulfilled' ? '✓' : c.status === 'overdue' ? '⚠️' : '○';

        const parts = [`${status} ${c.text}`];
        if (amount) parts.push(`  $${amount}`);
        if (deadline || owner) parts.push(`  ${[deadline, owner].filter(Boolean).join(' • ')}`);

        return parts.join('\n');
      })
      .join('\n\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Commitments:*\n${commitmentText}`,
      },
    });
  } else if (summary) {
    // Fallback to legacy summary format
    if (summary.actionItems.length > 0) {
      const actionText = summary.actionItems.slice(0, 5).map(a => `• ${a}`).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Action Items:*\n${actionText}`,
        },
      });
    }

    if (summary.dates.length > 0) {
      const datesText = summary.dates.slice(0, 5).map(d => `• ${d.text}`).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Key Dates:*\n${datesText}`,
        },
      });
    }

    if (summary.amounts.length > 0) {
      const amountsText = summary.amounts.slice(0, 5).map(a => `• ${a.text}`).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Financial Amounts:*\n${amountsText}`,
        },
      });
    }

    if (summary.deliverables.length > 0) {
      const deliverablesText = summary.deliverables.slice(0, 5).map(d => `• ${d}`).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Deliverables:*\n${deliverablesText}`,
        },
      });
    }
  }

  blocks.push({ type: 'divider' });

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `Generated by MeetingMind • ${new Date().toLocaleDateString()}`,
      },
    ],
  });

  try {
    await axios.post(webhookUrl, { blocks });

    return {
      success: true,
      message: 'Successfully sent to Slack',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data || 'Failed to send to Slack',
    };
  }
};
