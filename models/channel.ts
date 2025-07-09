import { Channel as PrismaChannel, Video, Privacy } from '@prisma/client';

export interface Channel extends PrismaChannel {}

export interface ChannelWithVideos extends Channel {
  videos: Video[];
}

export interface CreateChannelInput {
  youtubeChannelId: string;
  channelName: string;
  channelHandle?: string;
  avatarUrl?: string;
  subscriberCount?: number;
  isDefault?: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultTags?: string[];
  defaultPrivacy?: Privacy;
}

export interface UpdateChannelInput {
  channelName?: string;
  channelHandle?: string;
  avatarUrl?: string;
  subscriberCount?: number;
  isDefault?: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultTags?: string[];
  defaultPrivacy?: Privacy;
}

export interface ChannelStats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  avgViews: number;
  recentUploads: number;
}

export interface YouTubeChannelInfo {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}