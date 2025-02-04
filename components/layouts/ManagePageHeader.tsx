import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import PersonCircleIcon from '@/images/icons/PersonCircle';
import { useRouter } from 'next/navigation';
import NotificationCenter from '@/components/NotificationCenter';
import { useDesignStore } from '@/store/design';
import { useUserStore } from '@/store/user';
import { useCookies } from '@/hooks/useCookies';
import Skeleton from 'react-loading-skeleton';
import { useProjectStore } from '@/store/project';
import { platformAccountApis } from '@/api/platform';
import Image from 'next/image';

// data
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_IMAGES } from '@/constants/defaultLayoutInfo';

// lib
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store/language';
import i18n from '@/locales/i18n';

// mui
import Button from '@mui/material/Button';
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';

// icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ProjectSelector from '../manage/SideMenu/ProjectSelector';
import { ACCESS_BUSINESS_AND_ABOVE } from '@/constants/acess';
import Info from '@/images/svg/otwc_info.svg';
import Plan from '@/images/svg/otwc_price.svg';
import Support from '@/images/svg/otwc_support.svg';
import Search from '@/images/svg/otwc_search.svg';

function PageHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const { logoUrl } = useDesignStore((state) => state);
  const { language, setLanguage } = useLanguageStore();
  const { status, logOut, isLogin, projectsMap, userName, projects, ownProjectIds } = useUserStore();
  const { projectId, isExpired, projectUrl, tier } = useProjectStore();

  // const [channelData, setChannelData] = useState<any>();
  const [projectDesignData, setProjectDesignData] = useState<any>();
  const [menuOpen, setMenuOpen] = useState(false);

  // 로그아웃
  const logoutHandler = async () => {
    if (projectUrl) {
      const curProjectUserStatus = projectsMap[projectId].status;
      if (curProjectUserStatus !== 'user') {
        await platformAccountApis.signOut();
      }
      logOut();

      if (tier === 'enterprise') {
        router.push(`/${projectUrl}/main`);
      } else {
        router.push(`/home`);
      }

      setMenuOpen(false);
    } else {
      await platformAccountApis.signOut();
      logOut();
      router.push(`/home`);
      setMenuOpen(false);
    }
  };
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleMyInfoClick = () => {
    if (projectsMap[ownProjectIds[0]].data)
      router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}/account/my-page`);
  };
  const handleMyChannelClick = () => {
    if (projectsMap[ownProjectIds[0]].data) router.push(`/channel/${projectsMap[ownProjectIds[0]].data.projectUrl}`);
  };
  const handleMyCustomPageClick = () => {
    if (projectsMap[ownProjectIds[0]].data) router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}`);
  };
  const onClickLogin = () => {
    router.push(`/account/sign-in`);
  };
  const onClickStudio = () => {
    if (projectsMap[ownProjectIds[0]].data) router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}/manage`);
  };

  useEffect(() => {
    if (projects && projects[0]?.id) {
      const projectDesignRef = doc(db, 'ProjectDesign', projects[0].id);
      getDoc(projectDesignRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const projectDesignData = docSnap.data();
            setProjectDesignData(projectDesignData);
          }
        })
        .catch((error) => {
          console.error('문서 가져오기 오류:', error);
        });
    }
  }, [projects]);

  const handleLogoClick = () => {
    if (!ACCESS_BUSINESS_AND_ABOVE.includes(tier)) {
      router.push(`/home`);
    } else {
      router.push(`/${projectUrl}/main`);
    }
  };

  return (
    <Header>
      <Front>
        {!logoUrl && <Skeleton width={180} height={30} />}
        {logoUrl && <Logo src={logoUrl} onClick={handleLogoClick} />}
        {isLogin && <ProjectSelector />}
      </Front>
      {isLogin && (
        <ButtonGroup>
          <NotificationCenter />
          <MenuBtn
            onClick={() => {
              setMenuOpen((prev) => !prev);
            }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </MenuBtn>
          <MenuBg
            className={menuOpen ? 'open' : ''}
            onClick={() => {
              setMenuOpen(false);
            }}
          />
          <SiteMap className={menuOpen ? 'open' : ''}>
            <UserBox>
              {isLogin ? (
                <>
                  <UserTop>
                    <p>{t('Welcome Back,')}</p>
                  </UserTop>
                  <UserInfo>
                    {projectDesignData ? <img src={projectDesignData?.channelData.thumbnail} /> : <Avatar />}
                    <div>
                      <p>{userName}</p>
                      <span>{projectsMap[ownProjectIds[0]]?.data?.channelName}</span>
                    </div>
                  </UserInfo>
                  <UserBtn>
                    <UserButton
                      className="studio"
                      onClick={onClickStudio}
                      variant="contained"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {t('Studio')}
                    </UserButton>
                    <UserButton
                      className="logout"
                      onClick={logoutHandler}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {t('Logout')}
                    </UserButton>
                  </UserBtn>
                </>
              ) : (
                <UserTop>
                  <p>{t('Sign in to continue,')}</p>
                </UserTop>
              )}
            </UserBox>
            <MenuBox>
              <MenuList>
                {isLogin ? (
                  <>
                    <MenuItem onClick={handleMyInfoClick}>
                      <span>{t('My Page')}</span>
                      <ChevronRightIcon />
                    </MenuItem>
                    {(projectsMap[ownProjectIds[0]].data.tier === 'personal' ||
                      projectsMap[ownProjectIds[0]].data.tier === 'business') && (
                      <MenuItem onClick={handleMyChannelClick}>
                        <span>{t('My Channel')}</span>
                        <ChevronRightIcon />
                      </MenuItem>
                    )}
                    {projectsMap[ownProjectIds[0]].data.tier === 'business' && (
                      <MenuItem onClick={handleMyCustomPageClick}>
                        <span>{t('My Custom Page')}</span>
                        <ChevronRightIcon />
                      </MenuItem>
                    )}
                    {projectsMap[ownProjectIds[0]].data.tier === 'enterprise' && (
                      <MenuItem onClick={handleMyCustomPageClick}>
                        <span>{t('My Home Page')}</span>
                        <ChevronRightIcon />
                      </MenuItem>
                    )}
                  </>
                ) : (
                  <>
                    <MenuItem className="login_btn" onClick={onClickLogin}>
                      <span>{t('Login')}</span>
                    </MenuItem>
                    <Br />
                  </>
                )}
              </MenuList>
            </MenuBox>
            {/* <SearchButton
              onClick={() => {
                if (projectUrl) {
                  router.push(`/${projectUrl}/main/search`);
                } else {
                  router.push(`/home/search`);
                }
                setMenuOpen(false);
              }}
            >
              <Image src={Search} alt="Search" />
            </SearchButton> */}
            <LanguageBox>
              <span
                className={language === 'kr' ? 'selected' : ''}
                onClick={() => {
                  setLanguage('kr');
                  changeLanguage('ko');
                }}
              >
                KOR
              </span>
              <span
                className={language === 'en' ? 'selected' : ''}
                onClick={() => {
                  setLanguage('en');
                  changeLanguage('en');
                }}
              >
                ENG
              </span>
            </LanguageBox>
            <SupportBox>
              <SupportTitle>
                <a href="https://onthewall.io">{t('ONTHEWALL')}</a>
              </SupportTitle>
              <a href="https://onthewallservice.io" target="_blank">
                <Image src={Info} alt="Info" />
                {t('Information')}
              </a>
              <a href="https://onthewallservice.io/price" target="_blank">
                <Image src={Plan} alt="Plan" />
                {t('Plan')}
              </a>
              <a href="https://onthewallservice.io/inquiry" target="_blank">
                <Image src={Support} alt="Support" />
                {t('Contact Us')}
              </a>
            </SupportBox>
          </SiteMap>
        </ButtonGroup>
      )}
    </Header>
  );
}

export default PageHeader;

const Header = styled.header`
  height: 60px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Logo = styled.img`
  cursor: pointer;
  height: 30px;
`;

const MenuBtn = styled(IconButton)`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e9eef4;
`;

const SiteMap = styled.div`
  position: absolute;
  left: 100%;
  top: 60px;
  z-index: 12;
  width: 260px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-top: 1px solid #e9eef4;
  padding: 15px;
  transition: left 0.3s ease-in-out;
  &.open {
    left: calc(100% - 260px);
    transition: left 0.3s ease-in-out;
  }
  @media (max-width: 768px) {
    width: 80%;
    &.open {
      left: auto;
      right: 0;
    }
  }
`;

const MenuBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const MenuList = styled.ul`
  width: 100%;
`;

const MenuItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  width: 100%;
  border-radius: 7px;
  line-height: 1;
  cursor: pointer;
  :hover {
    background-color: #f1f4f9;
    color: #115de6;
  }
  &.login_btn {
    justify-content: center;
    background-color: #115de6;
    color: #fff;
    :hover {
      background-color: #0d4cc1;
    }
  }
`;

const MenuBg = styled.div`
  position: absolute;
  left: 0;
  top: 60px;
  width: 100%;
  height: calc(100vh - 60px);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
  transition: opacity 0.3s ease-in-out;
  display: none;
  &.open {
    display: block;
    z-index: 11;
    transition: opacity 0.3s ease-in-out;
  }
`;

const SupportBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 5px;
  border-radius: 3px;
  border-top: 1px solid #e2e8f0;
  & img {
    width: 100%;
  }
  & a {
    display: block;
    padding: 7px 0;
    line-height: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #788599;
    & img {
      width: 16px;
      height: 16px;
    }
    :hover {
      color: #115de6;
    }
  }
`;

const SupportTitle = styled.div`
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 10px;
  a {
    color: #64748b;
  }
`;

const UserBox = styled.div`
  line-height: normal;
`;

const UserTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & p {
    font-size: 1.05rem;
    font-weight: 700;
  }
  & button {
    width: 40px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  p {
    font-size: 1rem;
    font-weight: 700;
  }
  span {
    font-size: 0.85rem;
    color: #666;
  }
  & img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid #e0e0e0;
  }
`;

const UserBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid #e9eef4;
  border-bottom: 1px solid #e9eef4;
`;

const UserButton = styled(Button)`
  flex: 1;
  &.studio {
    background-color: #115de6;
    color: #fff;
    :hover {
      background-color: #0c4bc0;
    }
  }
  &.logout {
    border: 1px solid #115de6;
    color: #115de6;
    background-color: #fff;
    :hover {
      background-color: #f8fbff;
    }
  }
`;

const Front = styled.div`
  display: flex;
  gap: 30px;
`;

const SearchButton = styled.div`
  margin-top: auto;
  margin-bottom: 15px;
  cursor: pointer;
`;

const Br = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9eef4;
  margin-top: 15px;
`;

const LanguageBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: auto;
  padding: 10px 0;
  border-top: 1px solid #e2e8f0;
  line-height: 1;
  & span {
    flex: 1;
    text-align: center;
    font-size: 0.85rem;
    color: #64748b;
    cursor: pointer;
    :hover {
      color: #115de6;
    }
  }
  & span.selected {
    color: #115de6;
  }
  @media (max-width: 768px) {
    margin-top: auto;
  }
`;
