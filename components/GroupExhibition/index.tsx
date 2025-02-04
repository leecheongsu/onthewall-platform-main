import React, { useEffect, useState, useMemo } from 'react';

// store
import { useTranslation } from 'react-i18next';
import { useMobileViewStore } from '@/store/mobile';
import { useProjectStore } from '@/store/project';

// lib
import styled from '@emotion/styled';
import LinkToast from '@/components/LinkToast';
import RightIcon from '@/images/icons/Right';

// components
import GalleryA from './GalleryType/GalleryA';
import GalleryB from './GalleryType/GalleryB';
import GalleryC from './GalleryType/GalleryC';

type Props = {
  title?: string;
  description?: string;
  exhibitions: any;
  dueDate?: string;
  type?: string;
  layout?: string;
  id?: string;
  hasMore?: boolean;
};
const GroupExhibition = ({ title, description, type, exhibitions, layout, id, dueDate, hasMore = false }: Props) => {
  const { t } = useTranslation();
  const { projectUrl } = useProjectStore();
  const { mobileView } = useMobileViewStore();

  const moreUrl = (type?: string, id?: string, dueDate?: string) => {
    switch (type) {
      case 'GROUP_EXHIBITION':
        return projectUrl ? `/${projectUrl}/group-exhibition/${id}` : `/group-exhibition/${id}`;
      case 'RECENT_EXHIBITION':
        return '/recent-exhibition';
      case 'POPULAR_EXHIBITION':
        return `/popular-exhibition?dueDate=${dueDate}`;
      default:
        return '/';
    }
  };

  return (
    <Wrapper>
      <SectionTop>
        <SectionTitle mobileView={mobileView}>
          <h3>{title}</h3>
          {exhibitions?.length > 3 && (
            <a href={moreUrl(type, id, dueDate)}>
              {hasMore ? (
                <More>
                  {t('more')}
                  <RightIcon className="w-3 h-3" />
                </More>
              ) : null}
            </a>
          )}
        </SectionTitle>
        <SectionDesc mobileView={mobileView}>{description}</SectionDesc>
      </SectionTop>
      {layout === 'GalleryA' && <GalleryA exhibitions={exhibitions} hasMore={hasMore} />}
      {layout === 'GalleryB' && <GalleryB exhibitions={exhibitions} />}
      {layout === 'GalleryC' && <GalleryC exhibitions={exhibitions} hasMore={hasMore} />}
      <LinkToast />
    </Wrapper>
  );
};
export default GroupExhibition;

const Wrapper = styled.div`
  width: 100%;
  padding-bottom: 40px;
`;

const SectionTop = styled.div`
  margin-bottom: 20px;
  @media (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

const SectionTitle = styled.div<{ mobileView?: boolean }>`
  font-size: ${(props) => (props.mobileView ? '1.25rem' : '1.5rem')};
  font-weight: 700;
  color: #363636;
  line-height: 1.25;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  & h3 {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const SectionDesc = styled.div<{ mobileView?: boolean }>`
  font-size: ${(props) => (props.mobileView ? '0.875rem' : '1rem')};
  line-height: 1.25;
  word-break: keep-all;
  color: #94a3b8;
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const More = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  color: #94a3b8;
  flex: 1;
  word-break: keep-all;
  & svg {
    margin-left: 5px;
  }
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;
