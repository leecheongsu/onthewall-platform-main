import React, { use, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import styled from '@emotion/styled';
import EmptySpace from '../../common/EmptySpace';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import LinkToast from '@/components/LinkToast';
import { EmptyItem } from '../EmptyItem';
import GalleryA from '@/components/GroupExhibition/GalleryType/GalleryA';
import { getDoc, doc } from 'firebase/firestore';

type Props = { data: any };

function ExhibitionList({ data }: Props) {
  const { t } = useTranslation();
  const [exhibitions, setExhibitions] = useState([]);
  const [groupExhibition, setGroupExhibition] = useState<any>({
    title: '',
    description: '',
    exhibitions: [],
  });

  const fetchData = async () => {
    try {
      const exhibitionsData: any = await Promise.all(
        data?.exhibitions.map(async (exhibition: any) => {
          if (exhibition.type === 'onthewall') {
            const exhibitionDocRef = doc(db, 'Exhibition', exhibition.value);
            const exhibitionDoc = await getDoc(exhibitionDocRef);

            if (exhibitionDoc.exists()) {
              return {
                ...exhibition,
                ...exhibitionDoc.data(),
                id: exhibition.value,
              };
            }
          }
          return exhibition;
        })
      );
      setExhibitions(exhibitionsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    if (data) {
      fetchData();
    }
  }, [data]);

  return (
    <Container>
      {data.exhibitions === undefined || data.exhibitions.length === 0 ? (
        <EmptyItem />
      ) : (
        <GalleryA exhibitions={exhibitions} hasMore={true} />
      )}

      <EmptySpace height={40} />
      <LinkToast />
    </Container>
  );
}

export default ExhibitionList;

const Container = styled.div`
  width: 100%;
  padding-top: 20px;
`;
