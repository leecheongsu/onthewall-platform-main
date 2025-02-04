'use client';
// react
import React, { useEffect, useState } from 'react';

// data
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// store
import { useToastStore } from '@/store/toast';

// api
import { getSection } from '@/api/firestore/getSection';

// lib
import { useTranslation } from 'react-i18next';

// styles
import styled from '@emotion/styled';

// comp
import Total from '@/components/GroupExhibition/Total';
import GroupExhibition from '@/components/GroupExhibition';
import Banner from '@/components/Banner';
import Video from '@/components/Video';
import Blank from '@/components/Blank';
import LinkToast from '@/components/LinkToast';

// icons
import UpIcon from '@/images/icons/Up';
import { useProjectStore } from '@/store/project';
import { platformManageApis } from '@/api/platform';

interface Props {
  projectUrl: string;
  data: any;
}

const Section = ({ projectUrl }: Props) => {
  const { t } = useTranslation();
  const { updateInfo } = useProjectStore();
  const [projectDesign, setProjectDesign] = useState<any>(null);

  // 스크롤 최상단으로 이동
  const scrollUp = () => {
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      const res = await platformManageApis.getProjectByProjectUrl(projectUrl);
      const apiRes = res.data as ApiResponse;
      if (apiRes.meta.ok) {
        const sections: any = await getSection(apiRes.data.id);
        const updatedSections = await Promise.all(
          sections.map(async (section: any) => {
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

        updateInfo('projectId', apiRes.data.id);
        setProjectDesign(updatedSections);
      }
    } catch (error) {
      console.error('Error fetching section: ', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container>
      {projectDesign?.length !== 0 ? (
        projectDesign
          ?.sort((a: any, b: any) => a.order - b.order)
          ?.map((section: any, idx: number) => {
            if (section.type === 'BANNER') {
              return (
                <Wrapper key={idx}>
                  <Banner key={idx} bannerData={section} />
                </Wrapper>
              );
            }
            if (section.type === 'BLANK') {
              return (
                <Wrapper key={idx}>
                  <Blank key={idx} isMain={true} data={section} />
                </Wrapper>
              );
            }
            if (section.type === 'GROUP_EXHIBITION') {
              return (
                <Wrapper key={idx}>
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
            if (section.type === 'VIDEO') {
              return (
                <Wrapper key={idx}>
                  <Video key={idx} video={section.videoUrl} />
                </Wrapper>
              );
            }
            return null;
          })
      ) : (
        <div className="text-left">{t('No Project data')}</div>
      )}
      <Total />
      <LinkToast />
      <div className="btn_top" onClick={scrollUp}>
        <UpIcon className="w-5 h-5" />
      </div>
    </Container>
  );
};

export default Section;

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding-bottom: 60px;
`;

const Wrapper = styled.div`
  display: inline-block;
  width: 100%;
  @media (max-width: 900px) {
  }
`;
