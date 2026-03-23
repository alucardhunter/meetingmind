import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET /meetings/stats
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    // Get total meetings
    const totalMeetings = await prisma.meeting.count({
      where: { userId },
    });

    // Get user's meetings for commitment stats
    const userMeetings = await prisma.meeting.findMany({
      where: { userId },
      select: { id: true },
    });
    const meetingIds = userMeetings.map(m => m.id);

    // Total commitments
    const totalCommitments = await prisma.commitment.count({
      where: { meetingId: { in: meetingIds } },
    });

    // Open commitments (not overdue)
    const openCommitments = await prisma.commitment.count({
      where: {
        meetingId: { in: meetingIds },
        status: 'open',
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } },
        ],
      },
    });

    // Fulfilled commitments
    const fulfilledCommitments = await prisma.commitment.count({
      where: {
        meetingId: { in: meetingIds },
        status: 'fulfilled',
      },
    });

    // Overdue commitments
    const overdueCommitments = await prisma.commitment.count({
      where: {
        meetingId: { in: meetingIds },
        status: 'open',
        deadline: { lt: new Date() },
      },
    });

    // This month's meetings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await prisma.meeting.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    res.json({
      totalMeetings,
      totalCommitments,
      openCommitments,
      fulfilledCommitments,
      overdueCommitments,
      thisMonth,
      freeLimit: 3,
      plan: 'free',
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
