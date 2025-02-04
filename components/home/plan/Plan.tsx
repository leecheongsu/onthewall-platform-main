import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// store
import { useLanguageStore } from '@/store/language';

// lib
import { useTranslation } from 'next-i18next';

// style
import styled from '@emotion/styled';

// mui
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// components
import PlanCard from '@/components/home/plan/PlanCard';
import PlanCompare from '@/components/home/plan/PlanCompare';

// icons
import notice from '@/images/svg/notice.svg';

interface Price {
  Free: string;
  Personal: string;
  Business: string;
  Enterprise: string;
  API: string;
}

type Props = {
  isModal?: boolean;
};

const Plan = ({ isModal }: Props) => {
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSubscription(newValue);
  };

  return (
    <Container isModal={isModal}>
      <Title>
        <MainTitle>{t('Flexible pricing, Plans for every levels')}</MainTitle>
        <SubTitle>{t("20% off annually. It's 1 years free")}</SubTitle>
      </Title>
      <SubscriptionTabs
        value={subscription}
        onChange={handleChange}
        TabIndicatorProps={{
          style: { display: 'none' },
        }}
      >
        <SubscriptionTab label={t('Monthly')} />
        <SubscriptionTab label={t('Annually')} />
      </SubscriptionTabs>
      <PlanCard subscription={subscription} isModal={isModal} />
      <NoticeText>
        <Image src={notice} alt="Notice" />
        <p>
          {t(
            'Onthewall. is registered for sales tax purposes in certain countries. As a result, depending on your location, a sales tax could be added to your final bill.'
          )}
        </p>
      </NoticeText>
      <PlanCompare />
    </Container>
  );
};

export default Plan;

const Container = styled.div<{ isModal?: boolean }>`
  width: ${(props) => (props.isModal ? '100%' : '1200px')};
  margin: 20px auto;
  padding: ${(props) => (props.isModal ? '20px' : '0 20px')};
  overflow-y: ${(props) => (props.isModal ? 'auto' : 'hidden')};
  height: ${(props) => (props.isModal ? '100%' : 'auto')};
  // 스크롤바 색상변경
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #dbdbdb;
    border-radius: 10px;
    width: 1px;
  }
  &::-webkit-scrollbar-track {
    background-color: #fff;
    width: 0px;
  }
  @media (max-width: 1200px) {
    width: 100%;
  }
  @media (max-width: 768px) {
    width: 100%;
    padding: 0px;
    margin: 0;
  }
`;
const Title = styled.div`
  text-align: center;
  @media (max-width: 768px) {
  }
`;

const MainTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    line-height: 1.25;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
`;

const SubTitle = styled.p`
  font-size: 1rem;
  color: #88909c;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const SubscriptionTabs = styled(Tabs)`
  & .MuiTabs-flexContainer {
    justify-content: center;
    gap: 20px;
  }
`;

const SubscriptionTab = styled(Tab)`
  padding: 10px 30px;
  min-height: auto;
  text-transform: capitalize;
  font-size: 1rem;
  &.Mui-selected {
    color: #115de6;
    border: 1px solid #115de6;
    border-radius: 25px;
    font-weight: 600;
  }
`;

const NoticeText = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 100px;
  & img {
    width: 12px;
    height: 12px;
  }
  & p {
    font-size: 0.85rem;
    color: #94a3b8;
  }
  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;
