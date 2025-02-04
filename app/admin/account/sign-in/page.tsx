'use client';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import Button from '@/components/Button';
import WarningIcon from '@/images/icons/Wanring';
import FormInput from '@/components/FormInput';
import CheckIcon from '@/images/icons/Check';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { isValidEmail } from '@/utils/validation';
import { useUserStore } from '@/store/user';
import { useCookies } from '@/hooks/useCookies';
import { useProjectStore } from '@/store/project';
import { useTranslation } from 'react-i18next';
import { platformAccountApis } from '@/api/platform';
import { AuthErrorHandler } from '@/api/config';
import ModalBox from '@/components/Modal';

interface Props {}

export default function Page({}: Props) {
  const { t } = useTranslation();
  const { login } = useUserStore();

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [findEmail, setFindEmail] = useState('');
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const [modalConf, setModalConf] = useState({});

  const onClose = () => {
    setIsOpen(false);
    setError(false);
  };

  useEffect(() => {
    const onClickCheck = () => {
      if (!findEmail || (findEmail && !isValidEmail(findEmail))) {
        return;
      }

      platformAccountApis
        .findPw({ email: findEmail })
        .then((res) => {
          console.log('awoiejfaw', res);
          setIsNext(true);
          setModalConf({
            title: 'Find Password',
            blindFilter: true,
            handleCenterButton: {
              type: 'button',
              title: 'Close',
              className: 'btn_outline w-1/2',
              onClick: () => {
                onClose();
                setIsNext(false);
                setFindEmail('');
              },
            },
          });
        })
        .catch((e) => {
          AuthErrorHandler(e);
        });
    };

    if (isOpen) {
      setModalConf({
        title: t('Find Password'),
        blindFilter: true,
        handleCenterButton: {
          type: 'submit',
          title: t('Check'),
          className: 'btn_submit',
          onClick: onClickCheck,
        },
      });
    }
  }, [findEmail, isOpen]);

  const FindPw1 = () => {
    const ErrorBlock = styled.div`
      font-size: 12px;
      display: flex;
      color: red;
      justify-content: flex-start;
      align-items: center;
      gap: 5px;
      margin-bottom: 10px;
      width: calc(100% * 2 / 3);
    `;

    const Icon = styled(WarningIcon)`
      width: 0.75rem;
      height: 0.75rem;
      margin-top: 0.25rem;
    `;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setFindEmail(value);
      setError(value.length > 0 && !isValidEmail(value));
    };

    return (
      <>
        <FormInput
          label={t('Subscribed E-mail')}
          name="email"
          width="calc(100% * 2/3)"
          placeholder={t('Email')}
          value={findEmail}
          onChange={handleChange}
          className={error ? 'error' : ''}
        />
        {error && (
          <ErrorBlock>
            <Icon />
            <span>{t('The email account you entered does not exist.')}</span>
          </ErrorBlock>
        )}
      </>
    );
  };

  const FindPw2 = () => {
    const Box = styled.div`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
    `;

    const Icon = styled(CheckIcon)`
      width: 30%;
      height: 30%;
      color: #115de6;
    `;

    const Text = styled.span`
      margin-top: 0.75rem;
    `;

    return (
      <Box>
        <Icon />
        <Text>
          {t('I sent you a password initialization email.')}
          <br />
          {t('Please check your mail.')}
        </Text>
      </Box>
    );
  };

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSignInButton = () => {
    if (formData.email === null || formData.email === '') {
      return alert(t('Please enter your email address'));
    }

    if (!isValidEmail(formData.email)) {
      return alert(t('Please check your email form'));
    }

    if (formData.password === null || formData.password === '') {
      return alert(t('Please enter your password'));
    }

    platformAccountApis
      .signIn(formData)
      .then((res) => {
        if (res.meta.ok) {
          const { status, email } = res.data as UserInfo;

          login(res.data as UserInfo);
          if (email === 'support@gdcomm.io') {
            router.push('/admin/manage/overview');
          }
        }
      })
      .catch((e) => {
        console.log('Admin Sign in : ', e);
        AuthErrorHandler(e);
      });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSignInButton();
    }
  };

  return (
    <>
      <Container className="form_container">
        <form className="form_box_sm">
          <span className="title pb-3">{t('Admin')}</span>
          <FormInput
            name="email"
            value={formData.email}
            placeholder={t('Email')}
            onChange={handleChange}
            required
            onKeyDown={handleKeyDown}
          />
          <FormInput
            type="password"
            name="password"
            value={formData.password}
            placeholder={t('Password')}
            onChange={handleChange}
            required
            onKeyDown={handleKeyDown}
          />
          <Button type="button" className="btn_submit" onClick={handleSignInButton}>
            {t('Sign In')}
          </Button>
        </form>
      </Container>
      <ModalBox state={isOpen} setState={onClose} modalConf={modalConf} size={isNext ? 'md' : 'lg'}>
        {!isNext ? FindPw1() : FindPw2()}
      </ModalBox>
    </>
  );
}
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding-bottom: 100px;
`;
