import React from 'react';

// lib
import { useTranslation } from 'react-i18next';

// mui + styles
import styled from '@emotion/styled';
import { Modal } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

type Props = {
  open: boolean;
  onClose: () => void;
};

function Translation({ open, onClose }: Props) {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
    sessionStorage.setItem('translation', 'true');
  };
  return (
    <Modal open={open}>
      <Container>
        <Box>
          <CloseButton onClick={handleClose}>
            <CloseIcon
              sx={{
                color: '#212121',
              }}
            />
          </CloseButton>
          <Title>
            <WarningAmberRoundedIcon
              color="primary"
              sx={{
                fontSize: 40,
                color: '#0d4cc1',
              }}
            />
            {t('Caution')}
          </Title>
          <p>
            {t(
              '이 사이트는 번역 시스템을 이용하여 다국어 지원을 하고 있습니다. \n 번역 시스템을 이용한 기계 번역이므로 정확하지 않을 수 있으며 번역 전 한국어 페이지의 내용과 번역 후의 내용이 다를 수 있으므로 이점에 주의하여 주시기 바랍니다.'
            )}
          </p>
          <CustomButton fullWidth variant="contained" color="primary" onClick={handleClose}>
            {t('입장하기')}
          </CustomButton>
        </Box>
      </Container>
    </Modal>
  );
}

export default Translation;

const Container = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  max-width: 500px;
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  :focus-visible {
    outline: none;
  }
  @media (max-width: 768px) {
    width: 90%;
  }
`;

const Box = styled.div`
  position: relative;
  padding: 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  p {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    word-break: keep-all;
    word-wrap: break-word;
    white-space: pre-line;
    text-align: center;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: #0d4cc1;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
`;

const CustomButton = styled(Button)`
  background-color: #0d4cc1;
  :hover {
    background-color: #0d4cc1;
  }
`;
