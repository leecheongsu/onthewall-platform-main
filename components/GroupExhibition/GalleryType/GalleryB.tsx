import React, { use, useEffect, useState } from 'react';
import Image from 'next/image';

// store
import { useToastStore } from '@/store/toast';
import { useMobileViewStore } from '@/store/mobile';
// lib
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTranslation } from 'next-i18next';

// utils
import { copyLink, redirect } from '@/utils/utility';

// styles
import {
  Box,
  CardImage,
  ShareButton,
  CardThumb,
  CardTxt,
  CardTitle,
  CardCountBox,
  CardCount,
  CardNum,
  InnerBox,
} from './styleBC';
import styled from '@emotion/styled';

// mui
import Hidden from '@mui/material/Hidden';

// icons
import ShareIcon from '@/images/svg/shareOne.svg';
import LikeIcon from '@/images/svg/likeImage.svg';
import ChatIcon from '@/images/svg/chatIcon.svg';
import ViewIcon from '@/images/svg/viewIcon.svg';

interface Props {
  exhibitions: any;
}

const GalleryB = ({ exhibitions }: Props) => {
  const showToast = useToastStore((state) => state.showToast);
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const [isLoading, setLoading] = useState<any>(true);
  const [skeletonLength, setSkeletonLength] = useState<number[]>(Array(2).fill(0));
  const [isHome, setIsHome] = useState<boolean>(false);

  useEffect(() => {
    if (exhibitions) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [exhibitions]);

  useEffect(() => {
    if (window.location.pathname === '/home') {
      setIsHome(true);
    }
  }, []);

  return (
    <Box mobileView={mobileView}>
      {isLoading ? (
        skeletonLength.map((_, idx) => (
          <SkeletonBox key={idx}>
            <Skeleton style={{ width: '100%' }} className="skeletonThumb" />
            <Skeleton width={100} height={15} />
            <Skeleton width={125} height={15} />
          </SkeletonBox>
        ))
      ) : (
        <>
          <Wrap mobileView={mobileView}>
            <Hidden mdDown>
              {exhibitions.slice(0, 1).map((exhibition: any, idx: number) => {
                return (
                  <CardImage key={idx} className="GalleryB_Big" isHome={isHome}>
                    <ShareButton
                      className="share_btn"
                      mobileView={mobileView}
                      isHome={isHome}
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
                    <CardThumb
                      isHome={isHome}
                      onClick={() => {
                        if (exhibition.type === 'link') {
                          window.open(exhibition.url);
                        } else {
                          redirect(exhibition.id);
                        }
                      }}
                    >
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
                    <CardTxt className="card_txt" isHome={isHome}>
                      <>
                        <CardTitle mobileView={mobileView}>{exhibition.title}</CardTitle>
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
                      </>
                    </CardTxt>
                  </CardImage>
                );
              })}
            </Hidden>
          </Wrap>
          <InnerBox>
            {exhibitions.slice(1, 5).map((exhibition: any, idx: number) => {
              return (
                <CardImage key={idx} isHome={isHome}>
                  <ShareButton
                    className="share_btn"
                    mobileView={mobileView}
                    isHome={isHome}
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
                    <Image src={ShareIcon} alt="ShareIcon" />
                    {mobileView ? '' : <span>{t('Share')}</span>}
                  </ShareButton>
                  <CardThumb
                    isHome={isHome}
                    onClick={() => {
                      if (exhibition.type === 'link') {
                        window.open(exhibition.url);
                      } else {
                        redirect(exhibition.id);
                      }
                    }}
                  >
                    <img
                      className="front_image"
                      src={
                        exhibition?.originalPosterImage?.url ||
                        exhibition?.imageUrl ||
                        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                      }
                    />
                  </CardThumb>
                  <CardTxt className="card_txt" isHome={isHome}>
                    <>
                      <CardTitle mobileView={mobileView}>{exhibition.title}</CardTitle>
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
                    </>
                  </CardTxt>
                </CardImage>
              );
            })}
          </InnerBox>
        </>
      )}
    </Box>
  );
};

export default GalleryB;

const Wrap = styled.div<{ mobileView?: boolean }>`
  display: ${(props) => (props.mobileView ? 'none' : 'flex')};
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
