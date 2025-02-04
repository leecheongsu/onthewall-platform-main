import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// data
import { getExhibitionListAll } from '@/api/firestore/getExhibitions';
import { Project } from '@/api/firestore/getProject';

// store
import { useProjectStore } from '@/store/project';

// lib
import { useTranslation } from 'react-i18next';

// utils
import numberComma from '@/utils/numberComma';
import { formatNumber } from '@/utils/utility';

// styles
import styled from '@emotion/styled';

// icons
import people from '@/images/svg/people-plus-one.svg';
import view from '@/images/svg/play.svg';
import world from '@/images/svg/world.svg';
import shape from '@/images/svg/Shape.svg';
import likeSrc from '@/images/svg/likeImage.svg';
type Props = { data: any };

function Information({ data }: Props) {
  const { t } = useTranslation();
  const [projectData, setProjectData] = useState<any>(null);

  const DUMMY = {
    subscribe: Math.round(Math.random() * 100000),
    createdAt: new Date('2021-10-10'),
    national: 'ko-KR',
  };

  const getNational = () => {
    switch (DUMMY.national) {
      case 'ko-KR':
        return 'Korea';
      case 'en-US':
        return 'USA';
      case 'ja-JP':
        return 'Japan';
      case 'zh-CN':
        return 'China';
      default:
        return '기타';
    }
  };
  const generateDescription = () => {
    // DUMMY.description의 링크는 a 태그로 감싸준다. \n은 <br>로 바꿔준다.

    const description = data?.information?.split('\n').map((line: any, index: any) => {
      if (line.includes('https://')) {
        return (
          <a key={index} href={line} target="_blank" rel="noreferrer" style={{ color: 'blue' }}>
            {line}
          </a>
        );
      } else {
        return (
          <p key={index}>
            {line}
            <br />
          </p>
        );
      }
    });

    return description;
  };

  useEffect(() => {
    if (data) {
      const fetchProject = async () => {
        const res: any = await Project(data.id);

        setProjectData(res);
      };

      fetchProject();
    }
  }, [data]);

  return (
    <Container>
      <SectionHeader>{t('Information')}</SectionHeader>
      <InformationContainer>{generateDescription()}</InformationContainer>
      <Divider />
      <SectionHeader>{t('Details')}</SectionHeader>
      <InformationContainer2>
        <InformationItem>
          <Image src={shape} alt="exhibition" />
          <p>
            {t('Exhibitions')} {formatNumber(data.exhibitions.length)}
          </p>
        </InformationItem>
        <InformationItem>
          <Image src={likeSrc} alt="subscriber" />
          <p>
            {t('Likes')} {formatNumber(data?.likeCount)}
          </p>
        </InformationItem>
        <InformationItem>
          <Image src={view} alt="view" />
          <p>
            {t('Views')} {formatNumber(data?.viewCount)}
          </p>
        </InformationItem>
        <InformationItem>
          <Image src={people} alt="people" />
          <p>
            {t('Created At')} {projectData ? projectData.createdAt?.toDate().toLocaleDateString() : 'N/A'}
          </p>
        </InformationItem>
        <InformationItem>
          <Image src={world} alt="word" />
          <p>{getNational()}</p>
        </InformationItem>
      </InformationContainer2>
      {(data.instagram || data.x || data.blog || data.homepage || data.shop) && (
        <>
          <Divider />
          <SectionHeader>{t('Link')}</SectionHeader>
          <InformationContainer3>
            {data.instagram && (
              <LinkItem href={data.instagram} target="_blank" rel="noreferrer">
                {t('Instagram')}
              </LinkItem>
            )}
            {data.x && (
              <LinkItem href={data.x} target="_blank" rel="noreferrer">
                {t('X')}
              </LinkItem>
            )}
            {data.blog && (
              <LinkItem href={data.blog} target="_blank" rel="noreferrer">
                {t('Blog')}
              </LinkItem>
            )}
            {data.homepage && (
              <LinkItem href={data.homepage} target="_blank" rel="noreferrer">
                {t('Homepage')}
              </LinkItem>
            )}
            {data.shop && (
              <LinkItem href={data.shop} target="_blank" rel="noreferrer">
                {t('Shop')}
              </LinkItem>
            )}
          </InformationContainer3>
        </>
      )}
    </Container>
  );
}

export default Information;

const Container = styled.div`
  width: 100%;
  padding: 20px 0;
  padding-bottom: 100px;
  @media (max-width: 768px) {
    padding-bottom: 60px;
  }
`;

const SectionHeader = styled.div`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    margin-bottom: 10px;
    font-size: 18px;
  }
`;

const InformationContainer = styled.div`
  font-size: 16px;
  line-height: 1.5;
  padding: 44px 36px;
  border-radius: 10px;
  border: 1px solid var(--Neutral-40, #cbd4e1);
  font-weight: 400;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;
const InformationContainer2 = styled.div`
  font-size: 16px;
  line-height: 1.5;
  padding: 44px 0;
  border-radius: 10px;
  border: 1px solid var(--Neutral-40, #cbd4e1);
  display: flex;
  justify-content: space-between;

  // mobile
  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }
`;
const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: var(--Neutral-40, #cbd4e1);
  margin: 40px 0;
  @media (max-width: 768px) {
    margin: 25px 0;
  }
`;

const InformationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  border-right: 1px solid var(--Neutral-40, #cbd4e1);
  height: 40px;
  width: 100%;
  &:last-child {
    border-right: none;
  }
  p {
    font-size: 16px;
    line-height: 16px;
    font-weight: 300;
    margin-top: 1px;
  }
  img {
    width: 22px;
    height: 22px;
  }

  // mobile
  @media (max-width: 768px) {
    border-right: none;
    justify-content: space-between;
    gap: 10px;
    p {
      width: 100%;
      margin: 0;
      font-size: 14px;
    }
    img {
      width: 16px;
      height: 16px;
    }
  }
`;

const InformationContainer3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 40px;

  // mobile
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const LinkItem = styled.a`
  border-radius: 10px;
  border: 1px solid var(--Neutral-40, #cbd4e1);
  font-size: 16px;
  line-height: 1.5;
  color: var(--Primary-100, #1a1a1a);
  text-decoration: none;
  height: 85px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #64748b;
  font-weight: 300;
  padding-top: 4px;
  &:hover {
    text-decoration: underline;
  }
  @media (max-width: 768px) {
    font-size: 14px;
    padding-top: 0;
  }
`;
