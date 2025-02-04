import React, { useState, useEffect } from 'react';

// data
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// store
import { useMobileViewStore } from '@/store/mobile';

// lib
import { useTranslation } from 'react-i18next';

// styles
import styled from '@emotion/styled';

// icons
import RightIcon from '@/images/icons/Right';

// components
import ChannelCards from '@/components/channel/ChannelCards';
import { useLanguageStore } from '@/store/language';

type Props = { title?: string; description?: string; type?: string; channel: any; hasShuffle?: boolean };
const GroupChannel = ({ title, description, type, channel, hasShuffle }: Props) => {
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const { language } = useLanguageStore();

  const [hasMore, setMore] = useState(false);

  // 추후 그룹채널이 생기면 사라질 예정
  const [tempData, setTempData] = useState<any>({});

  const fetchTempChannels = async () => {
    const p1 = getDoc(doc(db, 'Project', 'V33nOHv9AI5UZmoIKBhK'));
    const p2 = getDoc(doc(db, 'ProjectDesign', 'V33nOHv9AI5UZmoIKBhK'));
    const p3 = getDoc(doc(db, 'Project', 'vFAOJMBry4mfx7hbPjDC'));
    const p4 = getDoc(doc(db, 'ProjectDesign', 'vFAOJMBry4mfx7hbPjDC'));
    const p5 = getDoc(doc(db, 'Project', 'yvCwWXArEjsGHVa1C3D9'));
    const p6 = getDoc(doc(db, 'ProjectDesign', 'yvCwWXArEjsGHVa1C3D9'));

    const res = await Promise.all([p1, p2, p3, p4, p5, p6]);
    const channels = [
      { ...res[0].data(), ...res[1].data()!.channelData },
      { ...res[2].data(), ...res[3].data()!.channelData },
      { ...res[4].data(), ...res[5].data()!.channelData },
    ];
    return channels;
  };

  const moreUrl = (type?: string) => {
    switch (type) {
      case 'RECENT_CHANNEL':
        return '/recent-channel';
      default:
        return '/';
    }
  };

  const initialize = () => {
    setMore(['/recent-channel', '/popular-channel'].some((path) => window.location.pathname.includes(path)));
  };

  // 이것도 그룹채널이 생긴다면 사란질 예정
  useEffect(() => {
    if (channel !== undefined) {
      initialize();
    } else {
      fetchTempChannels().then((res) => {
        setTempData({
          title: t('이 달의 추천 채널'),
          description: t('ONTHEWALL 마케터가 엄선한 이 달의 추천 채널!'),
          type: 'GROUP_CHANNEL',
          channel: res,
          shuffle: false,
        });
      });
    }
  }, [channel, language]);

  return (
    <Wrapper>
      <SectionTop>
        <div>
          <SectionTitle mobileView={mobileView}>
            <h3>{channel ? title : tempData.title}</h3>
            {!hasMore && channel?.length > 3 && (
              <a href={moreUrl(type)}>
                {hasMore ? null : (
                  <More>
                    {t('more')}
                    <RightIcon className="w-3 h-3" />
                  </More>
                )}
              </a>
            )}
          </SectionTitle>
          <SectionDesc mobileView={mobileView}>{channel ? description : tempData.description}</SectionDesc>
        </div>
      </SectionTop>
      <ChannelCards channel={channel ? channel : tempData.channel} hasMore={hasMore} hasShuffle={hasShuffle} />
    </Wrapper>
  );
};
export default GroupChannel;

const Wrapper = styled.div`
  /* margin: 80px 0;
	@media (max-width: 900px) {
		margin-bottom: 40px;
	} */
  width: 100%;
  padding-bottom: 40px;
`;

const SectionTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  & > div {
    width: 100%;
  }
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
  line-height: 1;
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
  word-break: keep-all;
  flex: 1;
  & svg {
    margin-left: 5px;
  }
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const Box = styled.div<{ mobileView?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.mobileView ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)')};
  gap: ${(props) => (props.mobileView ? '10px' : '20px')};
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;
