'use client';

import React, { ReactNode, useEffect } from 'react';

import Footer from '@/components/layouts/Footer';
import CommonHeader from '@/components/layouts/CommonHeader';
import styled from '@emotion/styled';
import { useDesignStore } from '@/store/design';

interface Props {
  children: ReactNode;
}

const AccountLayout = ({ children }: Props) => {
  const [height, setHeight] = React.useState(0);
  const { setDefaultDesignData } = useDesignStore((state) => state);
  const [isKakaoLoaded, setIsKakaoLoaded] = React.useState(false);
  useEffect(() => {
    const updateHeight = () => {
      if (typeof document !== 'undefined') {
        const footer = document.querySelector('footer')?.clientHeight || 0;
        setHeight(footer);
      }
    };
    updateHeight();
    setDefaultDesignData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Dynamically load Kakao SDK script if it's not already loaded
      if (!window.Kakao) {
        const script = document.createElement('script');
        script.src = 'https://developers.kakao.com/sdk/js/kakao.min.js';
        script.onload = () => {
          window.Kakao.init('000449cced76c5fafdf4c8b065679d0b');
          setIsKakaoLoaded(true);
        };
        document.head.appendChild(script);
      } else {
        if (!Kakao.isInitialized()) {
          Kakao.init('000449cced76c5fafdf4c8b065679d0b');
          setIsKakaoLoaded(true);
        } else {
          setIsKakaoLoaded(true);
        }
      }
    }
  }, []);

  return (
    <>
      <CommonHeader />
      {isKakaoLoaded && <Container height={height}>{children}</Container>}
      <Footer />
    </>
  );
};

export default AccountLayout;

const Container = styled.section<{ height?: any }>`
  padding: 20px 20px 0;
  max-width: 1200px;
  width: 100vw;
  margin: 0 auto;
  min-height: calc(100vh - ${(props) => props?.height}px);
  display: flex;
  justify-content: center;
  align-items: center;
  // mobile
  @media (max-width: 768px) {
    padding: 20px 0px;
  }
`;
