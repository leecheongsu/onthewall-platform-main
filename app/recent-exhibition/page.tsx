'use client';

import React, { useEffect, useState } from 'react';
import Total from '@/components/home/Total';
import LinkToast from '@/components/LinkToast';
import styled from '@emotion/styled';
const Page = ({}) => {
  return (
    <Container>
      <Total />
      <LinkToast />
    </Container>
  );
};

export default Page;

const Container = styled.div`
  width: 100%;
`;
