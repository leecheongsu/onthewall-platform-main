import React, { useEffect, useState } from 'react';
import { Channel } from '@/type/Channel';
import styled from '@emotion/styled';
import { Avatar } from '@mui/material';
import subscriberSrc from '@/images/svg/Subscriber.svg';
import likeSrc from '@/images/svg/likeImage.svg';
import ChatSrc from '@/images/svg/Chat.svg';
import ViewSrc from '@/images/svg/viewIcon.svg';
import arrowRight from '@/images/svg/ArrowRight.svg';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import NumberComma from '@/utils/numberComma';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
type Props = {
  data: Channel;
};

function ChannelCard({ data }: Props) {
  const router = useRouter();
  const [channelData, setChannelData] = useState<any>();
  const onClickChannel = () => {
    router.push(`/channel/${data.projectUrl}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const projectDesignRef = doc(db, 'ProjectDesign', data.id);

      try {
        const docSnapshot = await getDoc(projectDesignRef);
        if (docSnapshot.exists()) {
          const docData = docSnapshot.data();
          setChannelData(docData.channelData);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching project design:', error);
      }
    };

    fetchData();
  }, [data]);

  return (
    <Container onClick={onClickChannel}>
      <Top>
        <Left>
          <Avatar src={channelData?.thumbnail} style={{ height: 50, width: 50 }} />
        </Left>
        <Right>
          <Title>{data?.channelName}</Title>
          <Subscribers>
            {/* <Image src={subscriberSrc} alt="subscriber icon" />
						{'구독자 '}
						{NumberComma(data.subscribers)}명 */}
            <Count>
              <Image src={likeSrc} alt="like icon" />
              {NumberComma(data.likeCount ?? 0)}
            </Count>
            <Count>
              <Image src={ChatSrc} alt="like icon" />
              {NumberComma(data.commentCount ?? 0)}
            </Count>
            <Count>
              <Image src={ViewSrc} alt="like icon" />
              {NumberComma(data.viewCount ?? 0)}
            </Count>
          </Subscribers>
        </Right>
      </Top>
      <Divider></Divider>
      <Bottom>
        <Description>{channelData?.description}</Description>
        <ImageButton src={arrowRight} alt="go channel icon" onClick={onClickChannel} />
      </Bottom>
    </Container>
  );
}

export default ChannelCard;

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 14.75px;
  border: 1px solid rgba(222, 222, 222, 0.7);
  background: #fff;
  /* box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25); */
  padding: 0 21px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  :hover {
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;
  }
  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const Top = styled.div`
  display: flex;
  padding: 24px 0px;
  gap: 20px;
  overflow: hidden;
  @media (max-width: 768px) {
    padding: 15px 0px;
  }
`;

const Divider = styled.div`
  opacity: 0.2;
  background: #0d163a;
  height: 1px;
`;

const Bottom = styled.div`
  padding: 24px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 768px) {
    padding: 15px 0px;
  }
`;

const Left = styled.div`
  margin-right: -5px;
  & .MuiAvatar-circular {
    border-radius: 50%;
    border: 1px solid #e0e0e0;
  }
`;

const Right = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Title = styled.p`
  font-size: 21px;
  font-weight: 700;
  color: #363636;
  line-height: 1.25;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Description = styled.div`
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 300;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Subscribers = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #64748b;
  font-weight: 400;

  & img {
    margin-right: 5px;
    margin-bottom: 2px;
  }
`;

const ImageButton = styled(Image)`
  cursor: pointer;
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;
