type ProjectTier = 'free' | 'enterprise' | 'business' | 'personal';
type SubscriptionModel = 'annual' | 'monthly' | 'custom';
type ProjectStatus = 'processing' | 'expired' | 'activated';

type ProjectConfiguration = {
  adminMaxCount: number;
  isAutoApproved: boolean;
  initialAssignedCount: number | 3;
};

type Project = {
  id: string;
  channelName: string;
  projectUrl: string;
  subscriptionModel: SubscriptionModel;
  tier: ProjectTier;
  status: ProjectStatus;
  exhibitionLimit: number;
  assignedExhibitionCount: number;
  currentExhibitionCount: number;
  adminExhibitionCount: number;
  expiredAt: any;
  createdAt: any;
  updatedAt: any;
  // 기록
  likeCount: number;
  commentCount: number;
  viewCount: number;
  type: 'ONTHEWALL_CLOUD';
  config: ProjectConfiguration;
  ownerId: string;
  isExistingOld?: boolean; // channelName 업데이트 관현해서
};