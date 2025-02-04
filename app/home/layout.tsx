'use client';

import React, { ReactNode, useEffect, useRef } from 'react';

import Footer from '@/components/layouts/Footer';
import CommonHeader from '@/components/layouts/CommonHeader';
import styled from '@emotion/styled';
import { useDesignStore } from '@/store/design';
import { KEY } from '@/constants/globalDesign';
import { insertUser, validUser } from '@/app/home/_fetching/user';
import { setEx, setSpace, updateUid } from './_fetching/exhibition';
import { insertAllProjectDesign } from '@/app/home/_fetching/projectDesign';
import { insertSections } from '@/app/home/_fetching/section';

// import { combineProjects } from './_fetching/project';

interface Props {
  children: ReactNode;
}

const HomeLayout = ({ children }: Props) => {
  const [height, setHeight] = React.useState(0);
  const { setGlobalDesignData } = useDesignStore((state) => state);
  const fetchData = async () => {
    setGlobalDesignData(KEY);
  };
  useEffect(() => {
    const updateHeight = () => {
      const footer = document.querySelector('footer')?.clientHeight || 0;
      setHeight(footer);
    };
    updateHeight();
    fetchData();
  }, []);

  const isExecuted = useRef(false);
  useEffect(() => {
    // const processedProjects: string[] = [];
    // combineProjects(processedProjects);

    if (!isExecuted.current) {
      // updateUid();
      // validUser()
      // insertUser()
      // insertAllProjectDesign();
      // insertSections();
      // setEx();
      // setSpace();
      isExecuted.current = true;
    }
  }, []);

  return (
    <>
      <CommonHeader />
      <Container height={height}>{children}</Container>
      <Footer />
    </>
  );
};

export default HomeLayout;

const Container = styled.section<{ height?: any }>`
  padding: 60px 20px 0;
  max-width: 1200px;
  width: 100vw;
  margin: 0 auto;
  min-height: calc(100vh - ${(props) => props?.height}px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;
