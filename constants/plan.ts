export const planDataKR = [
  {
    plan: 'Free',
    exhibition: '1',
    administrator: '1',
    plus: '주요 기능',
    explanation: ['· 전시회 생성 및 관리', '· 광고 배너 포함', '· 1년 무료 체험'],
  },
  {
    plan: 'Personal',
    exhibition: '20',
    administrator: '2',
    plus: '모든 무료 기능 포함',
    explanation: ['· 2~10개의 전시회', '· 광고 배너 삭제', '· 채널 페이지 포함', '· 메인 페이지에서 검색 노출'],
  },
  {
    plan: 'Business',
    exhibition: '200',
    administrator: '3~10',
    plus: '모든 개인용 기능 포함,',
    explanation: [
      '· 20~200개의 전시회',
      '· 커스텀 페이지 포함',
      '· 디자인 모드',
      '· 사이트 기본 설정',
      '· 관리자 기능 포함',
    ],
  },
  {
    plan: 'Enterprise',
    exhibition: '350',
    administrator: '20',
    plus: '모든 비스니스 기능 포함,',
    explanation: [
      '· 350개의 전시회',
      '· 홈 플랫폼 추가',
      '· 일반 사용자 가입 가능',
      '메인 페이지에 전시 비공개',
      '독점 전시회 관리',
    ],
  },
  {
    plan: 'API',
    exhibition: '',
    administrator: '',
    plus: 'https://www.onthewallservice.io/feedback',
    explanation: [],
  },
];
export const planDataEN = [
  {
    plan: 'Free',
    exhibition: '1',
    administrator: '1',
    plus: 'Top features',
    explanation: ['Create and manage exhibitions', 'Advertising banners'],
  },
  {
    plan: 'Personal',
    exhibition: '20',
    administrator: '2',
    plus: 'All Free features, plus,',
    explanation: [
      '· 2~10 Exhibitions',
      '· Delete advertising banner',
      '· Add and edit basic information on the channel page',
      '· Add and edit sections on the channel page',
    ],
  },
  {
    plan: 'Business',
    exhibition: '200',
    administrator: '3~10',
    plus: 'All Personal features, plus,',
    explanation: [
      '· 20~200 Exhibitions',
      '· Add custom page (Unable to register)',
      '· Custom page design mode',
      '· Site basic settings',
    ],
  },
  {
    plan: 'Enterprise',
    exhibition: '350',
    administrator: '20',
    plus: 'All Business features, plus,',
    explanation: ['· 350 Exhibitions', '· Add Home page (Enable to register)', '· Exclusive exhibition management'],
  },
  {
    plan: 'API',
    exhibition: '',
    administrator: '',
    plus: 'https://onthewallservice.io/inquiry',
    explanation: [],
  },
];

export const PriceKR = {
  Monthly: {
    Free: '₩0',
    Personal: '₩8,900~',
    Business: '₩110,000~',
    Enterprise: '₩1,650,000~',
    API: '문의 필요',
  },
  Annual: {
    Free: '₩0',
    Personal: '₩85,440~',
    Business: '₩1,056,000~',
    Enterprise: '₩15,800,000~',
    API: '문의 필요',
  },
};
export const PriceEN = {
  Monthly: {
    Free: '$0',
    Personal: '$9~',
    Business: '$110~',
    Enterprise: '$1,645~',
    API: 'Discussion',
  },
  Annual: {
    Free: '$0',
    Personal: '$85~',
    Business: '$1,056~',
    Enterprise: '$15,792~',
    API: 'Discussion',
  },
};

export const comparePlan = ['Free', 'Personal', 'Business', 'Enterprise', 'API'];

export const compareDataKR = [
  {
    category: '전시',
    items: [
      {
        label: '전시갯수',
        values: { Free: '1', Personal: '20', Business: '200', Enterprise: '350', API: '' },
      },
      {
        label: '관리자',
        values: { Free: '1', Personal: '2', Business: '~10', Enterprise: '~20', API: '' },
      },
      {
        label: '광고배너',
        values: { Free: true, Personal: false, Business: false, Enterprise: false, API: false },
      },
    ],
  },
  {
    category: '채널',
    items: [
      {
        label: '채널 관리',
        values: { Free: false, Personal: true, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '채널 설명',
        values: { Free: false, Personal: true, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'SNS 링크',
        values: { Free: false, Personal: true, Business: true, Enterprise: true, API: '' },
      },
    ],
  },
  {
    category: '커스텀 페이지',
    items: [
      {
        label: '섹션',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '배너이미지',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '동영상',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
    ],
  },
  {
    category: '사이트 기본설정',
    items: [
      {
        label: '제목',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '설명',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '로고',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '파비콘',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '오픈그래프',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: '사이트 정보',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
    ],
  },
];
export const compareDataEN = [
  {
    category: 'Exhibition',
    items: [
      {
        label: 'Exhibition Count',
        values: { Free: '1', Personal: '20', Business: '200', Enterprise: '350', API: '' },
      },
      {
        label: 'Administrator',
        values: { Free: '1', Personal: '2', Business: '~10', Enterprise: '~20', API: '' },
      },
      {
        label: 'Banner Ads',
        values: { Free: true, Personal: false, Business: false, Enterprise: false, API: false },
      },
    ],
  },
  {
    category: 'Channel',
    items: [
      {
        label: 'Channel Name',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Channel Settings',
        values: { Free: false, Personal: true, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Description',
        values: { Free: false, Personal: true, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'SNS Link',
        values: { Free: false, Personal: true, Business: true, Enterprise: true, API: '' },
      },
    ],
  },
  {
    category: 'Custom Page',
    items: [
      {
        label: 'Section',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Banner',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Video',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
    ],
  },
  {
    category: 'Site Settings',
    items: [
      {
        label: 'Title',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Description',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Logo',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Favicon',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'OpenGraph',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
      {
        label: 'Footer',
        values: { Free: false, Personal: false, Business: true, Enterprise: true, API: '' },
      },
    ],
  },
];

export const TooltipDataKR = {
  Channel: `이 기능은 Personal Plan 이상에서 사용할 수 있습니다. 나만의 채널을 만들고 전시를 관리할 수 있습니다.`,
  CustomPage: `이 기능은 Business Plan 이상에서 사용할 수 있습니다. 사용자 정의 페이지를 통해 전시회를 관리하고 섹션을 편집하여 전시회를 홍보할 수 있습니다.`,
  SiteSetting: `이 기능은 사용자 지정 페이지 기능이 포함된 플랜에 적용됩니다. 사이트에 기본 정보를 추가하고 편집할 수 있습니다.`,
};
export const TooltipDataEN = {
  Channel: `This feature is available from the Personal Plan or higher. You can create your own channel and manage your exhibitions.`,
  CustomPage: `This feature is available from the Business Plan and above. You can manage your exhibitions through custom pages and promote your exhibitions by editing sections.`,
  SiteSetting: `This feature applies to plans that include the Custom Page feature. You can add and edit basic information on your site.`,
};
