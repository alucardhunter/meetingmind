import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import {
  formatClipboardExport,
  exportToNotion,
  exportToSlack,
} from '../services/export';

const router = Router();

router.use(authenticate);

router.post('/:id/export/clipboard', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        commitments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    // Format commitments as structured cards
    const commitmentCards = meeting.commitments.map((c) => {
      const deadline = c.deadline
        ? `Due: ${c.deadline.toISOString().split('T')[0]}`
        : 'No deadline';
      const amount = c.amountValue
        ? `${c.amountCurrency || '$'}${c.amountValue.toString()}`
        : '';
      const owner = c.owner ? `Owner: ${c.owner}` : '';
      const status = c.status === 'fulfilled' ? '[✓]' : c.status === 'overdue' ? '[OVERDUE]' : '[ ]';

      const parts = [status, c.text];
      if (amount) parts.push(amount);
      parts.push(`(${deadline}${owner ? ` • ${owner}` : ''})`);

      return parts.join(' ');
    });

    const formattedText = formatClipboardExport({
      title: meeting.title,
      meetingDate: meeting.meetingDate,
      transcript: meeting.transcript,
      summary: meeting.summary as any,
      commitments: commitmentCards,
    });

    res.json({
      success: true,
      content: formattedText,
      contentType: 'text/plain',
    });
  } catch (error) {
    console.error('Clipboard export error:', error);
    res.status(500).json({ error: 'Failed to export to clipboard' });
  }
});

router.post('/:id/export/notion', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { notionApiKey, parentPageId } = req.body;

    if (!notionApiKey) {
      res.status(400).json({ error: 'Notion API key is required' });
      return;
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        commitments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const result = await exportToNotion(id, notionApiKey, parentPageId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Notion export error:', error);
    res.status(500).json({ error: 'Failed to export to Notion' });
  }
});

router.post('/:id/export/slack', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { webhookUrl } = req.body;

    if (!webhookUrl) {
      res.status(400).json({ error: 'Slack webhook URL is required' });
      return;
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        commitments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const result = await exportToSlack(id, webhookUrl);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Slack export error:', error);
    res.status(500).json({ error: 'Failed to send to Slack' });
  }
});

export default router;
