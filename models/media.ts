import { Media as PrismaMedia, MediaType, VideoMedia } from '@prisma/client';

export interface Media extends PrismaMedia {}

export interface MediaWithVideos extends Media {
  videos: VideoMedia[];
}

export interface CreateMediaInput {
  type: MediaType;
  sourceUrl: string;
  downloadUrl?: string;
  fileName: string;
  fileSize?: number;
  dimensions?: string;
  instagramId?: string;
  instagramAccount?: string;
  caption?: string;
}

export interface UpdateMediaInput {
  downloadUrl?: string;
  fileSize?: number;
  dimensions?: string;
  caption?: string;
  isProcessed?: boolean;
  isCopyrightFree?: boolean;
  flagged?: boolean;
}

export interface MediaFilter {
  type?: MediaType;
  instagramAccount?: string;
  isProcessed?: boolean;
  isCopyrightFree?: boolean;
  flagged?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface InstagramPost {
  id: string;
  url: string;
  mediaUrl: string;
  caption?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
  permalink: string;
}

export interface ProcessingOptions {
  resize?: {
    width: number;
    height: number;
  };
  compress?: boolean;
  addWatermark?: boolean;
  extractFrames?: boolean; // For videos
}