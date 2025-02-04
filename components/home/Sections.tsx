import React, { useState, useEffect } from 'react';

// data
import { db } from '@/lib/firebase';
import { doc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';

// styles
import styled from '@emotion/styled';

import Banner from '../Banner';
import Video from '@/components/Video';
import Blank from '@/components/Blank';
import GroupExhibition from '@/components/GroupExhibition';
import GroupChannel from '@/components/GroupChannel';
import RecentExhibition from '@/components/home/RecentExhibition';
import RecentChannel from '@/components/home/RecentChannel';
import PopularExhibition from '@/components/home/PopularExhibition';

// icons
import UpIcon from '@/images/icons/Up';

import { KEY } from '@/constants/globalDesign';

type Props = {};

function Section({}: Props) {
  const { t } = useTranslation();
  const [globalDesign, setGlobalDesign] = useState<any>(null);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchData = async () => {
      const onthewallDocRef = doc(collection(db, 'GlobalDesign'), KEY);
      const sectionCollectionRef = collection(onthewallDocRef, 'Section');

      const q1 = query(sectionCollectionRef, where('isDeleted', '==', false));
      const snapshot = await getDocs(q1);
      const sections = snapshot.docs.map((doc) => doc.data());

      const updatedSections = await Promise.all(
        sections.map(async (section) => {
          if (section.exhibitions && Array.isArray(section.exhibitions)) {
            const exhibitionsData = await Promise.all(
              section.exhibitions.map(async (exhibition: any) => {
                if (exhibition.type === 'onthewall') {
                  const exhibitionDocRef = doc(db, 'Exhibition', exhibition.value);
                  const exhibitionDoc = await getDoc(exhibitionDocRef);

                  if (exhibitionDoc.exists()) {
                    return {
                      ...exhibitionDoc.data(),
                      type: exhibition.type,
                      value: exhibition.value,
                      id: exhibition.value,
                    };
                  }
                }
                return {
                  type: exhibition.type,
                  imageUrl: exhibition.imageUrl,
                  title: exhibition.title,
                  url: exhibition.url,
                };
              })
            );

            return {
              ...section,
              exhibitions: exhibitionsData.filter((exhibition) => exhibition !== null),
            };
          }
          return section;
        })
      );

      setGlobalDesign(updatedSections);
    };

    fetchData();
  }, []);

  return (
    <Container>
      {globalDesign?.length !== 0 ? (
        globalDesign
          ?.sort((a: any, b: any) => a.order - b.order)
          ?.map((section: any, idx: number) => {
            if (section.type === 'BANNER') {
              return (
                <Wrapper key={section.id}>
                  <Banner key={idx} bannerData={section} />
                </Wrapper>
              );
            }
            if (section.type === 'VIDEO') {
              return (
                <Wrapper key={section.id}>
                  <Video key={idx} video={section.videoUrl} />
                </Wrapper>
              );
            }
            if (section.type === 'BLANK') {
              return (
                <Wrapper key={section.id}>
                  <Blank key={idx} isMain={true} data={section} />
                </Wrapper>
              );
            }
            if (section.type === 'GROUP_EXHIBITION') {
              return (
                <Wrapper key={section.id}>
                  <GroupExhibition
                    key={idx}
                    title={section.title}
                    description={section.description}
                    exhibitions={section.exhibitions}
                    dueDate={section.dueDate}
                    type={section.type}
                    layout={section.layout}
                    id={section.id}
                    hasMore={true}
                  />
                </Wrapper>
              );
            }
            if (section.type === 'GROUP_CHANNEL') {
              return (
                <Wrapper key={section.id}>
                  <GroupChannel
                    key={idx}
                    title={section.title}
                    description={section.description}
                    channel={section.channel}
                    type={section.type}
                    hasShuffle={true}
                  />
                </Wrapper>
              );
            }
            if (section.type === 'RECENT_EXHIBITION') {
              return (
                <Wrapper key={section.id}>
                  <RecentExhibition key={idx} />
                </Wrapper>
              );
            }
            if (section.type === 'RECENT_CHANNEL') {
              return (
                <Wrapper key={section.id}>
                  <RecentChannel key={idx} />
                </Wrapper>
              );
            }

            if (section.type === 'POPULAR_EXHIBITION') {
              return (
                <Wrapper key={section.id}>
                  <PopularExhibition key={idx} dueDate={section.dueDate} type={section.type} layout={section.layout} />
                </Wrapper>
              );
            }

            return null;
          })
      ) : (
        <div className="text-left">{t('No Project data')}</div>
      )}

      <div className="btn_top" onClick={scrollUp}>
        <UpIcon className="w-5 h-5" />
      </div>
    </Container>
  );
}

export default Section;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
  @media (max-width: 900px) {
  }
`;
