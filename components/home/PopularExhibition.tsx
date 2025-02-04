import { useMobileViewStore } from '@/store/mobile';
import { useProjectStore } from '@/store/project';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GroupExhibition from '../GroupExhibition';

import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import getTimestampByDayBefore from '@/utils/getTimestampByDayBefore';
import { useLanguageStore } from '@/store/language';

type Props = { dueDate: string; type: string; layout: string };
const PopularExhibition = ({ dueDate, type, layout }: Props) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exhibitions, setExhibitions] = useState([]);

  useEffect(() => {
    if (exhibitions) {
      if (dueDate === 'monthly') {
        setTitle(t('Popular Exhibition of the Month'));
        setDescription(t("Check out this month's popular exhibitions that captured the hearts of visitors"));
      } else {
        setTitle(t('Popular Exhibition of the Year'));
        setDescription(t('the most popular exhibition that shined this year! Come see it now!'));
      }
    }
  }, [exhibitions, language]);

  useEffect(() => {
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
          orderBy('views.totalView', 'desc'),
          limit(5)
        );
      } else {
        q = query(
          collection(db, 'Exhibition'),
          where('isDeleted', '==', false),
          where('version', '==', 2),
          where('projectTier', '!=', 'enterprise'),
          where('publishedAt', '>=', getTimestampByDayBefore(365)),
          where('views.totalView', '>=', 50),
          orderBy('views.totalView', 'desc'),
          limit(5)
        );
      }

      const querySnapshot = await getDocs(q);
      const exhibitions: any = [];
      querySnapshot.forEach((doc) => {
        exhibitions.push({ ...doc.data(), id: doc.id });
      });
      setExhibitions(exhibitions);
    };
    fetchData();
  }, []);

  return (
    <GroupExhibition
      title={title}
      description={description}
      exhibitions={exhibitions}
      dueDate={dueDate}
      type={type}
      layout={layout}
      hasMore={true}
    />
  );
};
export default PopularExhibition;
