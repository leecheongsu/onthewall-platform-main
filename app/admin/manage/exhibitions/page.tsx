'use client';
import DataTable from './components/DataTable';
import NotFound from '@/pages/404';

import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import moment from 'moment';
import styled from '@emotion/styled';
import { useTranslation } from 'next-i18next';

interface Props {
  params: {
    projectUrl: string;
  };
}

const fetchData = async (projectUrl: string) => {
  try {
    const q1 = query(collection(db, 'Exhibition'), where('isDeleted', '==', false), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q1);
    const exhibitions: Array<Exhibition> = [];
    snapshot.forEach((doc) => {
      const createdAt = doc.data().createdAt ? moment(doc.data().createdAt.toDate()).format('YYYY-MM-DD') : '';
      const updatedAt = doc.data().updatedAt ? moment(doc.data().updatedAt.toDate()).format('YYYY-MM-DD') : '';

      exhibitions.push({ ...doc.data(), id: doc.id, createdAt, updatedAt } as Exhibition);
    });
    return exhibitions;
  } catch (e) {
    console.error('Get Exhibition Table Data Error : ', e);
    return [];
  }
};

async function Page({ params: { projectUrl } }: Props) {
  const [data, setData] = useState<Exhibition[] | null>(null);
  const { t } = useTranslation();
  useEffect(() => {
    fetchData(projectUrl).then((data) => {
      setData(data);
      console.log(data);
    });
  }, []);

  if (data) {
    return (
      <>
        <Container>
          <Header>
            <HeaderTitle>{t('Exhibitions')}</HeaderTitle>
          </Header>
          <DataTable data={data} />
        </Container>
      </>
    );
  } else <NotFound />;
}

export default Page;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  line-height: 40px;
`;
