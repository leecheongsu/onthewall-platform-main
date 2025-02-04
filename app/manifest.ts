import { MetadataRoute } from 'next';
import { DEFAULT_IMAGES } from '@/constants/defaultLayoutInfo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ONTHEWALL',
    short_name: 'ONTHEWALL',
    description:
      '현실같은 온라인 갤러리 공간에 작품을 전시하고 친구들을 초대해보세요. \n 모두의 소셜 전시 플랫폼, OnTheWall!',
    start_url: `${process.env.NEXT_PUBLIC_ONTHEWALL_CLOUD_URL}`,
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: DEFAULT_IMAGES.faviconUrl,
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
