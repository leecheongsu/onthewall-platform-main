'use client';

import styled from '@emotion/styled';

import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/ko'; // 한국어 로케일 불러오기
import 'moment/locale/ja'; // 일본어 로케일 불러오기

type Props = {
  planData: any;
};

function PlanInfo({ planData }: Props) {
  const { i18n, t } = useTranslation();
  const router = useRouter();

  const PLAN_INFO = {
    free: {
      plan: t('Free plan'),
      upgrade: t('Personal Plan'),
      upgradeDescription: t('광고를 제거하고 더 많은 전시회를 사용할 수 있습니다😄'),
    },
    personal: {
      plan: t('Personal plan'),
      upgrade: t('Business Plan'),
      upgradeDescription: t('나만의 홈페이지와 더 많은 관리자를 제공합니다👍'),
    },
    business: {
      plan: t('Business plan'),
      upgrade: t('Enterprise Plan'),
      upgradeDescription: t('여러분의 플랫폼을 만들어보세요. 다양한 사용자가 회원가입을 할 수 있습니다.😎'),
    },
    enterprise: {
      plan: t('Enterprise plan'),
      upgrade: t('Enterprise Plan'),
      upgradeDescription: t('더 많은 전시회 이용하기😎'),
    },
    '': {
      plan: t('Free plan'),
      upgrade: t('Personal Plan'),
      upgradeDescription: t('커스텀 가능한 채널과 더 많은 전시회를 제공합니다😄'),
    },
  };

  const onClickUpgrade = () => {
    router.push('/account/payment/plan');
  };

  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    moment.locale(i18n.language); // i18n.language에 따라 로케일 설정
    return moment(date).format('LL'); // '2024년 9월 18일'
  };

  return (
    <PlanBox>
      <Plan>
        <PlanTag plan={planData.tier as any}>{(PLAN_INFO as any)[planData.tier].plan}</PlanTag>
        <ExhibitionCount>
          {t('Number of available exhibitions')}: {planData.exhibitionLimit}
        </ExhibitionCount>
        <PayDate>
          {t('Next payment due date')}: {formatDate(planData.expiredAt)}
        </PayDate>
      </Plan>
      <UpgradeContainer>
        <UpgradeContainerLeft>
          <UpgradeTitle>{(PLAN_INFO as any)[planData.tier].upgrade}</UpgradeTitle>
          <PlanDescription>{(PLAN_INFO as any)[planData.tier].upgradeDescription}</PlanDescription>
        </UpgradeContainerLeft>
        <UpgradeButton variant="contained" onClick={onClickUpgrade}>
          {' '}
          {t('Upgrade')}{' '}
        </UpgradeButton>
      </UpgradeContainer>
    </PlanBox>
  );
}

export default PlanInfo;

const PlanBox = styled.div`
  width: 100%;
  max-width: 1200px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #333;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 15px;
    font-size: 14px;
  }
`;

const Plan = styled.div`
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const UpgradeContainer = styled.div`
  max-width: 400px;
  gap: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
`;

const UpgradeTitle = styled.span`
  font-size: 20px;
  font-weight: 800;
`;
const UpgradeContainerLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 220px;
`;
const UpgradeButton = styled(Button)`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 800;
  border-radius: 20px;
`;

const PlanTag = styled.span<{ plan: 'free' | 'personal' | 'business' | 'enterprise' }>`
  font-size: 24px;
  border-radius: 5px;
  font-weight: 800;
`;

const PayDate = styled.span`
  font-size: 14px;
  color: #666;
`;

const PlanDescription = styled.div`
  font-size: 14px;
  color: #666;
  font-weight: 400;
  width: 230px;
  word-break: keep-all;
`;

const ExhibitionCount = styled.div`
  font-size: 16px;
  font-weight: 800;
  color: #666;
`;
