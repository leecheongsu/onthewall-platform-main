'use client';

// next, react
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// data
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_IMAGES } from '@/constants/defaultLayoutInfo';

// api
import { platformAccountApis } from '@/api/platform';

// store
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { useDesignStore } from '@/store/design';
import { useLanguageStore } from '@/store/language';
import { useMobileViewStore } from '@/store/mobile';

// lib
import { useTranslation } from 'react-i18next';
import i18n from '@/locales/i18n';
import Skeleton from 'react-loading-skeleton';

// style
import styled from '@emotion/styled';

// mui
import { Avatar, IconButton, Button } from '@mui/material';
import InputBase from '@mui/material/InputBase';

// icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Info from '@/images/svg/otwc_info.svg';
import Plan from '@/images/svg/otwc_price.svg';
import Support from '@/images/svg/otwc_support.svg';
import Search from '@/images/svg/otwc_search.svg';
import SearchM from '@/images/svg/otwc_search_m.svg';
import SearchIcon from '@/images/icons/Search';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import Nav from './Nav';
import isMobile from '@/utils/isMobile';

const Navbar = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const { language, setLanguage } = useLanguageStore();
  const { logoUrl } = useDesignStore((state) => state);
  const { projectUrl, projectId } = useProjectStore();
  const { isLogin, projectsMap, logOut, userName, projects, ownProjectIds, paymentStatus } = useUserStore();

  const [projectDesignData, setProjectDesignData] = useState<any>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [designMode, setDesignMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [MobileSearchOpen, setMobileSearchOpen] = useState(false);

  const logoutHandler = async () => {
    if (projectUrl) {
      const curProjectUserStatus = projectsMap[projectId].status;
      if (curProjectUserStatus !== 'user') {
        await platformAccountApis.signOut();
      }
      logOut();
      router.push(`/home`);
      setMenuOpen(false);
    } else {
      await platformAccountApis.signOut();
      logOut();
      router.push(`/home`);
      setMenuOpen(false);
    }
  };

  const handleMyInfoClick = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) {
      router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}/account/my-page`);
    }
  };

  const handleMyChannelClick = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) {
      router.push(`/channel/${projectsMap[ownProjectIds[0]].data.projectUrl}`);
    }
  };

  const handleMyCustomPageClick = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) {
      router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}`);
    }
  };

  const onClickLogin = () => {
    router.push(`/account/sign-in`);
  };

  const onClickStudio = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) {
      router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}/manage`);
    }
  };

  const SearchExhibition = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClick = () => {
    if (designMode) return;
    window.location.href = `/home/search?search=${searchValue}`;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (designMode) return;
    if (event.key === 'Enter') {
      window.location.href = `/home/search?search=${searchValue}`;
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // 클라이언트에서만 실행되도록 useEffect에서 window를 체크
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.includes('design')) {
      setDesignMode(true);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <Container>
      <div className="header_box">
        {!MobileSearchOpen && (
          <div className="header_logo" onClick={() => router.push(`/home`)}>
            {!logoUrl ? <Skeleton width={180} height={30} /> : <img src={logoUrl} alt="Logo" />}
          </div>
        )}
        {!mobileView && (
          <SearchWrapper>
            <SearchBox>
              <InputBase
                fullWidth
                placeholder={t('Search for Exhibitions')}
                value={searchValue}
                onChange={SearchExhibition}
                onKeyDown={handleKeyDown}
              />
              <SearchIconWrapper onClick={handleSearchClick}>
                <SearchIcon className="w-5 h-5" />
              </SearchIconWrapper>
            </SearchBox>
          </SearchWrapper>
        )}

        <Right MobileSearchOpen={MobileSearchOpen}>
          {!MobileSearchOpen ? (
            <SearchMobileButton>
              <SearchIconWrapper onClick={() => setMobileSearchOpen(true)}>
                <SearchIcon className="w-5 h-5" />
              </SearchIconWrapper>
            </SearchMobileButton>
          ) : (
            <>
              <KeyboardBackspaceIcon onClick={() => setMobileSearchOpen(false)} />
              <SearchBox MobileSearchOpen={MobileSearchOpen}>
                <InputBase
                  fullWidth
                  placeholder={t('Search for Exhibitions')}
                  value={searchValue}
                  onChange={SearchExhibition}
                  onKeyDown={handleKeyDown}
                />
                <SearchIconWrapper onClick={handleSearchClick} MobileSearchOpen={MobileSearchOpen}>
                  <SearchIcon className="w-5 h-5" />
                </SearchIconWrapper>
              </SearchBox>
            </>
          )}

          {!menuOpen && !MobileSearchOpen && (
            <MenuBtn onClick={() => setMenuOpen(true)} disabled={designMode}>
              <MenuIcon />
            </MenuBtn>
          )}

          <MenuBg className={menuOpen ? 'open' : ''} onClick={() => setMenuOpen(false)} />
          {!isLogin &&
            !menuOpen &&
            isMounted &&
            typeof window !== 'undefined' &&
            window.location.pathname !== '/account/sign-in' && (
              <LoginButton onClick={onClickLogin}>{t('Login')}</LoginButton>
            )}
        </Right>
        <SiteMap className={menuOpen ? 'open' : ''}>
          {menuOpen && (
            <MenuBtn onClick={() => setMenuOpen(false)} disabled={designMode} className="close_btn">
              <CloseIcon />
            </MenuBtn>
          )}
          <UserBox>
            {isLogin ? (
              <>
                <UserTop>
                  <p>{t('Welcome Back,')}</p>
                </UserTop>
                <UserInfo>
                  {projectDesignData ? <img src={projectDesignData.channelData.thumbnail} /> : <Avatar />}
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
          <FeedBack>
            <p>{t('Help us improve')}</p>
            <a href="https://onthewallservice.io/feedback" target="_blank">
              {t('Send Feedback')}
            </a>
          </FeedBack>
          <MenuBox>
            <MenuList>
              {isLogin ? (
                <>
                  <MenuItem onClick={handleMyInfoClick}>
                    <span>{t('My Page')}</span>
                    <ChevronRightIcon />
                  </MenuItem>
                  {(projectsMap[ownProjectIds[0]]?.data?.tier === 'personal' ||
                    projectsMap[ownProjectIds[0]]?.data?.tier === 'business') && (
                    <MenuItem onClick={handleMyChannelClick}>
                      <span>{t('My Channel')}</span>
                      <ChevronRightIcon />
                    </MenuItem>
                  )}
                  {projectsMap[ownProjectIds[0]]?.data?.tier === 'business' && (
                    <MenuItem onClick={handleMyCustomPageClick}>
                      <span>{t('My Custom Page')}</span>
                      <ChevronRightIcon />
                    </MenuItem>
                  )}
                  {projectsMap[ownProjectIds[0]]?.data?.tier === 'enterprise' && (
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
              if (!designMode) router.push(`/home/search`);
              setMenuOpen(false);
            }}
          >
            <Image src={Search} alt="Search" className="search_pc" />
            <Image src={SearchM} alt="Search" className="search_m" />
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
              <a href="https://onthewall.io" target="_blank">
                {t('ONTHEWALL')}
              </a>
            </SupportTitle>
            <a href="https://onthewallservice.io">
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
      </div>
      <Desc>
        {t(
          '현실같은 온라인 갤러리 공간에 작품을 전시하고 친구들을 초대해보세요. \n 모두의 소셜 전시 플랫폼, OnTheWall!'
        )}
      </Desc>
      <Nav />
    </Container>
  );
};
export default Navbar;

const Container = styled.header`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  border-bottom: 1px solid #e9eef4;
  .header_box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    max-width: 1200px;
    margin: auto;
    padding: 0 20px;
  }
  .header_logo {
    cursor: pointer;
    img {
      height: 30px;
    }
    flex: 1;
  }
  @media (max-width: 768px) {
    & .header_logo {
      img {
        height: 25px;
      }
    }
  }
`;

const MenuBtn = styled(IconButton)`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  &.close_btn {
    position: absolute;
    left: calc(100% - 310px);
    top: 5px;
    background-color: #fff;
    @media (max-width: 768px) {
      left: -52px;
    }
  }
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
  border-top: 1px solid #e2e8f0;
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
  padding: 0 10px;
  gap: 15px;
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

const SearchButton = styled.div`
  margin-top: auto;
  margin-bottom: 15px;
  cursor: pointer;
  display: none;
  @media (max-width: 768px) {
    display: block;
    & img {
      width: 100%;
    }
    & img.search_pc {
      display: none;
    }
    & img.search_m {
      display: block;
    }
  }
`;

const SearchMobileButton = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    padding: 10px;
    border-radius: 50%;
    border: 1px solid #e2e8f0;
    width: 42px;
    height: 42px;
  }
`;

const Br = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9eef4;
  margin-top: 15px;
`;
const LoginButton = styled(Button)`
  width: 80px;
  height: 36px;
  border: 1px solid #115de6;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  // mobile
  @media (max-width: 768px) {
    display: none;
  }
`;

const Right = styled.div<{ MobileSearchOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: ${(props) => (props.MobileSearchOpen ? 'space-between' : 'flex-end')};
`;

const FeedBack = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1;
  padding: 15px 0;
  margin: 10px 0;
  border-bottom: 1px solid #e9eef4;
  gap: 10px;
  & p {
    font-size: 0.8rem;
    font-weight: 700;
    color: #5e6c84;
  }
  & a {
    line-height: 1;
    color: #115de6;
    font-weight: bold;
    :hover {
      color: #0d4cc1;
    }
  }
`;

const SearchBox = styled.div<{ MobileSearchOpen?: boolean }>`
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  padding: 0 15px;
  display: flex;
  align-items: center;
  height: 40px;
`;

const SearchWrapper = styled.div`
  display: block;
  flex: 1;
  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchIconWrapper = styled.div<{ MobileSearchOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-left: ${(props) => (props.MobileSearchOpen ? '1px solid #e2e8f0' : 'none')};
  padding-left: ${(props) => (props.MobileSearchOpen ? '10px' : '0')};
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

const Desc = styled.p`
  display: none;
  font-size: 0.85rem;
  color: #64748b;
  margin: 10px 0;
`;
