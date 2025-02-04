import { DEFAULT_IMAGES, DEFAULT_INFO } from '@/constants/defaultLayoutInfo';

export const META = {
  title: DEFAULT_INFO.title,
  siteName: 'ONTHEWALL',
  description: DEFAULT_INFO.description,
  keyword: [
    'ONTHEWALL',
    'onthewall',
    'onthewallcloud',
    'Onthewall',
    '온더월',
    '온라인 갤러리',
    '온라인 전시',
    '온라인 전시회',
    '온라인 전시 플랫폼',
    '전시',
    '전시 플랫폼',
    '메타버스 미술관',
    '가상 전시',
    '가상 전시 플랫폼',
  ],
  url: process.env.NEXT_PUBLIC_ONTHEWALL_CLOUD_URL,
  googleVerification: '1Kq1wGTa1FMMwWp34Qcq65k2Oxfedo0A9vtJxgDMflg',
  ...DEFAULT_IMAGES,
} as const;
