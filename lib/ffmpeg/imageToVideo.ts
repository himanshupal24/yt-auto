import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';

export interface VideoOptions {
  width?: number;
  height?: number;
  duration?: number; // seconds per image
  fps?: number;
  outputFormat?: string;
  quality?: 'low' | 'medium' | 'high';
  transition?: 'fade' | 'slide' | 'zoom' | 'none';
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  format: string;
}

export class VideoProcessor {
  private ffmpegPath: string;
  private ffprobePath: string;

  constructor() {
    this.ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';
    this.ffprobePath = process.env.FFPROBE_PATH || '/usr/bin/ffprobe';
    
    // Set FFmpeg paths
    ffmpeg.setFfmpegPath(this.ffmpegPath);
    ffmpeg.setFfprobePath(this.ffprobePath);
  }

  async createVideoFromImages(
    imagePaths: string[],
    outputPath: string,
    options: VideoOptions = {}
  ): Promise<VideoMetadata> {
    const {
      width = 1920,
      height = 1080,
      duration = 3,
      fps = 30,
      outputFormat = 'mp4',
      quality = 'medium',
      transition = 'fade'
    } = options;

    return new Promise((resolve, reject) => {
      try {
        // Create input list file for FFmpeg
        const inputListPath = this.createInputList(imagePaths, duration);
        
        let command = ffmpeg()
          .input(inputListPath)
          .inputOptions(['-f', 'concat', '-safe', '0'])
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt', 'yuv420p',
            '-r', fps.toString(),
            '-s', `${width}x${height}`,
            '-preset', this.getPreset(quality),
            '-crf', this.getCRF(quality)
          ]);

        // Add transition effects
        if (transition !== 'none') {
          command = this.addTransitionEffects(command, transition, imagePaths.length);
        }

        command
          .output(outputPath)
          .on('start', (commandLine) => {
            console.log('FFmpeg started:', commandLine);
          })
          .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent}% done`);
          })
          .on('end', () => {
            // Clean up temporary files
            fs.unlinkSync(inputListPath);
            
            // Get video metadata
            this.getVideoMetadata(outputPath)
              .then(resolve)
              .catch(reject);
          })
          .on('error', (error) => {
            // Clean up temporary files
            if (fs.existsSync(inputListPath)) {
              fs.unlinkSync(inputListPath);
            }
            reject(error);
          })
          .run();
      } catch (error) {
        reject(error);
      }
    });
  }

  async addAudioToVideo(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => {
          this.getVideoMetadata(outputPath)
            .then(resolve)
            .catch(reject);
        })
        .on('error', reject)
        .run();
    });
  }

  async resizeVideo(
    inputPath: string,
    outputPath: string,
    width: number,
    height: number
  ): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .aspect(`${width}:${height}`)
        .autopad()
        .output(outputPath)
        .on('end', () => {
          this.getVideoMetadata(outputPath)
            .then(resolve)
            .catch(reject);
        })
        .on('error', reject)
        .run();
    });
  }

  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const stats = fs.statSync(videoPath);

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          size: stats.size,
          format: metadata.format.format_name || 'unknown'
        });
      });
    });
  }

  private createInputList(imagePaths: string[], duration: number): string {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const listPath = path.join(tempDir, `input_${Date.now()}.txt`);
    const listContent = imagePaths
      .map(imagePath => `file '${path.resolve(imagePath)}'\nduration ${duration}`)
      .join('\n') + '\n';

    fs.writeFileSync(listPath, listContent);
    return listPath;
  }

  private addTransitionEffects(command: any, transition: string, imageCount: number): any {
    switch (transition) {
      case 'fade':
        return command.complexFilter([
          `[0:v]fade=in:0:30,fade=out:${imageCount * 90 - 30}:30[v]`
        ], 'v');
      
      case 'slide':
        return command.complexFilter([
          `[0:v]slide=direction=right:duration=1[v]`
        ], 'v');
      
      case 'zoom':
        return command.complexFilter([
          `[0:v]scale=2*iw:2*ih,crop=iw/2:ih/2:x/2:y/2,scale=iw:ih[v]`
        ], 'v');
      
      default:
        return command;
    }
  }

  private getPreset(quality: string): string {
    switch (quality) {
      case 'low': return 'ultrafast';
      case 'medium': return 'medium';
      case 'high': return 'slow';
      default: return 'medium';
    }
  }

  private getCRF(quality: string): string {
    switch (quality) {
      case 'low': return '28';
      case 'medium': return '23';
      case 'high': return '18';
      default: return '23';
    }
  }
}

// Helper functions
export function validateImageFormats(imagePaths: string[]): boolean {
  const supportedFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'];
  return imagePaths.every(imagePath => {
    const ext = path.extname(imagePath).toLowerCase();
    return supportedFormats.includes(ext);
  });
}

export function estimateVideoSize(imageCount: number, duration: number, quality: string): number {
  // Rough estimation in MB
  const baseSize = imageCount * duration * 0.5; // Base size per image-second
  const qualityMultiplier = quality === 'high' ? 2 : quality === 'low' ? 0.5 : 1;
  return Math.round(baseSize * qualityMultiplier);
}