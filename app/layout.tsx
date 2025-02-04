import Script from 'next/script';
import React, { ReactNode } from 'react';
import '../styles/globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { META } from '@/constants/metadata';
import { Metadata } from 'next';

interface RootLayoutProps {
  children: ReactNode;
}

export function generateMetadata() {
  return {
    metadataBase: new URL('https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/paintings'),
    title: META.title,
    description: META.description,
    keywords: [...META.keyword],
    openGraph: {
      title: META.title,
      description: META.description,
      url: META.ogUrl,
      siteName: META.title,
      images: [
        {
          url: META.ogUrl,
          width: 800,
          height: 600
        }
      ],
      locale: 'ko_KR',
      type: 'website'
    },
  } as Metadata;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  generateMetadata();

  return (
    <html translate="no">
    <head>
      <Script src="https://cdn.iamport.kr/v1/iamport.js" />
      <Script
        async
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
        integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
        crossOrigin="anonymous"
      ></Script>
      <meta name="naver-site-verification" content="273b03772b8c27f6755fc155b0b8336a36f0abad" />
      <meta name="google-site-verification" content="oPp97vXwegD9_hKAPIhdGA7jmrtAfgreOBpTiglTRxg" />

      <meta name="robots" content="index,follow"></meta>
      <link rel="shortcut icon" type="image/x-icon" href={META.faviconUrl} />
      <link rel="canonical" href="https://www.onthewall.io/" />
    </head>
    <body>{children}</body>
    </html>
  );
};

export default RootLayout;
