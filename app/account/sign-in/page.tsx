'use client';
import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import ModalBox from '@/components/Modal';
import WarningIcon from '@/images/icons/Wanring';
import FormInput from '@/components/FormInput';
import CheckIcon from '@/images/icons/Check';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { isValidEmail } from '@/utils/validation';
import { useUserStore } from '@/store/user';
import { useProjectStore } from '@/store/project';
import { Project } from '@/api/firestore/getProject';
import { useTranslation } from 'react-i18next';
import { platformAccountApis } from '@/api/platform';
import { AuthErrorHandler } from '@/api/config';
import SocialLoginButtons from '@/components/account/sign/button/social';
import { ACCESS_BUSINESS_AND_ABOVE } from '@/constants/acess';
import UserNameUpdateModal from '@/components/account/sign/modal/UserNameUpdate';


interface Props {
}

export default function Page({}: Props) {
  const { t } = useTranslation();
  const { login, updateInfo, updateObjInfo } = useUserStore();
  const { updateInfo: updateProjectInfo } = useProjectStore();

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [findEmail, setFindEmail] = useState('');
  const [error, setError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const [modalConf, setModalConf] = useState({});

  const [isOldUser, setIsOldUser] = useState(false);

  const onOpen = () => {
    setIsOpen(true);
  };

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
          if (res) {
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
                }
              }
            });
          }
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
          className: 'btn_submit text-base font-medium',
          onClick: onClickCheck
        }
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
      [name]: value
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
      .then(async (res) => {
        if (res.meta.ok) {
          const { status, projects, paymentStatus } = res.data as UserInfo;

          if (projects.length === 0) {
            alert('No projects. Please contact the administrator');
            return;
          }

          const userData = res.data as UserInfo;

          await login(userData);
          updateProjectInfo('projectId', projects[0].id);

          if (userData.survey.referrer === 'old_user') {
            setIsOldUser(true);
            return;
          }

          // 플랜을 선택하지 않은 경우 예외처리
          if (paymentStatus.paid === false) {
            router.push('/account/payment');
            return;
          }

          if (projects.some((project) => project.status === 'admin')) {
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
        }
      })
      .catch((e) => {
        console.log('Owner Sign in : ', e);
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
      <FormContainer>
        <FormBox>
          <Title>{t('Sign In')}</Title>
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
          <SignInButton onClick={handleSignInButton}>
            {t('Sign In')}
          </SignInButton>
          <StyledHR />
          <Box>
            <FindPwButton onClick={onOpen}>
              {t('Forget Password?')}
            </FindPwButton>
            <SignUpButton onClick={() => router.push('/account/sign-up')}>
              {t('Sign Up')}
            </SignUpButton>
          </Box>
          <div>
            <SocialLoginButtons byPath="platform" />
          </div>
        </FormBox>
      </FormContainer>
      <ModalBox state={isOpen} setState={onClose} modalConf={modalConf} size={isNext ? 'md' : 'lg'}>
        {!isNext ? FindPw1() : FindPw2()}
      </ModalBox>
      <UserNameUpdateModal state={isOldUser} setState={setIsOldUser} />
    </>
  );
}

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const FormBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-radius: 10px;
    box-sizing: border-box;
    width: 350px;
    height: auto;
    position: relative;
`;

const Title = styled.span`
    font-size: 24px;
    line-height: 32px;
    padding-bottom: 20px;
`;

const SignInButton = styled.button`
    font-weight: 400;
    font-size: 14px;
    width: 100%;
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

const StyledHR = styled.hr`
    height: 1px;
    width: 100%;
    margin-top: 0.5rem;
    border-style: dotted;
    border-width: 0;
    border-top-width: 1px;
    color: #9d9b9b;
`;

const Box = styled.div`
    display: flex;
    flex-direction: row;
    margin-top: 1rem;
    width: 100%;
    align-items: center;
`;

const FindPwButton = styled.button`
    font-size: 14px;
    background: none;
    border: none;
    color: #9d9b9b;
    flex: 1;
    cursor: pointer;
    padding: 0;
`;

const SignUpButton = styled.button`
    font-size: 14px;
    background: none;
    border: none;
    flex: 1;
    cursor: pointer;
    color: #115de6;
    border-left: 1px solid #0056b3;
`;

