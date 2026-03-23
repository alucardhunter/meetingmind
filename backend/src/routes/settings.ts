import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// GET /settings
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    // Settings are stored in a separate table or user metadata
    // For now, return empty settings - user can update their integrations
    res.json({
      openAiKey: undefined,
      notionApiKey: undefined,
      notionPageId: undefined,
      slackWebhookUrl: undefined,
      reminderEnabled: false,
      reminderEmail: undefined,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// PUT /settings
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { openAiKey, notionApiKey, notionPageId, slackWebhookUrl, reminderEnabled, reminderEmail } = req.body;
    
    // For now, settings are not persisted to DB
    // In production, you'd create a Settings model
    res.json({
      openAiKey: openAiKey || undefined,
      notionApiKey: notionApiKey || undefined,
      notionPageId: notionPageId || undefined,
      slackWebhookUrl: slackWebhookUrl || undefined,
      reminderEnabled: reminderEnabled || false,
      reminderEmail: reminderEmail || undefined,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// DELETE /settings/account
router.delete('/account', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    
    // Delete all user's meetings and commitments first
    const userMeetings = await prisma.meeting.findMany({
      where: { userId },
      select: { id: true },
    });
    
    const meetingIds = userMeetings.map(m => m.id);
    
    await prisma.commitment.deleteMany({
      where: { meetingId: { in: meetingIds } },
    });
    
    await prisma.meeting.deleteMany({
      where: { userId },
    });
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
