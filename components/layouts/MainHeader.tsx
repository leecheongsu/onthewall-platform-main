'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// next, react
import { useParams, useRouter } from 'next/navigation';

// data
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { DEFAULT_IMAGES } from '@/constants/defaultLayoutInfo';

// api
import { platformAccountApis } from '@/api/platform';

// store
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { useMobileViewStore } from '@/store/mobile';

// lib
import 'react-loading-skeleton/dist/skeleton.css';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/store/language';
import i18n from '@/locales/i18n';

// style
import styled from '@emotion/styled';

// mui
import { Avatar } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';

// types
import { useDesignStore } from '@/store/design';

// icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ACCESS_BUSINESS_AND_ABOVE } from '@/constants/acess';
import Info from '@/images/svg/otwc_info.svg';
import Plan from '@/images/svg/otwc_price.svg';
import Support from '@/images/svg/otwc_support.svg';
import Search from '@/images/svg/otwc_search.svg';
import SearchM from '@/images/svg/otwc_search_m.svg';
import SearchIcon from '@/images/icons/Search';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

interface Props {}
interface Color {
  primary: string;
  secondary: string;
}

const Navbar = ({}: Props) => {
  const router = useRouter();
  const projectUrl = (useParams<{ projectUrl: string }>() as any).projectUrl;

  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const { projectId, tier } = useProjectStore();
  const { logoUrl } = useDesignStore((state) => state);
  const { language, setLanguage } = useLanguageStore();
  const { isLogin, projectsMap, logOut, status, userName, projects, ownProjectIds, paymentStatus } = useUserStore(
    (state) => state
  );

  const [channelData, setChannelData] = useState<any>();
  const [projectDesignData, setProjectDesignData] = useState<any>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [designMode, setDesignMode] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [MobileSearchOpen, setMobileSearchOpen] = useState(false);

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
      router.push(`/home`);
      setMenuOpen(false);
    }
  };

  const handleMyInfoClick = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data)
      router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}/account/my-page`);
  };
  const handleMyChannelClick = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) router.push(`/channel/${projectsMap[ownProjectIds[0]].data.projectUrl}`);
  };
  const handleMyCustomPageClick = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}`);
  };
  const onClickLogin = () => {
    if (tier === 'enterprise') {
      router.push(`/${projectUrl}/account/sign-in`);
    } else {
      router.push(`/account/sign-in`);
    }
  };
  const onClickStudio = () => {
    if (paymentStatus.paid === false) {
      router.push(`/account/payment`);
      return;
    }
    if (projectsMap[ownProjectIds[0]].data) router.push(`/${projectsMap[ownProjectIds[0]].data.projectUrl}/manage`);
  };

  const SearchExhibition = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleSearchClick = () => {
    if (designMode) return;
    window.location.href = `/${projectUrl}/main/search?search=${searchValue}`;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (designMode) return;
    if (event.key === 'Enter') {
      window.location.href = `/${projectUrl}/main/search?search=${searchValue}`;
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    if (window.location.pathname.includes('design')) {
      setDesignMode(true);
    }
  }, []);

  useEffect(() => {
    if (projects && projects[0]?.id) {
      const projectRef = doc(db, 'Project', projects[0].id);
      const projectDesignRef = doc(db, 'ProjectDesign', projects[0].id);
      getDoc(projectRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const projectData = docSnap.data();
            setChannelData(projectData);
          }
        })
        .catch((error) => {
          console.error('문서 가져오기 오류:', error);
        });
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
      router.push(`/${projectUrl}/manage`);
    } else {
      router.push(`/${projectUrl}`);
    }
  };

  console.log('projectId', projectId, 'tier', tier, 'logoUrl', logoUrl, 'projectUrl', projectUrl);

  return (
    <Container className={designMode ? 'designMode' : ''}>
      <div className="header_box">
        {!MobileSearchOpen && (
          <div className="header_logo" onClick={handleLogoClick}>
            {!logoUrl && <Skeleton width={180} height={30} />}
            {logoUrl && <img src={logoUrl} alt="Logo" />}
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
          <MenuBg
            className={menuOpen ? 'open' : ''}
            onClick={() => {
              setMenuOpen(false);
            }}
          />
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
              if (!designMode) router.push(`/${projectUrl}/main/search`);
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
      </div>
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
    .header_logo {
      cursor: pointer;
      img {
        height: 30px;
      }
      flex: 1;
    }
  }
  &.designMode {
    position: static;
    max-width: 1200px;
    padding: 0 20px;
    margin: auto;
    z-index: 0;
    .header_box {
      padding: 0;
    }
  }
`;

const MenuBtn = styled(IconButton)`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e9eef4;
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

const Br = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9eef4;
  margin-top: 15px;
`;

const Right = styled.div<{ MobileSearchOpen?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: ${(props) => (props.MobileSearchOpen ? 'space-between' : 'flex-end')};
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
