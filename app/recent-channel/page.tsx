'use client';

import React from 'react';

import styled from '@emotion/styled';
import RecentChannel from '@/components/home/RecentChannel';

const Page = ({}) => {
  return (
    <Container>
      <RecentChannel />
    </Container>
  );
};

export default Page;

const Container = styled.div`
  margin-bottom: 30px;
  width: 100%;
`;
