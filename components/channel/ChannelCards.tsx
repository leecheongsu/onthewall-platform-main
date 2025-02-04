import React, { useEffect, useState } from 'react';
import ChannelCard from './ChannelCard';
import { Channel } from '@/type/Channel';
import styled from '@emotion/styled';
import { useMobileViewStore } from '@/store/mobile';

type Props = {
  channel: Channel[];
  hasMore?: boolean;
  hasShuffle?: boolean;
};

function ChannelCards({ channel, hasMore, hasShuffle }: Props) {
  const { mobileView } = useMobileViewStore();
  const [shuffledData, setShuffledData] = useState<Channel[]>([]);

  function shuffleArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }

  useEffect(() => {
    if (channel) {
      if (hasShuffle) {
        setShuffledData(shuffleArray(channel));
      } else {
        const sortedData = [...channel].sort((a: any, b: any) => {
          return b.createdAt - a.createdAt || 0;
        });
        setShuffledData(sortedData);
      }
    }
  }, [channel, hasShuffle]);

  return (
    <Container mobileView={mobileView}>
      {hasMore
        ? shuffledData.map((card, idx) => <ChannelCard data={card} key={idx} />)
        : shuffledData.slice(0, 3).map((card, idx) => <ChannelCard data={card} key={idx} />)}
    </Container>
  );
}

export default ChannelCards;

const Container = styled.div<{ mobileView?: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: ${(props) => (props.mobileView ? '1fr' : 'repeat(3, 1fr)')};
  gap: ${(props) => (props.mobileView ? '10px' : '20px')};
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
