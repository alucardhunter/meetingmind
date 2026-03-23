import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { transcribeMeeting, getTranscript } from '../services/transcription';
import { summarizeMeeting, getSummary, extractCommitments } from '../services/extraction';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `audio-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/opus',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSize,
  },
});

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { status, client } = req.query;

    const where: any = { userId };
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (client && typeof client === 'string') {
      where.client = client;
    }

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { commitments: true },
        },
      },
    });

    // Get commitment counts for each meeting
    const meetingsWithCounts = await Promise.all(
      meetings.map(async (meeting) => {
        const openCommitments = await prisma.commitment.count({
          where: {
            meetingId: meeting.id,
            status: 'open',
            OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
          },
        });

        const fulfilledCommitments = await prisma.commitment.count({
          where: {
            meetingId: meeting.id,
            status: 'fulfilled',
          },
        });

        const overdueCommitments = await prisma.commitment.count({
          where: {
            meetingId: meeting.id,
            status: 'open',
            deadline: { lt: new Date() },
          },
        });

        return {
          id: meeting.id,
          title: meeting.title,
          client: meeting.client,
          meetingDate: meeting.meetingDate,
          status: meeting.status,
          audioUrl: meeting.audioUrl,
          createdAt: meeting.createdAt,
          _count: meeting._count,
          openCommitments,
          fulfilledCommitments,
          overdueCommitments,
        };
      })
    );

    res.json({ meetings: meetingsWithCounts });
  } catch (error) {
    console.error('List meetings error:', error);
    res.status(500).json({ error: 'Failed to list meetings' });
  }
});

router.post('/', upload.single('audio'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { title, meetingDate, client } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const audioUrl = req.file ? path.join(uploadDir, req.file.filename) : null;

    const meeting = await prisma.meeting.create({
      data: {
        userId: userId!,
        title,
        client: client || null,
        meetingDate: meetingDate ? new Date(meetingDate) : null,
        audioUrl,
        status: audioUrl ? 'pending' : 'pending_no_audio',
      },
    });

    res.status(201).json({ meeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
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

    // Add isOverdue flag to each commitment
    const commitmentsWithOverdue = meeting.commitments.map((c) => ({
      ...c,
      isOverdue: c.deadline && c.deadline < new Date() && c.status === 'open',
    }));

    res.json({
      meeting: {
        ...meeting,
        commitments: commitmentsWithOverdue,
      },
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to get meeting' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    await prisma.meeting.delete({
      where: { id },
    });

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
});

router.post('/:id/transcribe', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    if (!meeting.audioUrl) {
      res.status(400).json({ error: 'No audio file attached to this meeting' });
      return;
    }

    if (meeting.status === 'transcribed' || meeting.status === 'transcribing') {
      res.status(400).json({ error: 'Meeting is already being transcribed or has been transcribed' });
      return;
    }

    transcribeMeeting(id)
      .then(() => {
        console.log(`Transcription complete for meeting ${id}`);
      })
      .catch((error) => {
        console.error(`Transcription failed for meeting ${id}:`, error);
      });

    res.json({ message: 'Transcription started', meetingId: id });
  } catch (error) {
    console.error('Transcribe error:', error);
    res.status(500).json({ error: 'Failed to start transcription' });
  }
});

router.get('/:id/transcript', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        transcript: true,
        status: true,
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    if (!meeting.transcript) {
      res.status(404).json({ error: 'Transcript not available yet' });
      return;
    }

    res.json({ transcript: meeting.transcript, status: meeting.status });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({ error: 'Failed to get transcript' });
  }
});

router.post('/:id/summarize', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    if (!meeting.transcript) {
      res.status(400).json({ error: 'Meeting must be transcribed before summarizing' });
      return;
    }

    if (meeting.status === 'summarized') {
      res.status(400).json({ error: 'Meeting has already been summarized' });
      return;
    }

    summarizeMeeting(id)
      .then(() => {
        console.log(`Summary complete for meeting ${id}`);
      })
      .catch((error) => {
        console.error(`Summary failed for meeting ${id}:`, error);
      });

    res.json({ message: 'Summarization started', meetingId: id });
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({ error: 'Failed to start summarization' });
  }
});

router.get('/:id/summary', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        summary: true,
        status: true,
      },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    if (!meeting.summary) {
      res.status(404).json({ error: 'Summary not available yet' });
      return;
    }

    res.json({ summary: meeting.summary, status: meeting.status });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to get summary' });
  }
});

// GET /api/meetings/:id/commitments — list commitments for a meeting
router.get('/:id/commitments', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const commitments = await prisma.commitment.findMany({
      where: { meetingId: id },
      orderBy: { createdAt: 'desc' },
    });

    // Add isOverdue flag
    const commitmentsWithOverdue = commitments.map((c) => ({
      ...c,
      isOverdue: c.deadline && c.deadline < new Date() && c.status === 'open',
    }));

    res.json({ commitments: commitmentsWithOverdue });
  } catch (error) {
    console.error('List meeting commitments error:', error);
    res.status(500).json({ error: 'Failed to list commitments' });
  }
});

// POST /api/meetings/:id/commitments — manually add a commitment
router.post('/:id/commitments', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { text, deadline, amountValue, amountCurrency, owner } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Commitment text is required' });
      return;
    }

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    const now = new Date();
    let parsedDeadline: Date | null = null;
    if (deadline) {
      parsedDeadline = new Date(deadline);
      if (isNaN(parsedDeadline.getTime())) {
        res.status(400).json({ error: 'Invalid deadline date' });
        return;
      }
    }

    let parsedAmount: Prisma.Decimal | null = null;
    if (amountValue !== undefined && amountValue !== null) {
      parsedAmount = new Prisma.Decimal(amountValue.toString());
    }

    const commitment = await prisma.commitment.create({
      data: {
        meetingId: id,
        text: text.trim(),
        deadline: parsedDeadline,
        amountValue: parsedAmount,
        amountCurrency: amountCurrency || null,
        owner: owner || null,
        status: parsedDeadline && parsedDeadline < now ? 'overdue' : 'open',
      },
    });

    res.status(201).json({ commitment: { ...commitment, isOverdue: commitment.status === 'overdue' } });
  } catch (error) {
    console.error('Create commitment error:', error);
    res.status(500).json({ error: 'Failed to create commitment' });
  }
});

// POST /api/meetings/:id/commitments/extract — re-run extraction from transcript
router.post('/:id/commitments/extract', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const meeting = await prisma.meeting.findFirst({
      where: { id, userId },
    });

    if (!meeting) {
      res.status(404).json({ error: 'Meeting not found' });
      return;
    }

    if (!meeting.transcript) {
      res.status(400).json({ error: 'Meeting must be transcribed before extracting commitments' });
      return;
    }

    // Start extraction asynchronously
    summarizeMeeting(id)
      .then(async () => {
        // Fetch the newly created commitments
        const commitments = await prisma.commitment.findMany({
          where: { meetingId: id },
          orderBy: { createdAt: 'desc' },
        });
        console.log(`Re-extracted ${commitments.length} commitments for meeting ${id}`);
      })
      .catch((error) => {
        console.error(`Commitment extraction failed for meeting ${id}:`, error);
      });

    res.json({ message: 'Commitment extraction started', meetingId: id });
  } catch (error) {
    console.error('Extract commitments error:', error);
    res.status(500).json({ error: 'Failed to start commitment extraction' });
  }
});

export default router;
