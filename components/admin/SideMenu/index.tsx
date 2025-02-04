import { SIDE_MENUS } from '@/constants/adminMenus';
import ArrowDownIcon from '@/images/icons/ArrowDown';

import { useProjectStore } from '@/store/project';
import { useLanguageStore } from '@/store/language';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useState } from 'react';
import { useDesignStore } from '@/store/design';
import { useUserStore } from '@/store/user';
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
  const { projectUrl } = useProjectStore();
  const { status } = useUserStore((state) => state);
  const theme = useDesignStore((state) => state.theme);

  /**
   * TODO. 추후 store 처리 할 것.
   * Note. 온더월 에서 기존 데이터가 있는 경우 보여 줄지 말지에 대한 탭
   */
  const [isHasPrevious, setIsHasPrevious] = useState(true);

  const toggleSubMenu = (menuKey: string) => {
    setActiveMenu(menuKey);
    setOpenMenus((prevState) => ({
      ...prevState,
      [menuKey]: !prevState[menuKey],
    }));
  };

  const renderMenuItem = (menuItem: any, index: number) => (
    <div key={index}>
      <Link key={index} href={`${menuItem.link}`} shallow={true}>
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
          {state && <>{menuItem.subCate}</>}
        </MenuItem>
      </Link>
    </div>
  );

  const manageMenus = SIDE_MENUS.filter((menu) => menu.cate === 'Manage');
  const editMenu = manageMenus.slice(0, 9);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    setLanguage();
  };

  return (
    <Wrapper>
      <MenuContainer isOpen={state ?? false}>
        {editMenu.map(renderMenuItem)}
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

const SubMenuContainer = styled.div<{ isActive: boolean }>`
  padding-left: ${({ isActive }) => (isActive ? '10px' : '0')};
`;

const ArrowDownRotateIcon = styled(ArrowDownIcon)<{ isOpen: boolean }>`
  width: 25px;
  height: 25px;
  margin-left: auto;
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  transition: transform 0.3s ease-in-out;
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

const HomeEditButton = styled.div<{ theme: any }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  flex-shrink: 0;
  color: #0f1a2a;
  font-size: 16px;

  cursor: pointer;

  & svg {
    width: 22px;
    height: 22px;
  }

  &:hover {
    color: ${({ theme }) => theme};
  }
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
