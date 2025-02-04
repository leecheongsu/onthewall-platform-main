'use client';

import React, { use, useEffect, useState } from 'react';
import GalleryA from '@/components/GroupExhibition/GalleryType/GalleryA';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import styled from '@emotion/styled';
import LinkToast from '@/components/LinkToast';

interface PageProps {
  params: { slug: string };
}

const Page = ({ params }: PageProps) => {
  const { slug } = params;
  const [data, setData] = useState<any>([]);
  const [channelData, setChannelData] = useState<any[]>([]);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const exhibitionsRef = collection(db, 'Exhibition');
        const q = query(exhibitionsRef, where('projectId', '==', slug), where('isDeleted', '==', false));

        const querySnapshot = await getDocs(q);
        const channelData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setChannelData(channelData);
      } catch (error) {
        console.error('Error fetching exhibitions for channel:', error);
      }
    };

    fetchChannelData();
  }, [slug]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exhibitionsRef = collection(db, 'GlobalDesign', 'ONTHEWALL_CLOUD', 'Section');
        const q = query(exhibitionsRef, where('channelId', '==', slug));

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))[0];

        setData(data);
      } catch (error) {
        console.error('Error fetching exhibitions for channel:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Container>
      <SectionTop>
        <SectionTitle>{data.title}</SectionTitle>
        <SectionDesc>{data.description}</SectionDesc>
      </SectionTop>
      <Box>
        {/* <GalleryA exhibitionData={channelData} isTotal={true} /> */}
        <LinkToast />
      </Box>
    </Container>
  );
};

export default Page;

const Container = styled.div`
  margin-bottom: 30px;
  width: 100%;
`;

const Box = styled.div<{ mobileView?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.mobileView ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)')};
  gap: ${(props) => (props.mobileView ? '10px' : '20px')};
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const SectionTop = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div<{ mobileView?: boolean }>`
  font-size: ${(props) => (props.mobileView ? '1.25rem' : '1.5rem')};
  font-weight: 700;
  color: #363636;
  line-height: 1.25;
  margin-bottom: 10px;
`;

const SectionDesc = styled.div<{ mobileView?: boolean }>`
  font-size: ${(props) => (props.mobileView ? '0.875rem' : '1rem')};
  line-height: 1.25;
  color: #94a3b8;
`;
