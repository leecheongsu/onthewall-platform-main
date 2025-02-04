import React, { useEffect, useState } from 'react';
import Modal from '@mui/material/Modal';
import styled from '@emotion/styled';
import { useUserStore } from '@/store/user';
import { useTranslation } from 'react-i18next';
import Notice from '@/images/icons/Notice';
import { platformAccountApis } from '@/api/platform';
import { useProjectStore } from '@/store/project';

interface Props {}

function ChannelNameUpdateModal({}: Props) {
  const { t } = useTranslation();
  const { uid, updateProjectMap } = useUserStore();
  const { projectId, channelName, updateInfo } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState(channelName);
  const onClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const regex1 = /([A-Za-z가-힣\-]+)([A-Za-z0-9]{5})/;

    if (
      channelName === undefined ||
      channelName === null ||
      channelName.includes('test') ||
      channelName.trim() === '' ||
      regex1.test(channelName)
    ) {
      setIsOpen(true);
    }
  }, [channelName]);

  const handleSkipButton = () => {
    const isConfirm = window.confirm(t('Would you like to do it later?'));
    if (isConfirm) {
      onClose();
    }
  };

  const handleConfirmButton = () => {
    if (!newChannelName.trim()) {
      return alert(t('Please fill in all required fields.'));
    }

    if (newChannelName.length > 20) {
      return alert(t('Name is too long'));
    }

    platformAccountApis.validateChannelName(newChannelName).then((isExist) => {
      if (isExist) return alert(t('Already used channel name.'));

      platformAccountApis
        .modifyChannelName(uid, projectId, newChannelName)
        .then((res) => {
          if (res) {
            updateInfo('channelName', newChannelName);
            updateProjectMap(projectId);
            alert(t('Channel name has been successfully changed.'));
            onClose();
          } else {
            alert(t('Please try again a few minutes later.'));
          }
        })
        .catch((e) => {
          console.error('Modify Channel Name Error : ', e);
        });
    });
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Container>
        <Box>
          <NoticeBox>
            <Notice />
          </NoticeBox>
          <Title>{t('Update Your Channel Name')}</Title>
          <Description>
            {t(
              `To provide you with a better experience,\nplease take a moment to update your channel name.\nWe appreciate your time, and we’re excited to have you back!`
            )}
          </Description>
          <Row>
            <Label>{t('Channel Name')}</Label>
            <Input
              name="channelName"
              value={newChannelName}
              type="text"
              placeholder={t('Channel Name')}
              required
              onChange={(e) => setNewChannelName(e.target.value)}
            />
          </Row>
          <ButtonBox>
            <SkipButton onClick={handleSkipButton}>{t('Skip')}</SkipButton>
            <ConfirmButton onClick={handleConfirmButton}>{t('Confirm')}</ConfirmButton>
          </ButtonBox>
        </Box>
      </Container>
    </Modal>
  );
}

export default ChannelNameUpdateModal;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
  border-radius: 10px;
  box-sizing: border-box;
  width: 650px;
  min-width: 600px;
  height: 400px;
  position: relative;
  background-color: #ffffff;
  padding: 20px;
`;

const NoticeBox = styled.div`
  & svg {
    stroke: #115de6;
    width: 50px;
  }

  padding-bottom: 30px;
`;

const Description = styled.span`
  width: 100%;
  font-size: 17px;
  line-height: 1.5;
  padding: 0 30px 30px 30px;
  white-space: pre-line;
  font-family: 'Noto Sans KR', 'Arial', sans-serif;
  text-align: center;
`;

const ButtonBox = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  gap: 20px;
  padding-top: 20px;
`;

const SkipButton = styled.button`
  font-weight: 500;
  font-size: 16px;
  width: 140px;
  padding: 10px;
  margin-top: 10px;
  background-color: #fff;
  justify-content: center;
  color: #115de6;
  border: 1px solid #115de6;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background-color: #f8fbff;
  }
`;

const ConfirmButton = styled.button`
  font-weight: 500;
  font-size: 16px;
  width: 140px;
  padding: 10px;
  margin-top: 10px;
  background-color: #115de6;
  justify-content: center;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background-color: #0056b3;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 30px 20px 30px;
`;

const Label = styled.div`
  font-size: 18px;
  color: #94a2b8;
  font-weight: 400;
  width: 140px;
  text-align: center;
`;

const Input = styled.input`
  font-size: 20px;
  color: #2d3748;
  border: 1px solid #94a2b8;
  border-radius: 4px;
  padding: 4px 8px;
  width: 70%;

  &:focus {
    outline: none;
    border-color: #3182ce;
  }

  &::placeholder {
    color: #94a2b8;
    font-size: 14px;
  }
`;

const Title = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  padding-bottom: 20px;
  margin-top: -15px;
`;
