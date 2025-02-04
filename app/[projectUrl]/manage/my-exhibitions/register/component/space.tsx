import React, { useState, useEffect } from 'react';

import { useProjectStore } from '@/store/project';
import { useDesignStore } from '@/store/design';
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { Button, CardMedia, Grid } from '@mui/material';

// icons
import ShareIcon from '@mui/icons-material/Share';
import CheckIcon from '@/images/icons/Check';
import { useLanguageStore } from '@/store/language';

interface Props {
  space: any;
  onModalOpen: () => void;
}

interface Color {
  primary: string;
  secondary: string;
}

const Space = ({ space, onModalOpen }: Props) => {
  const { i18n, t } = useTranslation();
  const { language } = useLanguageStore();
  const theme = useDesignStore((state) => state.theme);

  const onClickPreview = (id: string) => {
    window.open('https://onna.me/m/' + id, '_blank');
  };

  const onClickShare = async (id: string) => {
    const link = 'https://onna.me/m/' + id;
    if ('clipboard' in navigator) {
      await navigator.clipboard.writeText(link);
    } else {
      document.execCommand('copy', true, link);
    }
    alert('Successfully link copid');
  };

  return (
    <>
      <Grid container xs={12} sm={12} md={6} lg={4}>
        <SpaceCard>
          <Container>
            <CardMedia
              component="img"
              height="300"
              image={space.thumbnailImg.url}
              className="thumbnailImg"
              onClick={() => {
                onModalOpen();
              }}
            />
            <BtnWrap>
              <ShareIconWrap
                onClick={() => {
                  onClickShare(space.matterportId);
                }}
              >
                <ShareIcon className="shareIconImg" />
              </ShareIconWrap>
              <Button
                className="previewBtn"
                onClick={() => {
                  onClickPreview(space.matterportId);
                }}
              >
                {t('Preview')}
              </Button>
            </BtnWrap>
            <SelectBtn id="selectBtn">
              <CheckIcon className="selectBtnIcon" />
              {t('Select')}
            </SelectBtn>
          </Container>
          <TextBox>
            <Title theme={theme.primary}>
              <p>{language === 'en' ? space.title_en : space.title}</p>
              <span>
                {t('Max display')} {space.maxNumOfPainting}
              </span>
            </Title>
            <AreaPrice theme={theme.primary}>
              <span>{space.area} m²</span>
            </AreaPrice>
          </TextBox>
        </SpaceCard>
      </Grid>
    </>
  );
};

export default Space;

const SpaceCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 15px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  &:hover {
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
    & #selectBtn {
      display: flex;
      opacity: 1;
      align-items: center;
    }
  }
`;

const Container = styled.div`
  display: flex;
  position: relative;
  width: 100%;
  & .thumbnailImg {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    width: 100%;
    height: 280px;
    position: relative;
  }
`;

const BtnWrap = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  top: 0;
  right: 0;
  & .previewBtn {
    display: flex;
    align-self: center;
    color: #fff;
    outline-color: #fff;
    border-color: #fff;
    font-size: 14px;
    border-radius: 10px;
    margin-left: 10px;
    border: 1px solid #fff;
    padding: 5px 15px;
  }
`;

const ShareIconWrap = styled.div`
  display: flex;
  border-radius: 50%;
  border: 1px solid #fff;
  padding: 5px;
  align-self: center;
  & .shareIconImg {
    width: 12px;
    height: 12px;
    color: #fff;
  }
`;

const SelectBtn = styled.div`
  position: absolute;
  width: 100%;
  display: none;
  justify-content: flex-end;
  bottom: 0;
  right: 0;
  padding: 10px 20px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s ease-in-out;
  opacity: 0;
  & .selectBtnIcon {
    margin-right: 5px;
    display: block;
    width: 14px;
    height: 14px;
  }
`;

const TextBox = styled.div`
  width: 100%;
  padding: 25px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
`;

const Title = styled.div<{ theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & p {
    font-size: 18px;
  }
  & span {
    color: ${({ theme }) => theme};
    font-size: 14px;
  }
`;

const AreaPrice = styled.div<{ theme: any }>`
  width: 100%;
  & span {
    color: ${({ theme }) => theme};
    font-size: 14px;
  }
`;
