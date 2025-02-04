'use client';

import React, { ReactNode, useState } from 'react';
import SideMenu from '@/components/manage/SideMenu';
import PageHeader from '@/components/layouts/ManagePageHeader';
import styled from '@emotion/styled';
import LoginGuard from '@/components/Guard/LoginGuard';
// import ManageGuard from '@/components/Guard/ManageGuard';
import { useDesignStore } from '@/store/design';
import ArrowLeftIcon from '@/images/icons/ArrowLeft';

interface Props {
  children: ReactNode;
}

const Wrapper = styled.div<{ theme: any }>`
  width: 100%;
  height: 100vh;
  background: ${({ theme }) => theme};
  overflow: hidden;
`;

const Section = styled.section<{ isOpen: boolean }>`
  width: 100%;
  height: calc(100vh - 60px);
  transition: left 0.3s ease;
  top: 60px;
  bottom: 0;
  overflow: auto;

  // scroll bar
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #c4c4c4;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

const ManageLayout: React.FC<Props> = ({ children }) => {
  const [isShow, setIsShow] = useState(false);
  const theme = useDesignStore((state) => state.theme);
  return (
    <LoginGuard>
      <Wrapper theme={theme.secondary}>
        <PageHeader />
        <div style={{ display: 'flex', paddingTop: '60px' }}>
          <SideMenu
            state={isShow}
            setState={() => {
              setIsShow((prev) => !prev);
            }}
          />
          <IconButton
            type="button"
            isShow={isShow}
            onClick={() => {
              setIsShow((prev) => !prev);
            }}
          >
            <ArrowLeftRotateIcon isOpen={isShow} />
          </IconButton>
          <Section isOpen={isShow}>{children}</Section>
        </div>
      </Wrapper>
    </LoginGuard>
  );
};

export default ManageLayout;

const IconButton = styled.button<{ isShow: boolean }>`
  width: 30px;
  height: 30px;
  top: calc(100px);
  left: ${({ isShow }) => (isShow ? '230px' : '44px')};
  position: absolute;
  transform: translateY(-50%);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 12px;
  z-index: 9;
  opacity: 0.8;
  transition: left 0.3s ease, opacity 0.3s ease;
  &:hover {
    opacity: 1;
  }
`;
const ArrowLeftRotateIcon = styled(ArrowLeftIcon)<{ isOpen: boolean }>`
  width: 12px;
  height: 12px;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(0)' : 'rotate(180deg)')};
  transition: transform 0.3s ease-in-out;
`;
