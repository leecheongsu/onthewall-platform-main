'use client';
import React, { forwardRef, use, useEffect, useState } from 'react';
import Image from 'next/image';

//store
import { useDesignStore } from '@/store/design';
import { useProjectStore } from '@/store/project';
import { useMobileViewStore } from '@/store/mobile';
import { useLanguageStore } from '@/store/language';

// style
import styled from '@emotion/styled';

// lib
import { useTranslation } from 'react-i18next';
import i18n from '@/locales/i18n';
import Skeleton from 'react-loading-skeleton';

// mui
import { FormControl, InputLabel, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import GTranslateIcon from '@mui/icons-material/GTranslate';

// icons
import HomeIcon from '@/images/svg/homepage.svg';
import FacebookIcon from '@/images/svg/facebook.svg';
import InstagramIcon from '@/images/svg/instagram.svg';
import BlogIcon from '@/images/svg/blog.svg';

// components
import Br from '@/components/Br';

type Props = {};

const Footer = forwardRef<HTMLElement, Props>((props, ref) => {
  const [designMode, setDesignMode] = useState(false);
  const [randomWidth, setRandomWidth] = useState(150);

  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const { footer, title } = useDesignStore((state) => state);
  const { projectUrl } = useProjectStore((state) => state);

  const [isHome, setIsHome] = useState(false);
  const { language, setLanguage } = useLanguageStore();

  const [company, setCompany] = useState('');
  const [copyRight, setCopyRight] = useState('');

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    setIsHome(window.location.pathname.includes('/home'));
  }, []);

  useEffect(() => {
    if (language === 'kr') {
      setCompany(footer.company);
      setCopyRight(footer.copyright);
    }
    if (language === 'en') {
      setCompany(footer.company_en);
      setCopyRight(footer.copyright_en);
    }
  }, [footer, language]);

  useEffect(() => {
    if (window.location.pathname.includes('design')) {
      setDesignMode(true);
    }
    setRandomWidth(150 + Math.random() * 200);
  }, []);

  return (
    <FooterWrap className={designMode ? 'designMode' : ''}>
      <FooterBox className={designMode ? 'designMode' : ''} mobileView={mobileView}>
        <FooterText mobileView={mobileView}>
          <>
            <Title>
              {title && <Br text={title} />}
              {!title && <Skeleton width={180} height={16} />}
            </Title>
            <Label>
              {<Br text={company} />}
              {!company && (
                <SkeletonContainer>
                  <Skeleton width={randomWidth} height={14} />
                  <Skeleton width={randomWidth} height={14} />
                </SkeletonContainer>
              )}
            </Label>
          </>
          <Box>
            {<Copyright dangerouslySetInnerHTML={{ __html: copyRight }} />}
            {!company && <Skeleton width={300} height={14} />}
          </Box>
        </FooterText>
        <FooterButton mobileView={mobileView}>
          <SnsBox>
            {footer.blog && footer.blog !== 'https://' && (
              <a href={footer.blog} target="_blank" rel="noreferrer">
                <Image src={BlogIcon} alt="BlogIcon" />
              </a>
            )}
            {footer.instagram && footer.instagram !== 'https://' && (
              <a href={footer.instagram} target="_blank" rel="noreferrer">
                <Image src={InstagramIcon} alt="InstagramIcon" />
              </a>
            )}
            {footer.facebook && footer.facebook !== 'https://' && (
              <a href={footer.facebook} target="_blank" rel="noreferrer">
                <Image src={FacebookIcon} alt="FacebookIcon" />
              </a>
            )}
            {footer.homepage && footer.homepage !== 'https://' && (
              <a href={footer.homepage} target="_blank" rel="noreferrer">
                <Image src={HomeIcon} alt="HomeIcon" />
              </a>
            )}
            <LanguageButton
              onClick={() => {
                if (language === 'en') {
                  setLanguage();
                  changeLanguage('ko');
                } else {
                  setLanguage();
                  changeLanguage('en');
                }
              }}
            >
              <GTranslateIcon />
              {/* <span>{lang === "en" ? t("KRW") : t("ENG")}</span> */}
            </LanguageButton>
          </SnsBox>
        </FooterButton>
      </FooterBox>
    </FooterWrap>
  );
});

Footer.displayName = 'Footer';

export default Footer;

const Label = styled.span`
  font-weight: 500;
  line-height: normal;
  @media (max-width: 900px) {
    font-size: 12px;
  }
`;

const Box = styled.div`
  padding-top: 12px;
`;

const FooterWrap = styled.footer`
  margin-top: 0;
  padding: 50px;
  min-height: 200px;
  border-top: 1px solid var(--Neutral-30, #e2e8f0);
  background: #fff;
  font-family: 'Noto Sans KR', sans-serif;
  overflow: hidden;
  &.designMode {
    width: 100%;
    margin: auto;
    padding: 50px 20px;
  }
  @media (max-width: 900px) {
    padding: 20px;
  }
`;

const FooterBox = styled.div<{ mobileView?: boolean }>`
  width: ${(props) => (props.mobileView ? '100%' : '1200px')};
  padding: ${(props) => (props.mobileView ? '0' : '0 20px')};
  margin: 0 auto;
  display: flex;
  flex-direction: ${(props) => (props.mobileView ? 'column' : 'row')};
  justify-content: space-between;
  align-items: flex-start;
  overflow: hidden;
  &.designMode {
    width: 100%;
    margin: auto;
  }
  @media (max-width: 1200px) {
    width: 100%;
    padding: 0;
  }
  @media (max-width: 900px) {
    flex-direction: column;
    padding: 0;
  }
`;

const FooterButton = styled.div<{ mobileView?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: ${(props) => (props.mobileView ? 'flex-start' : 'flex-end')};
  @media (max-width: 900px) {
    display: block;
    width: 100%;
    margin-top: 20px;
    & .MuiFormControl-root {
      width: 100%;
    }
  }
`;

const FooterText = styled.div<{ mobileView?: boolean }>`
  max-width: ${(props) => (props.mobileView ? '100%' : 'calc(100% - 220px)')};
  overflow: hidden;
  @media (max-width: 900px) {
    width: 100%;
    max-width: 100%;
    flex-direction: column;
  }
`;

const Copyright = styled.span`
  font-weight: 400;
  line-height: 22px;
  // mobile
  @media (max-width: 900px) {
    font-size: 12px;
  }
`;

const Title = styled.h1`
  font-size: 16px;
  font-weight: 700;
  line-height: 28px;
  margin-bottom: 4px;
`;

const SkeletonContainer = styled.div``;

const LanguageButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: #94a3b8;
  border-radius: 100%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  padding: 0;
  & span {
    font-size: 0.8rem;
    line-height: 1;
  }
  & svg {
    color: #fff;
    font-size: 20px;
  }
`;

const SnsBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 14px;
  & img {
    width: 32px;
    height: 32px;
  }
  @media (max-width: 900px) {
    margin-bottom: 0;
    margin-top: 0;
    justify-content: flex-start;
  }
`;
