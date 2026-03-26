import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { summarizeMeeting, getSummary, extractCommitments } from '../services/extraction';
import { transcribeWithOllama } from '../services/ollamaTranscription';
import { extractCommitmentsWithOllama } from '../services/ollamaExtraction';
import { extractAudioFromVideo, deleteFile } from '../services/videoExtractor';

const router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const backendUrl = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`).replace(/\/$/, '');
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

// Resolve audioUrl to full URL for frontend consumption
function resolveAudioUrl(audioUrl: string | null): string | null {
  if (!audioUrl) return null;
  if (audioUrl.startsWith('http') || audioUrl.startsWith('blob:')) return audioUrl;
  // Normalize path: remove leading ./ if present
  const normalizedPath = audioUrl.replace(/^\.\//, '/');
  // Ensure leading slash
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  return `${backendUrl}${cleanPath}`;
}

// Map DB meeting to API response shape (meetingDate -> date, resolve audio)
function mapMeetingResponse(meeting: any): any {
  return {
    ...meeting,
    date: meeting.meetingDate ?? meeting.date ?? null,
    audioUrl: resolveAudioUrl(meeting.audioUrl),
  };
}

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedAudioMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/opus',
  ];

  const allowedVideoMimes = [
    'video/mp4',
    'video/quicktime',   // .mov
    'video/x-matroska',  // .mkv
    'video/avi',
    'video/webm',
  ];

  const allAllowedMimes = [...allowedAudioMimes, ...allowedVideoMimes];

  if (allAllowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio and video files are allowed.'));
  }
};

// Video mime types that require audio extraction
const videoMimesThatNeedExtraction = [
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/avi',
  'video/webm',
];

function isVideoFile(mimetype: string): boolean {
  return videoMimesThatNeedExtraction.includes(mimetype);
}

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

        return mapMeetingResponse({
          id: meeting.id,
          title: meeting.title,
          client: meeting.client,
          meetingDate: meeting.meetingDate,
          status: meeting.status,
          audioUrl: resolveAudioUrl(meeting.audioUrl),
          createdAt: meeting.createdAt,
          _count: meeting._count,
          openCommitments,
          fulfilledCommitments,
          overdueCommitments,
        });
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
    // Accept both date/meetingDate and contact/client from frontend
    const { title, date, meetingDate, contact, client } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    let audioUrl: string | null = null;
    
    if (req.file) {
      const uploadedFile = req.file;
      const uploadedPath = path.join(uploadDir, uploadedFile.filename);
      
      // Check if uploaded file is a video that needs audio extraction
      if (isVideoFile(uploadedFile.mimetype)) {
        console.log(`[meetings] Video file detected: ${uploadedFile.originalname} (${uploadedFile.mimetype})`);
        
        // Generate output path for audio (use .wav extension)
        const audioFilename = `audio-${Date.now()}-${Math.round(Math.random() * 1e9)}.wav`;
        const audioPath = path.join(uploadDir, audioFilename);
        
        try {
          // Extract audio from video
          await extractAudioFromVideo(uploadedPath, audioPath);
          
          // Delete the original video file to save storage
          try {
            await deleteFile(uploadedPath);
          } catch (deleteErr) {
            console.warn(`[meetings] Could not delete original video file:`, deleteErr);
          }
          
          audioUrl = audioPath;
          console.log(`[meetings] Video → audio extraction complete, stored: ${audioUrl}`);
        } catch (extractErr) {
          console.error(`[meetings] Audio extraction failed:`, extractErr);
          
          // Fall back to keeping the original file if it's audio (video already filtered out)
          // If extraction failed for a video, we still have the original video file as a fallback
          if (uploadedFile.mimetype.startsWith('audio/')) {
            audioUrl = uploadedPath;
          } else {
            // Try to keep the original even if it's video - transcription service might handle it
            audioUrl = uploadedPath;
            console.warn(`[meetings] Extraction failed, using original file: ${audioUrl}`);
          }
        }
      } else {
        // Regular audio file, use as-is
        audioUrl = uploadedPath;
      }
    }
    
    const parsedDate = date || meetingDate;
    const parsedClient = contact || client;

    const meeting = await prisma.meeting.create({
      data: {
        userId: userId!,
        title,
        client: parsedClient || null,
        meetingDate: parsedDate ? new Date(parsedDate) : null,
        audioUrl,
        status: audioUrl ? 'pending' : 'pending_no_audio',
      },
    });

    res.status(201).json({ meeting: mapMeetingResponse(meeting) });
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
      meeting: mapMeetingResponse({
        ...meeting,
        commitments: commitmentsWithOverdue,
      }),
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

    // Use Ollama transcription
    const result = await transcribeWithOllama(meeting.audioUrl || '', id);

    await prisma.meeting.update({
      where: { id },
      data: {
        transcript: result.transcript,
        status: 'transcribed',
      },
    });

    res.json({ message: 'Transcription complete', meetingId: id, transcript: result.transcript, source: result.source });
  } catch (error) {
    console.error('Transcribe error:', error);
    const message = error instanceof Error ? error.message : 'Failed to transcribe';
    res.status(500).json({ error: message });
  }
});

// POST /:id/extract — Ollama commitment extraction
router.post('/:id/extract', async (req: AuthRequest, res: Response) => {
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
      res.status(400).json({ error: 'Meeting must be transcribed before extracting commitments' });
      return;
    }

    // Use Ollama extraction service
    const result = await extractCommitmentsWithOllama(meeting.transcript);

    const now = new Date();

    // Delete any existing commitments for this meeting (re-extraction)
    await prisma.commitment.deleteMany({
      where: { meetingId: id },
    });

    // Create new commitments from Ollama extraction
    const commitmentData = result.commitments.map((c) => ({
      meetingId: id,
      text: c.text,
      deadline: c.deadline ? new Date(c.deadline) : null,
      amountValue: c.amount ? new Prisma.Decimal(c.amount) : null,
      amountCurrency: c.amount ? '$' : null,
      owner: c.owner || null,
      status: c.deadline && new Date(c.deadline) < now ? 'overdue' : 'open',
    }));

    if (commitmentData.length > 0) {
      await prisma.commitment.createMany({
        data: commitmentData,
      });
    }

    // Update meeting status
    await prisma.meeting.update({
      where: { id },
      data: {
        status: 'summarized',
      },
    });

    res.json({ message: 'Commitment extraction complete', meetingId: id, commitments: result.commitments });
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({ error: 'Failed to extract commitments' });
  }
});

// POST /:id/ollama-transcribe — Ollama-powered transcription (uses OpenAI Whisper)
router.post('/:id/ollama-transcribe', async (req: AuthRequest, res: Response) => {
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

    // Use Ollama transcription service
    const result = await transcribeWithOllama(meeting.audioUrl || '', id);

    await prisma.meeting.update({
      where: { id },
      data: {
        transcript: result.transcript,
        status: 'transcribed',
      },
    });

    res.json({ 
      message: 'Ollama transcription complete', 
      meetingId: id, 
      transcript: result.transcript,
      source: result.source
    });
  } catch (error) {
    console.error('Ollama transcribe error:', error);
    const message = error instanceof Error ? error.message : 'Failed to transcribe with Ollama';
    res.status(500).json({ error: message });
  }
});

// POST /:id/transcript — manually set the transcript text
router.post('/:id/transcript', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { transcript } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      res.status(400).json({ error: 'Transcript text is required' });
      return;
    }

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

    await prisma.meeting.update({
      where: { id },
      data: {
        transcript: transcript.trim(),
        status: 'transcribed',
      },
    });

    res.json({ message: 'Transcript saved', meetingId: id });
  } catch (error) {
    console.error('Set transcript error:', error);
    res.status(500).json({ error: 'Failed to save transcript' });
  }
});

// POST /:id/ollama-extract — Ollama-powered commitment extraction
router.post('/:id/ollama-extract', async (req: AuthRequest, res: Response) => {
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
      res.status(400).json({ error: 'Meeting must be transcribed before extracting commitments' });
      return;
    }

    // Use Ollama extraction service
    const result = await extractCommitmentsWithOllama(meeting.transcript);

    const now = new Date();

    // Delete any existing commitments for this meeting (re-extraction)
    await prisma.commitment.deleteMany({
      where: { meetingId: id },
    });

    // Create new commitments from Ollama extraction
    const commitmentData = result.commitments.map((c) => ({
      meetingId: id,
      text: c.text,
      deadline: c.deadline ? new Date(c.deadline) : null,
      amountValue: c.amount ? new Prisma.Decimal(c.amount) : null,
      amountCurrency: c.amount ? '$' : null,
      owner: c.owner || null,
      status: c.deadline && new Date(c.deadline) < now ? 'overdue' : 'open',
    }));

    if (commitmentData.length > 0) {
      await prisma.commitment.createMany({
        data: commitmentData,
      });
    }

    // Update meeting status
    await prisma.meeting.update({
      where: { id },
      data: {
        status: 'summarized',
      },
    });

    res.json({ 
      message: 'Ollama commitment extraction complete', 
      meetingId: id, 
      commitments: result.commitments,
      model: result.model,
      success: result.success
    });
  } catch (error) {
    console.error('Ollama extract error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract commitments with Ollama';
    const statusCode = error instanceof Error && error.name === 'OllamaApiError' ? 502 : 500;
    res.status(statusCode).json({ error: message });
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
