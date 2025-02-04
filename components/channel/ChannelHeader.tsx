import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// data
import { getExhibitionListAll } from '@/api/firestore/getExhibitions';
import { Project } from '@/api/firestore/getProject';

// store
import { useProjectStore } from '@/store/project';

// utils
import { formatNumber } from '@/utils/utility';

// lib
import { useTranslation } from 'react-i18next';

// styles
import styled from '@emotion/styled';

// mui
import Button from '@mui/material/Button';

// icons
import exhibition from '@/images/svg/Shape.svg';
import subscriberSrc from '@/images/svg/Subscriber.svg';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import HomeIcon from '@mui/icons-material/Home';
import FacebookIcon from '@mui/icons-material/Facebook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Instagram, X } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import LaunchIcon from '@mui/icons-material/Launch';

type Props = { data?: any };

function ChannelHeader({ data }: Props) {
  const { t } = useTranslation();
  const { tier } = useProjectStore();
  const router = useRouter();
  const onClickGoPage = () => {
    window.open(`/${data?.projectUrl}/main`, '_blank');
  };

  return (
    <Container>
      <Top>
        <Left>
          <Avatar src={data?.thumbnail} />
          <Contents>
            <Title>{data?.title}</Title>
            <Info>
              <ExhibitionCount>
                <Image src={exhibition} alt={'exhibition'} />
                <span>
                  {t('Exhibitions')} {formatNumber(data?.exhibitions?.length)}{' '}
                </span>
              </ExhibitionCount>
              <Subscribers>
                <Image src={subscriberSrc} alt={'subscriber'} />
                <span>
                  {t('Views')} {formatNumber(data?.viewCount)}
                </span>
              </Subscribers>
              <LikeCount>
                <FavoriteBorderIcon />
                <span>
                  {t('Likes')} {formatNumber(data?.likeCount)}
                </span>
              </LikeCount>
            </Info>
            <Description>
              {data?.description}
              {/* <MoreButton>{'더보기 >'}</MoreButton> */}
            </Description>
            {data?.tier === 'business' && (
              <GoLink>
                <a href={`https://onthewall.io/${data?.projectUrl}/main`} target="_blank">
                  {`@${data?.projectUrl}`}
                </a>
              </GoLink>
            )}
          </Contents>
        </Left>
      </Top>
      <Bottom>
        <PlaceHolder></PlaceHolder>
        <Icons>
          {data?.instagram && (
            <a href={data?.instagram} target="_blank">
              <Instagram />
            </a>
          )}
          {data?.x && (
            <a href={data?.x} target="_blank">
              <X />
            </a>
          )}
          {data?.facebook && (
            <a href={data?.facebook} target="_blank">
              <FacebookIcon />
            </a>
          )}

          {data?.blog && (
            <a href={data?.blog} target="_blank">
              <RssFeedIcon />
            </a>
          )}
          {data?.homepage && (
            <a href={data?.homepage} target="_blank">
              <HomeIcon />
            </a>
          )}
          {data?.shop && (
            <a href={data?.shop} target="_blank">
              <ShoppingCartIcon />
            </a>
          )}
        </Icons>
      </Bottom>
    </Container>
  );
}

export default ChannelHeader;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Top = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;

  // mobile
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Bottom = styled.div`
  display: flex;
  width: 100%;
  margin-top: 12px;
  @media (max-width: 768px) {
    justify-content: center;
    padding-right: 10px;
  }
`;
const PlaceHolder = styled.div`
  width: 172px;
  // mobile
  @media (max-width: 768px) {
    display: none;
  }
`;

const Icons = styled.div`
  display: flex;
  gap: 22px;
`;
const Left = styled.div`
  display: flex;
  gap: 25px;
  // mobile
  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;
const Avatar = styled.img`
  width: 147px;
  height: 147px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 1px solid #e0e0e0;
`;

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  // mobile
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const Title = styled.div`
  font-size: 36px;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 20px;
    text-align: center;
  }
`;

const Info = styled.div`
  display: flex;
  margin-top: 12px;
  color: #6e7389;
  font-weight: 400;
  gap: 15px;
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const Subscribers = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  img {
    width: 18px;
    height: 18px;
  }
  span {
    font-size: 14px;
  }
  @media (max-width: 768px) {
    font-size: 14px;
    img {
      width: 16px;
      height: 16px;
    }
  }
`;

const ExhibitionCount = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  img {
    width: 18px;
    height: 18px;
  }
  span {
    font-size: 14px;
  }
  @media (max-width: 768px) {
    font-size: 14px;

    img {
      width: 16px;
      height: 16px;
    }
  }
`;

const LikeCount = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  svg {
    width: 18px;
    height: 18px;
  }
  span {
    font-size: 14px;
  }
  @media (max-width: 768px) {
    font-size: 14px;

    img {
      width: 16px;
      height: 16px;
    }
  }
`;

const Description = styled.div`
  font-size: 14px;
  margin-top: 12px;
  color: #6e7389;
  font-weight: 400;
  @media (max-width: 768px) {
    font-size: 14px;
    margin: 0 auto;
    margin-top: 10px;
    width: 90%;
  }
`;

const MoreButton = styled.span`
  font-size: 16px;
  cursor: pointer;
`;

const SubscribeButton = styled(Button)`
  border-radius: 25px;
  width: 131px;
  height: 50px;
  font-size: 16px;
  & svg {
    margin-right: 5px;
  }
  // mobile
  @media (max-width: 768px) {
    width: calc(100vw - 40px);
    height: 40px;
  }
`;

const GoLink = styled.div`
  margin-top: 7px;
  font-size: 15px;
  color: #115de6;
  font-weight: 700;
  a {
    display: flex;
    align-items: center;
    width: fit-content;
    gap: 5px;
    color: #115de6;
    cursor: pointer;
  }
  @media (max-width: 768px) {
    font-size: 16px;
    a {
      justify-content: center;
      gap: 3px;
      margin: 0 auto;
    }
  }
`;
