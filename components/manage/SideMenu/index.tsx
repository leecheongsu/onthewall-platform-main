import { SIDE_MENUS } from '@/constants/menus';

import { useDesignStore } from '@/store/design';
import { useLanguageStore } from '@/store/language';
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  state?: boolean;
  setState?: () => void;
}

function SideMenu({ state, setState }: Props) {
  const { i18n, t } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { projectUrl, tier, projectId } = useProjectStore();
  const { status, projects, ownProjectIds, hasPreviousExhibition } = useUserStore();
  const { theme } = useDesignStore();

  const toggleSubMenu = (menuKey: string) => {
    setActiveMenu(menuKey);
    setOpenMenus((prevState) => ({
      ...prevState,
      [menuKey]: !prevState[menuKey],
    }));
  };

  const renderMenuItem = (menuItem: any, index: number) => {
    const project = projects.find((project) => project.id === projectId);
    const clickNotAllowedHandler = () => {
      alert(t('This feature is not available for your current plan.'));
    };
    if (!project) return <></>;

    if (ownProjectIds.includes(projectId)) {
      const { user: userStatus, project: projectTier } = menuItem.visibleTo;
      if (!userStatus.includes(project.status) || !projectTier.includes(tier))
        return (
          <>
            <div key={index} onClick={clickNotAllowedHandler}>
              <DisabledMenu>
                <MenuItem
                  onClick={() => (menuItem.hasItem ? toggleSubMenu(menuItem.subCate) : setActiveMenu(menuItem.subCate))}
                  isActive={false}
                  theme={theme.secondary}
                  isOpen={state ?? false}
                  subCate={menuItem.subCate}
                  aria-disabled={true}
                >
                  <MenuItemIcon isActive={false} theme={theme.secondary}>
                    {menuItem.icon}
                  </MenuItemIcon>
                  {state && <>{t(menuItem.subCate)}</>}
                </MenuItem>
              </DisabledMenu>
            </div>
          </>
        );
    }

    return (
      <div key={index}>
        <Link key={index} href={`/${projectUrl || ''}${menuItem.link}`} shallow={true}>
          <MenuItem
            onClick={() => (menuItem.hasItem ? toggleSubMenu(menuItem.subCate) : setActiveMenu(menuItem.subCate))}
            isActive={activeMenu === menuItem.subCate}
            theme={theme.primary}
            isOpen={state ?? false}
            subCate={menuItem.subCate}
          >
            <MenuItemIcon isActive={activeMenu === menuItem.subCate} theme={theme.primary}>
              {menuItem.icon}
            </MenuItemIcon>
            {state && <>{t(menuItem.subCate)}</>}
          </MenuItem>
        </Link>
      </div>
    );
  };

  const filterSiteMenu = (menuItems: any[], tier: string) => {
    return menuItems.filter((menuItem) => {
      // if (tier === 'business' && menuItem.subCate === 'Layout & Design') {
      //   return false;
      // } else if (tier === 'enterprise' && menuItem.subCate === 'Layout & Design') {
      //   return false;
      // } else if (tier === 'enterprise' && menuItem.subCate === 'Channel Setting') {
      //   return false;
      // }
      return !(tier === 'enterprise' && menuItem.subCate === 'Channel Setting');
    });
  };

  const editMenu = SIDE_MENUS.slice(0, 2);
  const siteMenu = filterSiteMenu(SIDE_MENUS.slice(2, 7), tier);
  const hasPreviousMenu = SIDE_MENUS.slice(7, 8);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    setLanguage();
  };

  return (
    <Wrapper>
      <MenuContainer isOpen={state ?? false}>
        {editMenu.map(renderMenuItem)}
        {status !== 'none' && projects[0].status !== 'user' && (
          <>
            <LongDash />
            {<Typography>{state && t('Site Management')}</Typography>}
            {siteMenu.map(renderMenuItem)}
            {hasPreviousExhibition && hasPreviousMenu.map(renderMenuItem)}
          </>
        )}
        <LanguageSwitcher isOpen={state ?? false}>
          <LanguageButton onClick={() => changeLanguage('en')}>English</LanguageButton>
          <LanguageButton onClick={() => changeLanguage('ko')}>한국어</LanguageButton>
        </LanguageSwitcher>
      </MenuContainer>
    </Wrapper>
  );
}

export default SideMenu;

const Wrapper = styled.div``;

const MenuContainer = styled.div<{ isOpen: boolean }>`
  width: ${({ isOpen }) => (isOpen ? '245px' : '60px')};
  height: 100%;
  background-color: white;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  padding: 50px 20px 20px;
  overflow-x: hidden;
  transition: all 0.3s;
`;

interface MenuItemProps {
  isActive: boolean;
  theme?: any;
  isOpen: boolean;
  subCate: string;
}

const MenuItem = styled.div<MenuItemProps>`
  display: flex;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  color: ${({ isActive, theme }) => (isActive ? theme : 'var(--Neutral-100, #0F1A2A)')};
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 170%;
  letter-spacing: -0.32px;
  height: 50px;

  &:hover {
    color: ${({ theme }) => theme};

    ${({ isOpen, subCate }) =>
      !isOpen &&
      `
      &:after {
        content: '${subCate}';
        position: absolute;
        left: 60px;
        white-space: nowrap;
        background: white;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
        padding: 5px 10px;
        border-radius: 5px;
        z-index: 10;
      }
    `}
  }
`;

const MenuItemIcon = styled.div<{ isActive: boolean; theme?: any }>`
  margin-right: 10px;
  fill: ${({ isActive, theme }) => (isActive ? theme : 'var(--Neutral-100, #0F1A2A)')};
  transition: fill 0.3s ease;
`;

const LongDash = styled.hr`
  color: #e2e8f0;
`;

const Typography = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 0 20px 0;
  flex-shrink: 0;
  color: #617b98;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 170%;
  letter-spacing: -0.28px;
  height: 65px;
`;

const LanguageSwitcher = styled.div<{ isOpen: boolean }>`
  margin-top: auto;
  display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const LanguageButton = styled.button`
  background: none;
  border: none;
  color: #617b98;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    color: #115de6;
  }
`;

const DisabledMenu = styled.div`
  opacity: 0.5;
  cursor: not-allowed;
`;
