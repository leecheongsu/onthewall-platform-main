'use client';
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import Banner from '@/components/Banner';
import EmptySpace from '@/common/EmptySpace';
import ChannelHeader from '@/components/channel/ChannelHeader';
import Tabs from '@/components/channel/Tabs';
import ExhibitionList from '@/components/channel/ExhibitionList';
import Information from '@/components/channel/Information';

import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, getDoc, doc } from 'firebase/firestore';

type Props = {};

function page({}: Props) {
  const [tab, setTab] = React.useState(0);
  const { t } = useTranslation();
  const param = useParams<{ projectUrl: string }>();
  const router = useRouter();
  const [data, setData] = React.useState({
    bannerData: { desktop: { url: '' }, mobile: { url: '' } },
    description: '',
    blog: '',
    facebook: '',
    homepage: '',
    information: '',
    instagram: '',
    shop: '',
    thumbnail:
      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
    title: '',
    x: '',
    id: '',
    exhibitions: [],
  });

  useEffect(() => {
    getDocs(query(collection(db, 'Project'), where('projectUrl', '==', param!.projectUrl))).then((snap) => {
      if (snap.size > 0) {
        const projData = snap.docs[0].data();

        if (projData.tier === 'free') return router.push('/home');
        if (projData.tier === 'enterprise') return router.push('/home');

        getDoc(doc(db, 'ProjectDesign', snap.docs[0].id)).then((snap2) => {
          const data = snap2.data()?.channelData;
          console.log(data, 'data');

          if (!data) return router.push('/home');
          setData((prev) => ({
            ...prev,
            id: snap.docs[0].id,
            projectUrl: param!.projectUrl,
            viewCount: projData.viewCount,
            likeCount: projData.likeCount,
            commentCount: projData.commentCount,
            bannerData: {
              desktop: {
                url:
                  data?.bannerData?.desktop?.url ??
                  'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
              },
              mobile: {
                url:
                  data?.bannerData?.mobile?.url ??
                  'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
              },
            },
            description: data.description ?? '',
            blog: data.blog ?? '',
            facebook: data.facebook ?? '',
            homepage: data.homepage ?? '',
            information: data.information ?? '',
            instagram: data.instagram ?? '',
            shop: data.shop ?? '',
            thumbnail:
              data.thumbnail ||
              'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
            title: projData.channelName ?? 'Untitled',
            x: data.x ?? '',
          }));
        });

        const q1 = query(
          collection(db, 'Exhibition'),
          where('projectId', '==', snap.docs[0].id),
          where('status', '==', 'published'),
          where('isHidden', '==', false),
          where('isDeleted', '==', false),
          orderBy('publishedAt', 'desc')
        );
        getDocs(q1).then((snapshot) => {
          const exhibitions = [] as any;
          snapshot.forEach((doc) => {
            exhibitions.push({ value: doc.id, type: 'onthewall' });
          });

          setData((prev) => ({ ...prev, exhibitions, tier: projData.tier }));
        });
      }
    });
  }, []);

  return (
    <Container>
      <EmptySpace height={50} />
      <Banner bannerData={data.bannerData} />
      <EmptySpace height={40} />
      <ChannelHeader data={data} />
      <EmptySpace height={50} />
      <Tabs value={tab} setValue={setTab} />
      {/* <EmptySpace height={60} /> */}
      {tab === 0 ? <ExhibitionList data={data} /> : <Information data={data} />}
    </Container>
  );
}

export default page;

const Container = styled.div`
  height: 100%;
  width: 100%;
`;
