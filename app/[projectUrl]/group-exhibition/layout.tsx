'use client';

import React, { ReactNode, useEffect } from 'react';

import Footer from '@/components/layouts/Footer';
import MainHeader from '@/components/layouts/MainHeader';
import styled from '@emotion/styled';

interface Props {
  children: ReactNode;
}

const GroupLayout = ({ children }: Props) => {
  const [height, setHeight] = React.useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const footer = document.querySelector('footer')?.clientHeight || 0;
      setHeight(footer);
    };
    updateHeight();
  }, []);

  return (
    <>
      <MainHeader />
      <Container height={height}>{children}</Container>
      <Footer />
    </>
  );
};

export default GroupLayout;

const Container = styled.section<{ height?: any }>`
  padding: 120px 20px 0;
  max-width: 1200px;
  width: 100vw;
  margin: 0 auto;
  min-height: calc(100vh - ${(props) => props?.height}px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;
