'use client';

import * as React from 'react';

// data
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// store
import { useProjectStore } from '@/store/project';

// lib
import { useTranslation } from 'react-i18next';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';

// style
import styled from '@emotion/styled';

// icons
import CloseIcon from '@/images/icons/Close';
import NoticeIcon from '@/images/icons/Notice';
import { useDesignStore } from '@/store/design';
import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/user';

interface Props {
  open: boolean;
  onClose: any;
  activeData: any;
  setActiveData: any;
  isWarning: boolean;
  onFetch: () => void;
}

export const ActiveModal = ({ open, onClose, activeData, setActiveData, isWarning, onFetch }: Props) => {
  const { projectId, tier, channelName } = useProjectStore();
  const { uid } = useUserStore();
  const { i18n, t } = useTranslation();
  const theme = useDesignStore((state) => state.theme);

  const ActiveExhibition = async () => {
    const docRef = doc(db, 'Exhibition', activeData.id);
    const projectRef = doc(db, 'Project', projectId);
    const projectSnapshot = await getDoc(projectRef);
    const projectData = projectSnapshot.data();
    const projectExpiredAt = projectData?.expiredAt;
    await updateDoc(docRef, {
      version: 2.0,
      projectId: projectId,
      projectTier: tier,
      expiredAt: projectExpiredAt,
      isDeleted: false,
      channelName: channelName,
      uid: uid,
    });
    setActiveData((prev: any) => ({ ...prev, expiredAt: projectExpiredAt, isDeleted: false }));
    onClose();
    onFetch();
  };

  const alertShown = useRef(false);
  useEffect(() => {
    if (isWarning && !alertShown.current) {
      alert(t('Warning: Existing payment information may be lost when active.'));
      alertShown.current = true;
    }
  }, [isWarning]);

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
            {t('Are you sure you want to activate the exhibition?')}
            <br />
            {`"${activeData.title}"`}
          </Title>
          <SubTitle>
            {t(
              ' * If you activate the exhibition, it will be posted on your channel and main page, and you will be able to use the edit function.'
            )}
          </SubTitle>
          <SubTitle>
            {t(
              ' * However, depending on the plan you are using, there may be a limit to the number of exhibitions you can activate, so please choose carefully.'
            )}
          </SubTitle>
          <Buttons>
            <StyleButton color="primary" variant="outlined" onClick={onClose} style={{ textTransform: 'capitalize' }}>
              {t('Close')}
            </StyleButton>
            <StyleButton
              color="primary"
              variant="contained"
              onClick={ActiveExhibition}
              style={{ textTransform: 'capitalize' }}
            >
              {t('Active')}
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
  margin: 10px 0;
`;

const Buttons = styled.div`
  display: flex;
  margin-top: 40px;
  gap: 10px;
`;

const StyleButton = styled(Button)`
  cursor: pointer;
  padding: 7px 70px;
  border-radius: 5px;
`;
