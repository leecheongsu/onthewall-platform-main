import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import WarningIcon from '@/images/icons/Wanring';
import CircleCheckIcon from '@/images/icons/CircleCheck';
import Button from '@mui/material/Button';
import styled from '@emotion/styled';
import FormInput from '@/components/FormInput';
import { matchBase64Hashes, sha512base64 } from '@/utils/hash';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { platformAccountApis } from '@/api/platform';

type Props = {
  config?: any;
};

export const WarningRegisterEmail = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full text-center -mt-7">
      <WarningIcon className="w-1/3 h-1/3 text-main_blue" />
      <span className="mt-3">{t('Email already exists.')}</span>
    </div>
  );
};

export const CompleteRegistration = ({ config }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [init, setInit] = useState({
    email: '',
    userName: '',
    isAdmin: false
  });

  useEffect(() => {
    setInit({ ...config });
  }, [config]);

  const handleStartButton = () => {
    if (init.isAdmin) {
      router.push('/account/sign-in');
    } else {
      router.push('/account/payment');
    }
  };

  return (
    <div className="form_container">
      <div className="form_box_sm">
        <CircleCheckIcon className="w-10 h-10 text-main_blue" />
        <span className="title">{t('Registration Complete')}</span>
        <span className="sub_title">{t('Thank you for joining our service.')}</span>
        <div className="mt-5 p-2 w-full border-1-gray">
          <table className="w-full">
            <tbody>
            <tr>
              <td className="pr-4">{t('E-mail')}</td>
              <td>{init.email}</td>
            </tr>
            <tr>
              <td className="pr-4">{t('Username')}</td>
              <td>{init.userName}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <Button type="button" className="btn_submit" onClick={handleStartButton}>
          {t('Get Started')}
        </Button>
      </div>
    </div>
  );
};

export const VerificationPhone = ({ config }: Props) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(179);
  const [verificationCode, setVerificationCode] = useState('');
  const [init, setInit] = useState({
    countryCode: '',
    phone: '',
    hashedCode: '',
    onVerified: () => {
    },
    onClose: () => {
    }
  });

  useEffect(() => {
    setInit({
      ...config
    });
  }, [config]);

  const handleCodeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (!/^\d*$/.test(value)) {
      return;
    }
    setVerificationCode(value);
  }, []);

  const handleRenewButton = async () => {
    try {
      platformAccountApis.sendVerificationCode(init.countryCode + init.phone).then((res) => {
        if (res.status === 200) {
          alert(t('A new verification code has been sent. Please check your phone and try again.'));
        } else {
          alert(t('Failed to send a new verification code. Please try again later.'));
        }
      });
    } catch (error) {
      console.error('Error sending verification code:', error);
      alert(t('An error occurred while sending the verification code. Please try again later.'));
    }
  };

  useEffect(() => {
    if (verificationCode.length === 6) {
      const hashingVerificationCode = sha512base64(verificationCode);
      if (matchBase64Hashes(init.hashedCode, hashingVerificationCode)) {
        const isConfirm = window.confirm(t('Verification code confirmed successfully! You can now proceed.'));
        if (isConfirm) {
          init.onVerified();
          init.onClose();
        }
      } else {
        alert(t('The verification code you entered is incorrect. Please try again.'));
      }
    }
  }, [verificationCode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
  };

  return (
    <>
      <CodeInputBox>
        <FormInput
          label={t('Enter the Verification Code')}
          width="75%"
          placeholder={t('Code')}
          name="verificationCode"
          value={verificationCode}
          onChange={handleCodeChange}
          maxLength={6}
        />
        <RenewButton type="button" onClick={handleRenewButton} variant="contained">
          {t('Renew')}
        </RenewButton>
      </CodeInputBox>
      <TimeoutBlock>
        <span>
          {t('Time Remaining')} : {`${formatTime(timeLeft)}`}
        </span>
      </TimeoutBlock>
    </>
  );
};

const RenewButton = styled(Button)`
    text-transform: capitalize;
    width: 25%;
    height: 50px;
    margin-top: 38px;
    font-size: 16px;
`;

const CodeInputBox = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0 20px 0 20px;
    gap: 10px;
`;

const TimeoutBlock = styled.div`
    display: flex;
    justify-content: left;
    margin-top: 10px;
`;
