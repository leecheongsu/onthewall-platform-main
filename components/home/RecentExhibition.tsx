import React, { useEffect, useState } from 'react';

// api
import { getExhibitions } from '@/api/firestore/getExhibitions';

// lib
import { useTranslation } from 'react-i18next';

// components
import GroupExhibition from '../GroupExhibition';

type Props = {};
const RecentExhibition = ({}: Props) => {
  const { t } = useTranslation();
  const title = t('Recent Exhibition');
  const description = t('Come see trendy works in the ongoing');
  const type = 'RECENT_EXHIBITION';
  const layout = 'GalleryC';

  const [exhibitions, setExhibitions] = useState([]);

  const fetchData = async () => {
    await getExhibitions().then((data: any) => {
      data.sort((a: any, b: any) => {
        return b.createdAt - a.createdAt;
      });
      setExhibitions(data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <GroupExhibition
      title={title}
      description={description}
      type={type}
      exhibitions={exhibitions}
      layout={layout}
      hasMore={true}
    />
  );
};
export default RecentExhibition;
