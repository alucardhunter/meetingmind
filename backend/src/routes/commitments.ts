import { Router, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET /api/commitments — list all user's commitments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { status, client, fromDate, toDate } = req.query;

    // Build where clause for meetings
    const meetingWhere: any = { userId };
    if (client && typeof client === 'string') {
      meetingWhere.client = client;
    }

    // Get user's meeting IDs
    const userMeetings = await prisma.meeting.findMany({
      where: meetingWhere,
      select: { id: true, client: true, title: true },
    });

    const meetingIds = userMeetings.map((m) => m.id);

    // Build where clause for commitments
    const commitmentWhere: any = {
      meetingId: { in: meetingIds },
    };

    if (status && typeof status === 'string') {
      if (status === 'overdue') {
        commitmentWhere.deadline = { lt: new Date() };
        commitmentWhere.status = 'open';
      } else {
        commitmentWhere.status = status;
      }
    }

    if (fromDate && typeof fromDate === 'string') {
      const from = new Date(fromDate);
      if (!commitmentWhere.createdAt) commitmentWhere.createdAt = {};
      commitmentWhere.createdAt.gte = from;
    }

    if (toDate && typeof toDate === 'string') {
      const to = new Date(toDate);
      if (!commitmentWhere.createdAt) commitmentWhere.createdAt = {};
      commitmentWhere.createdAt.lte = to;
    }

    const commitments = await prisma.commitment.findMany({
      where: commitmentWhere,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            client: true,
            meetingDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Add meeting info at top level for frontend compatibility
    const commitmentsWithMeetingInfo = commitments.map((c) => ({
      id: c.id,
      text: c.text,
      status: c.status,
      deadline: c.deadline?.toISOString() || null,
      amountValue: c.amountValue?.toString() || null,
      amountCurrency: c.amountCurrency,
      owner: c.owner,
      createdAt: c.createdAt.toISOString(),
      fulfilledAt: c.fulfilledAt?.toISOString() || null,
      isOverdue: c.deadline && c.deadline < new Date() && c.status === 'open',
      meetingId: c.meeting.id,
      meetingTitle: c.meeting.title,
      meetingDate: c.meeting.meetingDate?.toISOString() || null,
      contact: c.meeting.client || null,
    }));

    res.json({ commitments: commitmentsWithMeetingInfo });
    res.json({ commitments: commitmentsWithMeetingInfo });
  } catch (error) {
    console.error('List commitments error:', error);
    res.status(500).json({ error: 'Failed to list commitments' });
  }
});

// GET /api/commitments/:id — get single commitment
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const commitment = await prisma.commitment.findUnique({
      where: { id },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            client: true,
            meetingDate: true,
            userId: true,
          },
        },
      },
    });

    if (!commitment) {
      res.status(404).json({ error: 'Commitment not found' });
      return;
    }

    if (commitment.meeting.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const isOverdue =
      commitment.deadline &&
      commitment.deadline < new Date() &&
      commitment.status === 'open';

    res.json({ commitment: { ...commitment, isOverdue } });
  } catch (error) {
    console.error('Get commitment error:', error);
    res.status(500).json({ error: 'Failed to get commitment' });
  }
});

// PATCH /api/commitments/:id — update status or deadline
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { status, deadline } = req.body;

    const commitment = await prisma.commitment.findUnique({
      where: { id },
      include: {
        meeting: {
          select: { userId: true },
        },
      },
    });

    if (!commitment) {
      res.status(404).json({ error: 'Commitment not found' });
      return;
    }

    if (commitment.meeting.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updateData: any = {};

    if (status !== undefined) {
      if (!['open', 'fulfilled', 'overdue'].includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be: open, fulfilled, or overdue' });
        return;
      }
      updateData.status = status;
      if (status === 'fulfilled') {
        updateData.fulfilledAt = new Date();
      }
    }

    if (deadline !== undefined) {
      if (deadline === null) {
        updateData.deadline = null;
      } else {
        const parsedDate = new Date(deadline);
        if (isNaN(parsedDate.getTime())) {
          res.status(400).json({ error: 'Invalid deadline date' });
          return;
        }
        updateData.deadline = parsedDate;
      }
    }

    const updated = await prisma.commitment.update({
      where: { id },
      data: updateData,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
            client: true,
            meetingDate: true,
          },
        },
      },
    });

    res.json({ commitment: updated });
  } catch (error) {
    console.error('Update commitment error:', error);
    res.status(500).json({ error: 'Failed to update commitment' });
  }
});

// DELETE /api/commitments/:id — delete commitment
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const commitment = await prisma.commitment.findUnique({
      where: { id },
      include: {
        meeting: {
          select: { userId: true },
        },
      },
    });

    if (!commitment) {
      res.status(404).json({ error: 'Commitment not found' });
      return;
    }

    if (commitment.meeting.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await prisma.commitment.delete({
      where: { id },
    });

    res.json({ message: 'Commitment deleted successfully' });
  } catch (error) {
    console.error('Delete commitment error:', error);
    res.status(500).json({ error: 'Failed to delete commitment' });
  }
});

export default router;
