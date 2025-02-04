'use client';

import * as React from 'react';

// lib
import moment from 'moment';
import { useTranslation } from 'react-i18next';

// mui
import Modal from '@mui/material/Modal';

// style
import styled from '@emotion/styled';

// icons
import CloseIcon from '@/images/icons/Close';
import NoticeIcon from '@/images/icons/Notice';
import { useDesignStore } from '@/store/design';

interface Props {
  open: boolean;
  onClose: any;
  data: any;
}

export const DetailModal = ({ open, onClose, data }: Props) => {
  const { i18n, t } = useTranslation();
  const theme = useDesignStore((state) => state.theme);
  const convertTimestampToDate = (timestamp: any) => {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Content>
          <CloseButton onClick={onClose}>
            <CloseIcon className="w-6 h-6" />
          </CloseButton>
          <Notice theme={theme.primary}>
            <NoticeIcon className="w-10 h-10" />
          </Notice>
          <Title>{t('Details')}</Title>
          <Box>
            <Row>
              <Label>{t('Space')}</Label>
              <Value>{data?.space?.title_en}</Value>
            </Row>
            <Row>
              <Label>{t('Created At')}</Label>
              <Value>
                {data?.createdAt
                  ? moment(convertTimestampToDate(data.createdAt)).format('YYYY년 MM월 DD일')
                  : t('No Created date')}
              </Value>
            </Row>
            <Row>
              <Label>{t('published At')}</Label>
              <Value>
                {data?.publishedAt
                  ? moment(convertTimestampToDate(data.publishedAt)).format('YYYY년 MM월 DD일')
                  : t('No Published date')}
              </Value>
            </Row>
          </Box>
          <Buttons>
            <Button theme={theme.primary} onClick={onClose}>
              {t('Close')}
            </Button>
          </Buttons>
        </Content>
      </Modal>
    </>
  );
};

const Content = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  min-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
const Notice = styled.div<{ theme?: any }>`
  & svg {
    stroke: ${(props) => props.theme};
  }
`;

const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;
const Title = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-top: 10px;
  text-align: center;
`;
const Buttons = styled.div`
  display: flex;
  margin-top: 20px;
  gap: 10px;
`;

const Button = styled.div<{ theme?: any }>`
  cursor: pointer;
  padding: 7px 70px;
  background-color: white;
  color: ${(props) => props.theme};
  border: 1px solid ${(props) => props.theme};
  border-radius: 5px;
  :hover {
    background-color: ${(props) => props.theme};
    color: white;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 0;
`;

const Label = styled.div`
  font-size: 0.95rem;
  font-weight: 400;
  color: #0f1a2a;
  flex: 1;
`;
const Value = styled.div`
  font-size: 0.95rem;
  font-weight: 500;
  flex: 3;
`;

const Box = styled.div`
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-right: 0;
  border-left: 0;
  width: 100%;
`;
