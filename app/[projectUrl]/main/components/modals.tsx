// 최초 접속시 띄우는 환영 모달
// 본인의 페이지에서만 띄워줘야함.
// 1회면 띄우는 것이 의도이나, 현재는 세션 초기화 되면 다시 띄움.

'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import styled from '@emotion/styled';
import CloseIcon from '@/images/icons/Close';
import { useState } from 'react';
import { useDesignStore } from '@/store/design';
import Check from '@/images/icons/Check';
import { useUserStore } from '@/store/user';
import { useProjectStore } from '@/store/project';

export const WelcomeModal = () => {
  const { i18n, t } = useTranslation();
  const { theme } = useDesignStore();
  const { ownProjectIds } = useUserStore((state) => state);
  const { projectId } = useProjectStore((state) => state);

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem('hidePopup') === 'true') {
      setIsOpen(false);
    } else if (ownProjectIds.includes(projectId)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, []);

  const onClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hidePopup', 'true');
  };

  return (
    <>
      <Modal open={isOpen} onClose={onClose}>
        <Content>
          <CloseButton onClick={onClose}>
            <CloseIcon className="w-6 h-6" />
          </CloseButton>
          <Notice theme={theme.primary}>
            <Check className="w-10 h-10" />
          </Notice>
          <Title>{t('Welcome To Join Onthewall')}</Title>
          <SubTitle>
            {t('This is your main page, where you can create exhibitions or customize this page.')}
            <br />
            {t('To make edits, log in and click the ')} <span style={{ color: 'red' }}>{t('Studio')}</span>
            {t(' button to navigate to the management screen.')}
          </SubTitle>
          <Buttons>
            <StyleButton color="primary" variant="contained" onClick={onClose} style={{ textTransform: 'capitalize' }}>
              {t('Confirm')}
            </StyleButton>
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
const SubTitle = styled.p`
  font-size: 16px;
  margin: 30px 0;
  text-align: center;
  line-height: 1.5;
  color: var(--Neutral-100);
  padding: 0 40px;
  word-break: keep-all;
`;

const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;

const StyleButton = styled(Button)`
  cursor: pointer;
  padding: 7px 70px;
  border-radius: 5px;
`;
