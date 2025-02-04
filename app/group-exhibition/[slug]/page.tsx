'use client';

import React, { useEffect, useState } from 'react';
import { GroupExhibitionDocs } from '@/api/firestore/getGroupExhibitionList';
import GroupExhibition from '@/components/GroupExhibition';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PageProps {
  params: { slug: string };
}

const Page = ({ params }: PageProps) => {
  const { slug } = params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [exhibitions, setExhibitions] = useState([]);
  const [layout, setLayout] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GroupExhibitionDocs(slug);

        const exhibitions: any = await Promise.all(
          data?.exhibitions.map(async (exhibition: any) => {
            if (exhibition.type === 'onthewall') {
              const exhibitionDocRef = doc(db, 'Exhibition', exhibition.value);
              const exhibitionDoc = await getDoc(exhibitionDocRef);

              if (exhibitionDoc.exists()) {
                return {
                  ...exhibition,
                  ...exhibitionDoc.data(),
                  id: exhibitionDoc.id,
                };
              }
            }
            return exhibition;
          })
        );

        setTitle(data?.title);
        setDescription(data?.description);
        setExhibitions(exhibitions);
        setLayout(data?.layout);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <GroupExhibition
      title={title}
      description={description}
      exhibitions={exhibitions}
      layout={layout}
      hasMore={false}
    />
  );
};

export default Page;
