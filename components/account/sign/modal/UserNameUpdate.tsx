import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import styled from '@emotion/styled';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { Project } from '@/api/firestore/getProject';
import { ACCESS_BUSINESS_AND_ABOVE } from '@/constants/acess';
import { useTranslation } from 'react-i18next';
import { platformAccountApis } from '@/api/platform';
import Notice from '@/images/icons/Notice';

interface Props {
  state: boolean;
  setState: (state: boolean) => void;
}

function UserNameUpdateModal({ state, setState }: Props) {
  const { t } = useTranslation();
  const { uid, projects, paymentStatus, updateInfo } = useUserStore();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const onClose = () => {
    setState(false);
  };

  const handleRoute = () => {
    if (paymentStatus.paid === false) {
      router.push('/account/payment');
      return;
    }

    if (projects.some((v) => v.status === 'admin')) {
      router.push('/main');
    } else {
      Project(projects[0].id).then((res) => {
        if (res) {
          if (!ACCESS_BUSINESS_AND_ABOVE.includes(res.tier)) {
            router.push(`/${res.projectUrl}/manage`);
          } else {
            router.push(`/${res.projectUrl}/main`);
          }
        } else {
          router.push('/main');
        }
      });
    }
    onClose();
  };

  const handleSkipButton = () => {
    const isConfirm = window.confirm(t('Would you like to do it later?'));
    if (isConfirm) {
      handleRoute();
    }
  };

  const handleConfirmButton = () => {
    if (!userName.trim()) {
      return alert(t('Please fill in all required fields.'));
    }

    if (userName.length > 20) {
      return alert(t('Name is too long'));
    }

    platformAccountApis.modifyUserName(uid, userName).then((isDone) => {
      if (isDone) {
        updateInfo('userName', userName);
        alert(t('User name has been successfully changed.'));
        handleRoute();
      } else {
        return alert(t('Please try again a few minutes later.'));
      }
    });
  };

  return (
    <Modal open={state} onClose={onClose}>
      <Container>
        <Box>
          <NoticeBox>
            <Notice />
          </NoticeBox>
          <Title>{t('Update Your Username Name')}</Title>
          <Description>
            {t(
              `To provide you with a better experience,\nplease take a moment to update your channel name.\nWe appreciate your time, and we’re excited to have you back!`
            )}
          </Description>
          <Row>
            <Label>{t('Username')}</Label>
            <Input
              name="userName"
              value={userName}
              type="text"
              placeholder={t('User Name')}
              required
              onChange={(e) => setUserName(e.target.value)}
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

export default UserNameUpdateModal;

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
  width: 20%;
  text-align: left;
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
