'use client';

//react
import { useEffect, useState } from 'react';

// lib
import Skeleton from 'react-loading-skeleton';

//style
import styled from '@emotion/styled';

//swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/swiper-bundle.css';

import { useDesignStore } from '@/store/design';
import { useMobileViewStore } from '@/store/mobile';

interface Props {
  bannerData: any;
}

const Banner = ({ bannerData }: Props) => {
  const { mobileView } = useMobileViewStore();
  const [imageUrl, setImageUrl] = useState(bannerData.desktop.url);
  const [loading, setLoading] = useState(true);

  const handleResize = () => {
    if (window.innerWidth <= 768 || mobileView) {
      setImageUrl(bannerData?.mobile?.url || bannerData.desktop.url);
    } else {
      setImageUrl(bannerData.desktop.url);
    }
  };

  useEffect(() => {
    if (bannerData) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [bannerData, mobileView]);

  return (
    // 임시 배너 없어질 예정
    <SwiperBox mobileView={mobileView} hasLink={bannerData.hasLink}>
      {loading ? (
        <Skeleton height={200} />
      ) : (
        <img
          src={imageUrl}
          onClick={() => bannerData.hasLink && window.open(`${bannerData.linkUrl}`)}
          className="banner_image"
        />
      )}
    </SwiperBox>
    // 슬라이드 되는 원본 배너 2차에 살릴꺼임
    // <SwiperBox>
    // 	<Swiper spaceBetween={30} centeredSlides={true} modules={[Autoplay]} className="swiper">
    // 		{bannerData?.desktop?.url.map((data: any, i: any) => {
    // 			return (
    // 				<SwiperSlide key={`${data}_${i}`} className="swiper_slide">
    // 					<img
    // 						src={data}
    // 						onClick={() => bannerData.hasLink && window.open(`${bannerData.linkUrl}`)}
    // 					/>
    // 				</SwiperSlide>
    // 			);
    // 		})}
    // 	</Swiper>
    // </SwiperBox>
  );
};

export default Banner;

const SwiperBox = styled.div<{ mobileView?: boolean; hasLink: boolean }>`
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  /* height: ${(props) => (props.mobileView ? 'auto' : '200px')}; */
  height: ${(props) => (props.mobileView ? 'auto' : 'auto')};
  overflow: hidden;
  & .swiper {
    width: 100%;
    height: 100%;
  }
  & .swiper_slide {
    text-align: center;
    font-size: 18px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    object-position: center;
    cursor: ${(props) => (props.hasLink ? 'pointer' : 'default')};
    border-radius: 5px;
    @media (max-width: 768px) {
      height: auto;
    }
  }
`;
