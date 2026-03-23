import OpenAI from 'openai';
import prisma from '../lib/prisma';
import path from 'path';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type TranscriptionStatus = 'pending' | 'transcribed' | 'error';

export const transcribeMeeting = async (meetingId: string): Promise<void> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
  });

  if (!meeting || !meeting.audioUrl) {
    throw new Error('Meeting not found or no audio file');
  }

  try {
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'transcribing' },
    });

    const audioPath = path.resolve(meeting.audioUrl);

    if (!fs.existsSync(audioPath)) {
      throw new Error('Audio file not found on disk');
    }

    const audioFile = fs.createReadStream(audioPath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        transcript: transcription,
        status: 'transcribed',
      },
    });
  } catch (error) {
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'error' },
    });
    throw error;
  }
};

export const getTranscript = async (meetingId: string): Promise<string | null> => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    select: { transcript: true, status: true },
  });

  if (!meeting) {
    return null;
  }

  return meeting.transcript;
};
