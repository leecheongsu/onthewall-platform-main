'use client';

import GroupExhibition from '@/components/GroupExhibition';
import { db } from '@/lib/firebase';
import styled from '@emotion/styled';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import getTimestampByDayBefore from '@/utils/getTimestampByDayBefore';
import { useLanguageStore } from '@/store/language';

const Page = ({}) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exhibitions, setExhibitions] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('POPULAR_EXHIBITION');
  const [layout, setLayout] = useState('GalleryA');

  const fetchData = async () => {
    let q = null;

    if (dueDate === 'monthly') {
      q = query(
        collection(db, 'Exhibition'),
        where('isDeleted', '==', false),
        where('version', '==', 2),
        where('projectTier', '!=', 'enterprise'),
        where('publishedAt', '>=', getTimestampByDayBefore(30)),
        where('views.totalView', '>=', 50),
        orderBy('views.totalView', 'desc')
      );
    } else {
      q = query(
        collection(db, 'Exhibition'),
        where('isDeleted', '==', false),
        where('version', '==', 2),
        where('projectTier', '!=', 'enterprise'),
        where('publishedAt', '>=', getTimestampByDayBefore(365)),
        where('views.totalView', '>=', 50),
        orderBy('views.totalView', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const exhibitions: any = [];
    querySnapshot.forEach((doc) => {
      exhibitions.push({ ...doc.data(), id: doc.id });
    });
    setExhibitions(exhibitions);
  };

  useEffect(() => {
    if (dueDate === 'monthly') {
      setTitle(t('Popular Exhibition of the Month'));
      setDescription(t("Check out this month's popular exhibitions that captured the hearts of visitors"));
      setDueDate('monthly');
    } else {
      setTitle(t('Popular Exhibition of the Year'));
      setDescription(t('the most popular exhibition that shined this year! Come see it now!'));
      setDueDate('annual');
    }
    fetchData();
  }, [dueDate, language]);

  useEffect(() => {
    const url = new URL(window.location.href);
    const isMonthly: any = url.searchParams.get('dueDate');
    setDueDate(isMonthly);
  }, []);

  return (
    <Container>
      <GroupExhibition
        title={title}
        description={description}
        exhibitions={exhibitions}
        dueDate={dueDate}
        type={type}
        layout={layout}
        hasMore={false}
      />
    </Container>
  );
};

export default Page;

const Container = styled.div`
  width: 100%;
`;
