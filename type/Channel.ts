import { type } from 'os';
import { Timestamp } from 'firebase/firestore';

export type Channel = {
  title: string;
  subscribers: number;
  thumbnail: string;
  description?: string;
  isSubscribed?: boolean;
  url: string;
  likeCount?: number;
  projectUrl?: string;
  viewCount?: number;
  commentCount?: number;
  channelName: string;
  channelId: string;
  id: string;
  createdAt?: Timestamp;
};
