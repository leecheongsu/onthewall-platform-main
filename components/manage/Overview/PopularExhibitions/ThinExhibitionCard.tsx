import React from 'react';
import styled from '@emotion/styled';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
//icons
import ShareIcon from '@/images/icons/Share';
import LikeIcon from '@/images/icons/Like';
import ChatIcon from '@/images/icons/Chat';
import ViewIcon from '@/images/icons/View';

type Props = {
  data: any;
};

function ThinExhibitionCard({ data }: Props) {
  const { t } = useTranslation();
  const getDate = (date: { _seconds: number; _nanoseconds: number }) => {
    return moment.unix(date._seconds).format('YYYY-MM-DD');
  };
  const onClickShare = () => {
    const link = `https://art.onthewall.io/${data.id}`;
    navigator.clipboard.writeText(link);
    alert(t('Link copied to clipboard'));
  };
  const DUMMY_IMAGE =
    'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243';
  return (
    <ExhibitionItem key={data.id}>
      <Poster src={data.compressedPosterImage.url || DUMMY_IMAGE} />
      <Right>
        <Top>
          <Title>
            {data.title} {data.author && '| ' + data.author}
          </Title>
          <ShareButton onClick={onClickShare}>
            <ShareIcon className="lg:w-5 lg:h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-4 xs:h-4" />
          </ShareButton>
        </Top>
        <Bottom>
          <Details>
            <ViewIcon className="lg:w-5 lg:h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-4 xs:h-4" />
            {data.views.totalView} <ChatIcon className="lg:w-5 lg:h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-4 xs:h-4" />
            {data.commentsCount ??
              0} <LikeIcon className="lg:w-5 lg:h-5 md:w-4 md:h-4 sm:w-4 sm:h-4 xs:w-4 xs:h-4" /> {data.likes ?? 0}
          </Details>
          <CreatedAt>{getDate(data.createdAt)}</CreatedAt>
        </Bottom>
      </Right>
    </ExhibitionItem>
  );
}

export default ThinExhibitionCard;

const ExhibitionItem = styled.div`
  margin-top: 10px;
  display: flex;
  gap: 16px;
  padding: 0 10px 10px 10px;
  border-bottom: 1px solid #e0e0e0;
  height: 70px;
  &:last-child {
    border-bottom: none;
  }
`;
const Poster = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
`;

const Title = styled.p`
  margin-top: 5px;
  font-size: 16px;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  width: calc(100% - 76px);
`;
const Bottom = styled.div`
  display: flex;
  width: 100%;
  gap: 20px;
  justify-content: space-between;
`;
const Details = styled.div`
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 10px;
  align-items: center;
`;
const CreatedAt = styled.div`
  font-size: 12px;
  color: #888;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const ShareButton = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1px 2px 0 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background-color 0.3s;
  &:hover {
    background-color: #f0f0f0;
  }
`;
