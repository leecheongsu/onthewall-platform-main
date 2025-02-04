'use client';

import React, { ReactNode, useEffect } from 'react';
import Footer from '@/components/layouts/Footer';
import Navbar from '@/components/layouts/MainHeader';
import styled from '@emotion/styled';
import { WelcomeModal } from '@/app/[projectUrl]/main/components/modals';
import { useUserStore } from '@/store/user';
import { useProjectStore } from '@/store/project';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, where, query } from 'firebase/firestore';

interface Props {
  params: {
    projectUrl: string;
  };
  children: ReactNode;
}

function MainLayout({ params, children }: Props) {
  const [height, setHeight] = React.useState(0);
  const [hidePopup, setHidePopup] = React.useState(false);
  const { isLogin } = useUserStore();
  const { tier } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    const updateHeight = () => {
      const footer = document.querySelector('footer')?.clientHeight || 0;
      setHeight(footer);
    };
    updateHeight();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scriptTags = document.querySelectorAll('script');

      scriptTags.forEach((script) => {
        if (script.type === 'application/ld+json' && !script.textContent?.includes(params.projectUrl)) {
          script.remove();
        }
      });
    }
  }, []);

  useEffect(() => {
    getDocs(query(collection(db, 'Project'), where('projectUrl', '==', params.projectUrl))).then((snap) => {
      if (snap.size === 0) {
        router.push('/home');
        return;
      }
      const project = snap.docs[0].data();
      if (project.tier === 'free') {
        router.push('/home');
        return;
      }
      if (project.tier === 'personal') {
        router.push('/home');
        return;
      }
    });
  }, []);

  useEffect(() => {
    const hide = sessionStorage.getItem('hidePopup');
    if (hide) {
      setHidePopup(true);
    }
  }, []);

  return (
    <>
      <Navbar />
      <Container height={height}>{children}</Container>
      <Footer />
      {isLogin && !hidePopup && <WelcomeModal />}
    </>
  );
}

export default MainLayout;

const Container = styled.section<{ height?: any }>`
  padding: 60px 20px 0;
  max-width: 1200px;
  width: 100vw;
  margin: 0 auto;
  min-height: calc(100vh - ${(props) => props?.height}px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
`;
