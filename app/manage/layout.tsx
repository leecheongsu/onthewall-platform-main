'use client';

import React, { ReactNode, useState } from 'react';
import SideMenu from '@/components/manage/SideMenu';
import PageHeader from '@/components/layouts/ManagePageHeader';
import styled from '@emotion/styled';

interface Props {
  children: ReactNode;
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #f1f4f9;
`;

const Section = styled.section<{ isOpen: boolean }>`
  width: ${({ isOpen }) => (isOpen ? 'calc(100% - 245px)' : '100%')};
  height: calc(100% - 80px);
  padding: 30px 50px 50px 50px;
  transition: left 0.3s ease;
  position: fixed;
  top: 80px;
  left: ${({ isOpen }) => (isOpen ? '245px' : '0')};
  bottom: 0;
  overflow: auto;
  z-index: 999;
`;

function ManageLayout({ children }: Props) {
  const [isShow, setIsShow] = useState(true);

  return (
    <Wrapper>
      <PageHeader />
      <SideMenu state={isShow} setState={() => setIsShow((prev) => !prev)} />
      <Section isOpen={isShow}>{children}</Section>
    </Wrapper>
  );
}

export default ManageLayout;
