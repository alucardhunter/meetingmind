import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface VideoExtractorOptions {
  /**
   * Sample rate for the extracted audio (default: 16000)
   */
  sampleRate?: number;
  /**
   * Number of audio channels (default: 1 - mono)
   */
  channels?: number;
  /**
   * Audio codec to use (default: pcm_s16le for wav, or 'libmp3lame' for mp3)
   */
  codec?: string;
}

const defaultOptions: VideoExtractorOptions = {
  sampleRate: 16000,
  channels: 1,
};

/**
 * Extract audio from a video file using ffmpeg.
 * 
 * @param videoPath - Path to the input video file
 * @param outputAudioPath - Path for the output audio file (should have .wav or .mp3 extension)
 * @param options - Extraction options
 * @returns The output audio path (may differ if format conversion was needed)
 */
export async function extractAudioFromVideo(
  videoPath: string,
  outputAudioPath: string,
  options: VideoExtractorOptions = {}
): Promise<string> {
  const opts = { ...defaultOptions, ...options };
  
  // Validate input exists
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Determine output format from extension
  const ext = path.extname(outputAudioPath).toLowerCase();
  
  return new Promise((resolve, reject) => {
    // Build ffmpeg arguments
    // -i input: input file
    // -vn: disable video recording
    // -acodec: audio codec
    // -ar: audio sample rate
    // -ac: audio channels
    // -y: overwrite output without asking
    
    const args = [
      '-i', videoPath,
      '-vn',
      '-acodec', opts.codec || 'pcm_s16le',
      '-ar', opts.sampleRate?.toString() || '16000',
      '-ac', opts.channels?.toString() || '1',
      '-y',
      outputAudioPath,
    ];

    console.log(`[videoExtractor] Extracting audio from video: ${videoPath}`);
    console.log(`[videoExtractor] Output audio: ${outputAudioPath}`);
    console.log(`[videoExtractor] ffmpeg args: ${args.join(' ')}`);

    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`[videoExtractor] Audio extraction complete: ${outputAudioPath}`);
        resolve(outputAudioPath);
      } else {
        console.error(`[videoExtractor] ffmpeg exited with code ${code}`);
        console.error(`[videoExtractor] stderr: ${stderr}`);
        reject(new Error(`ffmpeg extraction failed with code ${code}`));
      }
    });
    
    ffmpeg.on('error', (err) => {
      console.error(`[videoExtractor] Failed to spawn ffmpeg: ${err.message}`);
      reject(new Error(`Failed to run ffmpeg: ${err.message}. Is ffmpeg installed?`));
    });
  });
}

/**
 * Check if ffmpeg is available in the system.
 */
export async function isFfmpegAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);
    ffmpeg.on('close', (code) => {
      resolve(code === 0);
    });
    ffmpeg.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Delete a file at the given path.
 * Used to clean up original video files after extraction.
 */
export function deleteFile(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`[videoExtractor] Failed to delete file ${filePath}:`, err.message);
        reject(err);
      } else {
        console.log(`[videoExtractor] Deleted file: ${filePath}`);
        resolve();
      }
    });
  });
}
