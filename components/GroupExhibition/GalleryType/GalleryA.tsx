import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// store
import { useToastStore } from '@/store/toast';
import { useMobileViewStore } from '@/store/mobile';

//lib
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTranslation } from 'next-i18next';

// utils
import { copyLink, redirect } from '@/utils/utility';

// styles
import { CardImage, CardThumb, CardTit, CardCount, CardNum, CardCountBox, ShareButton, CardTitle } from './styleA';

//icons
import ShareIcon from '@/images/svg/shareOne.svg';
import LikeIcon from '@/images/svg/likeImage.svg';
import ChatIcon from '@/images/svg/chatIcon.svg';
import ViewIcon from '@/images/svg/viewIcon.svg';

import styled from '@emotion/styled';

interface Props {
  exhibitions: Array<any>;
  hasMore?: boolean;
}

const GalleryA = ({ exhibitions, hasMore }: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();

  const [isLoading, setLoading] = useState<any>(true);

  const [skeletonLength, setSkeletonLength] = useState<number[]>(Array(3).fill(0));
  const [exhibitionData, setExhibitionData] = useState<any[]>([]);
  const [isMobileSize, setIsMobileSize] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileSize(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (exhibitions) {
      setExhibitionData(exhibitions);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [exhibitions]);

  return (
    <Box mobileView={mobileView}>
      {isLoading
        ? skeletonLength.map((_, idx) => (
            <SkeletonBox key={idx}>
              <Skeleton style={{ width: '100%' }} className="skeletonThumb" />
              <Skeleton width={100} height={15} />
              <Skeleton width={125} height={15} />
            </SkeletonBox>
          ))
        : (hasMore ? exhibitionData.slice(0, isMobileSize || mobileView ? 4 : 3) : exhibitionData).map(
            (exhibition: any, idx: number) => (
              <Container key={`${exhibition.id}-${idx}`}>
                <CardImage
                  mobileView={mobileView}
                  onClick={() => {
                    if (exhibition.type === 'link') {
                      window.open(exhibition.url);
                    } else {
                      redirect(exhibition.id);
                    }
                  }}
                >
                  <CardThumb>
                    <img
                      className="back_image"
                      src={
                        exhibition?.originalPosterImage?.url ||
                        exhibition.imageUrl ||
                        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                      }
                    />
                    <img
                      className={`front_image ${
                        exhibition?.originalPosterImage?.url ||
                        exhibition.imageUrl ||
                        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                          ? 'EmptyImage'
                          : ''
                      }`}
                      src={
                        exhibition?.originalPosterImage?.url ||
                        exhibition.imageUrl ||
                        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                      }
                    />
                  </CardThumb>
                </CardImage>
                <CardTitle>
                  <CardTit mobileView={mobileView}>{exhibition.title}</CardTit>
                  <ShareButton
                    mobileView={mobileView}
                    onClick={() => {
                      if (exhibition.type === 'link') {
                        copyLink(exhibition.url, 'External');
                        showToast();
                      } else {
                        copyLink(exhibition.id);
                        showToast();
                      }
                    }}
                  >
                    <Image src={ShareIcon} alt="Share" />
                    {mobileView ? '' : <span>{t('Share')}</span>}
                  </ShareButton>
                </CardTitle>
                {exhibition.type !== 'link' && (
                  <CardCountBox>
                    <CardCount>
                      <Image src={LikeIcon} alt="LikeIcon" />
                      <CardNum>{exhibition.like || 0}</CardNum>
                    </CardCount>
                    <CardCount>
                      <Image src={ChatIcon} alt="ChatIcon" />
                      <CardNum>{exhibition.commentCount || 0}</CardNum>
                    </CardCount>
                    <CardCount>
                      <Image src={ViewIcon} alt="ViewIcon" />
                      <CardNum>{exhibition.views?.totalView || 0}</CardNum>
                    </CardCount>
                  </CardCountBox>
                )}
              </Container>
            )
          )}
    </Box>
  );
};

export default GalleryA;

const Box = styled.div<{ mobileView?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.mobileView ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)')};
  gap: ${(props) => (props.mobileView ? '10px' : '20px')};
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const Container = styled.div`
  width: 100%;
  min-width: 100%;
  // mobile
  @media (max-width: 900px) {
    width: calc(50vw - 40px);
  }
`;

const SkeletonBox = styled.div`
  & .skeletonThumb {
    height: 250px;
  }
  @media (max-width: 768px) {
    & .skeletonThumb {
      height: 130px;
    }
  }
`;
