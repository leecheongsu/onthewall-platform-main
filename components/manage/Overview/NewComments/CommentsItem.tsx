import React from 'react';
import styled from '@emotion/styled';
import { Comment } from '@/type/Comment';
import moment from 'moment';
import { useProjectStore } from '@/store/project';
import { useTranslation } from 'react-i18next';
type Props = {
  data: Comment;
};

function CommentsItem({ data }: Props) {
  const { i18n, t } = useTranslation();
  const getDateText = (date: { _seconds: number }) => {
    const _date = new Date(date._seconds * 1000);
    return moment(_date).format('YYYY-MM-DD');
  };
  const onClickComment = () => {
    window.open(`https://art.onthewall.io/${data.channelId}`);
  };
  return (
    <Container onClick={onClickComment}>
      <Left>
        <Poster
          src={
            data.exhibition?.thumbnailPosterImage?.url ||
            'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
          }
          alt="cover"
        />
      </Left>
      <Right>
        <RightTop>
          <RightTxt>
            <Title>{data.exhibition?.title}</Title>
            {/* <Name>{`${data.name}님이 댓글을 남겼습니다.`}</Name> */}
            <Name>{t(`${data.name} has left a comment`)}</Name>
          </RightTxt>
          <DateDisplay>{getDateText(data.createdAt)}</DateDisplay>
        </RightTop>
        <Value>{data.value}</Value>
      </Right>
    </Container>
  );
}

export default CommentsItem;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
  max-height: 160px;
  cursor: pointer;
  transition: background-color 0.2s;

  scroll-snap-align: end; /* 스크롤 스냅의 기준점을 각 아이템의 시작으로 설정 */
  scroll-behavior: smooth; /* 스크롤 애니메이션을 부드럽게 설정 */
  &:hover {
    background-color: #f9fafb;
  }
  &:first-child {
    padding: 0 8px 8px 8px;
  }
`;

const Left = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 4px;
  justify-content: center;
  align-items: center;
  display: flex;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid #e2e8f0;
`;

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 4px;
  width: calc(100% - 76px);
  &:first-child {
    padding-top: 0;
  }
`;
const RightTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 10px;
`;

const RightTxt = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Name = styled.div`
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  width: 100%;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 1;
`;
const Value = styled.div`
  font-size: 14px;
  color: #4b5563;
  overflow: hidden;
  text-overflow: ellipsis;

  max-width: 100%;
  width: 100%;
  word-break: break-all;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
`;
const DateDisplay = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const Title = styled.p`
  font-size: 14px;
  color: #202224;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;
