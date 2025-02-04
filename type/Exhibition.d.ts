type Version = 0 | 1.0 | 1.5 | 2.0;
type ExhibitionStatus = 'created' | 'published' | 'closed';
type PosterImage = {
  path: string;
  url: string;
};

type Exhibition = {
  id: string; // primary-key

  // 전시정보
  title: string;
  author?: string; //TODO. deprecated 예정
  description: string;
  compressedPosterImage: PosterImage;
  originalPosterImage: PosterImage;
  thumbnailPosterImage: PosterImage;

  musicId: string;
  musicTitle: string;
  showcase: string;
  showcaseTitle: string;
  space: Space;

  // 관계 정보
  owner?: string; //TODO. deprecated 예정
  uid: string;
  projectId: string;
  channelName: string; // TODO. previous(1.0) 에서 (2.0) 넘어올때 업데이트 처리 필요 - 검색을 위한 필드

  cloudData?: any; // 기존 데이터 처리를 위함

  //에디터 설정 정보
  editOption: {
    isFixedAngle: boolean;
  };

  // 뷰어 설정 정보
  hasLikeButton: boolean;
  hasLinkButton: boolean;
  hasMenuButton: boolean;
  hasObjectChat: boolean;
  hasSize: boolean;
  hasTitle: boolean;
  hasView: boolean;
  effectFXAA: boolean;

  // 전시 상태 처리 정보
  status: ExhibitionStatus;
  version: Version;
  isHidden: boolean;
  isPrivate: boolean;
  isDeleted: boolean;
  isPlatform: boolean;

  // 보안
  loginIPAddress: string;
  loginToken: string;

  // 날짜정보
  publishedAt?: any;
  createdAt?: any;
  updatedAt?: any;
  expiredAt?: any;
  projectExpiredAt?: any; //TODO. 정기결제시 다음 결제예정일을 Timeout으로 걸어둘 것.
  projectTier: 'free' | 'personal' | 'business' | 'enterprise';

  // 활동 정보
  like: number;
  commentCount: number;
  objectLikeNum: number;
  views: {
    todayView: number;
    totalView: number;
  };
};
