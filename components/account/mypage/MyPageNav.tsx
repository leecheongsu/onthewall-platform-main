import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Chevron from '@/images/icons/Chevron';
// import ChevronActive from '@/images/icons/ChevronActive';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { useDesignStore } from '@/store/design';
import { useTranslation } from 'react-i18next';

type Props = {};

const DefaultTabs = [
  { name: 'Login Info', path: 'login-info' },
  { name: 'User Info', path: 'user-info' },
  { name: 'Subscribe', path: 'subscribe' },
  { name: 'Payments', path: 'payments' },
  { name: 'Settings', path: 'settings' },
];
function MyPageNav({}: Props) {
  const { projectUrl, projectId } = useProjectStore((state) => state);
  const { theme } = useDesignStore((state) => state);
  const { projectsMap, status } = useUserStore((state) => state);
  const { t } = useTranslation();
  const router = useRouter();

  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState(searchParams?.get('tab'));
  const [tabList, setTabList] = useState(DefaultTabs);

  useEffect(() => {
    if (!window) return;
    const tab = searchParams?.get('tab') ?? 'login-info';
    router.push(`/${projectUrl}/account/my-page?tab=${tab}`);
    setCurrentTab(tab);
  }, []);

  useEffect(() => {
    if (status === 'superadmin' || projectsMap[projectId].status === 'owner') {
      setTabList(DefaultTabs);
    } else {
      setTabList([DefaultTabs[0], DefaultTabs[1], DefaultTabs[4]]);
    }
  }, [projectsMap, projectId]);

  const onClickTab = (tab: string) => {
    router.push(`/${projectUrl}/account/my-page?tab=${tab}`);
    setCurrentTab(tab);
  };

  const onClickBack = () => {
    router.push(`/${projectUrl}/manage`);
  };
  return (
    <Container count={tabList.length}>
      <FirstNavItem onClick={() => onClickBack()}>
        <RotatedChevron>
          <Chevron />
        </RotatedChevron>
        {t('Back to Manage')}
      </FirstNavItem>
      {tabList.map((item, index) => (
        <NavItem key={index} onClick={() => onClickTab(item.path)}>
          {t(`${item?.name}`)}
          {item?.path === currentTab ? <Chevron color={theme.primary} /> : <Chevron />}
        </NavItem>
      ))}
    </Container>
  );
}

export default MyPageNav;

const Container = styled.div<{ count: number }>`
  height: ${(props) => props.count * 54 + 38}px;
  width: 172px;
  background-color: white;
  border: 1px solid #e2e8f0;
  @media screen and (max-width: 768px) {
    width: calc(100% - 36px);
  }
`;

const NavItem = styled.div`
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  transition: background-color 0.3s;
  &:hover {
    background-color: #f7fafc;
  }
  &:active {
    background-color: #f7fafc;
  }
  &:last-child {
    border-bottom: none;
  }
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;
const FirstNavItem = styled.div`
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 0 12px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  transition: background-color 0.3s;
  &:hover {
    background-color: #f7fafc;
  }
  &:active {
    background-color: #f7fafc;
  }
  &:last-child {
    border-bottom: none;
  }
  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

const RotatedChevron = styled.div`
  transform: rotate(180deg);
`;
