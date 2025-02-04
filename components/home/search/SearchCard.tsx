import React from 'react';

// style
import styled from '@emotion/styled';

const SearchCard: React.FC<{ hit: any; components?: any }> = ({ hit }) => {
  return (
    <Card
      className="search-card"
      onClick={() => {
        window.open(`https://art.onthewall.io/${hit.objectID}`, '_blank');
      }}
    >
      <Thumbnail>
        <Image>
          <img
            src={
              hit.thumbnailPosterImage.url ||
              'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
            }
            alt=""
          />
        </Image>
      </Thumbnail>
      <Text>
        <Title>{hit.title}</Title>
        <Name>{hit.channelName || 'ONTHEWALL'}</Name>
      </Text>
    </Card>
  );
};

export default SearchCard;

const Card = styled.div`
  border: 1px solid #eeeeee;
  border-radius: 5px;
  overflow: hidden;
  cursor: pointer;
`;

const Thumbnail = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 70%;
  position: relative;
`;

const Image = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  border: 1px solid #eee;
  border-radius: 5px;
  height: 100%;
  display: flex;
  overflow: hidden;
  position: absolute;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Text = styled.div`
  padding: 15px;
`;

const Title = styled.p`
  font-size: 16px;
  font-weight: 600;
  word-break: break-all;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  color: #212121;
`;

const Name = styled.div`
  font-size: 12px;
  color: #999;
`;
