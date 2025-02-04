'use client';

import * as React from 'react';

// lib
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
  onDelete: any;
  exhibitionTitle: string;
}

export const DeleteModal = ({ open, onClose, onDelete, exhibitionTitle }: Props) => {
  const { i18n, t } = useTranslation();
  const theme = useDesignStore((state) => state.theme);

  // 전시 삭제
  const DeleteExhibition = () => {
    onDelete();
    onClose();
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
          <Title>
            {t('Are you sure you want to delete the exhibition?')}
            <br />
            {`"${exhibitionTitle}"`}
          </Title>
          <SubTitle>{t('Once deleted, This action cannot be undone.')}</SubTitle>
          <Buttons>
            <Button theme={theme.primary} onClick={onClose}>
              {t('Close')}
            </Button>
            <Button theme={theme.primary} onClick={DeleteExhibition}>
              {t('Delete')}
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
  min-width: 600px;
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
  margin-top: 20px;
  text-align: center;
`;
const SubTitle = styled.div`
  font-size: 16px;
  margin-top: 20px;
  text-align: center;
`;

const Buttons = styled.div`
  display: flex;
  margin-top: 40px;
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
