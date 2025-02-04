'use client';

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import ModalBox from '@/components/Modal';
import WarningIcon from '@/images/icons/Wanring';
import FormInput from '@/components/FormInput';
import CheckIcon from '@/images/icons/Check';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { isValidEmail } from '@/utils/validation';
import { useUserStore } from '@/store/user';
import { useProjectStore } from '@/store/project';
import { useDesignStore } from '@/store/design';
import { projectAccountApis } from '@/api/project';
import { AuthErrorHandler } from '@/api/config';
import { platformAccountApis, platformManageApis } from '@/api/platform';
import SocialLoginButtons from '@/components/account/sign/button/social';
import Tabs from '@mui/material/Tabs';
import { Tab } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Page() {
  const { login } = useUserStore();
  const { i18n, t } = useTranslation();

  const color = useDesignStore((state) => state.theme);

  const { projectId, projectUrl, fetchProjectDataByUrl, tier } = useProjectStore();

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

  const [selectedTab, setSelectedTab] = useState(0);

  const onOpen = () => {
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setError(false);
  };

  useEffect(() => {
    if (projectUrl) {
      fetchProjectDataByUrl(projectUrl);
    }
  }, [projectUrl, fetchProjectDataByUrl]);

  useEffect(() => {
    const findPw = () => {
      if (!findEmail || (findEmail && !isValidEmail(findEmail))) {
        return;
      }

      projectAccountApis
        .findPw(projectId, findEmail)
        .then((res) => {
          const apiRes = res.data as ApiResponse;
          if (apiRes.meta.ok) {
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

    const adminFindPw = () => {
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
          className: 'btn_submit',
          onClick: selectedTab === 0 ? findPw : adminFindPw
        }
      });
    }
  }, [findEmail, isOpen, projectId, selectedTab]);

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

    const Icon = styled(CheckIcon)<{ color?: any }>`
        width: 30%;
        height: 30%;
        color: ${(props) => props.color};
    `;

    const Text = styled.span`
        margin-top: 0.75rem;
    `;

    return (
      <Box>
        <Icon color={color.primary} />
        <Text>
          {t('I sent you a password initialization email.')}
          <br />
          {t('Please check your email.')}
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

  const adminSignIn = () => {
    try {
      projectAccountApis.adminSignIn(projectId, formData)
        .then(async (res) => {
          if (res.meta.ok) {
            await login(res.data as UserInfo, false);

            const { projects } = res.data as UserInfo;

            if (projects.some(project => project.id === projectId)) {
              router.push(`/${projectUrl}/manage`);
            } else {
              const isConfirm = window.confirm(i18n.t('You are not authorized to access this page. Do you want to go to your project page?'));
              if (isConfirm) {
                const projectId = projects[0].id;
                const anotherRes = await platformManageApis.getProjectDataById(projectId);
                const anotherApiRes = anotherRes.data as ApiResponse;
                if (anotherApiRes.meta.ok) {
                  const { projectUrl: anotherProjectUrl } = anotherApiRes.data;

                  router.push(`/${anotherProjectUrl}/manage`);
                }
              }
            }
          }
        });
    } catch (e) {
      console.error('Project Admin SignIn : ', e);
      AuthErrorHandler(e);
    }
  };

  const generalSignIn = () => {
    try {
      projectAccountApis.signIn(projectId, formData)
        .then(async (res) => {
          if (res.meta.ok) {
            await login(res.data as UserInfo, true);

            const { projects } = res.data as UserInfo;

            if (projects.some(project => project.id === projectId)) {
              router.push(`/${projectUrl}/main`);
            } else {
              const isConfirm = window.confirm(i18n.t('You are not authorized to access this page. Do you want to go to your project page?'));
              if (isConfirm) {
                const projectId = projects[0].id;
                const anotherRes = await platformManageApis.getProjectDataById(projectId);
                const anotherApiRes = anotherRes.data as ApiResponse;
                if (anotherApiRes.meta.ok) {
                  const { projectUrl: anotherProjectUrl } = anotherApiRes.data;

                  router.push(`/${anotherProjectUrl}/manage`);
                }
              }
            }
          }
        });
    } catch (e) {
      console.error('Project User SignIn : ', e);
      AuthErrorHandler(e);
    }
  };

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

    selectedTab === 0 ? generalSignIn() : adminSignIn();
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSignInButton();
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <>
      <FormContainer>
        <FormBox>
          <Title>{t('Sign In')}</Title>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{ width: '100%' }}
            variant="fullWidth"
          >
            <Tab
              icon={<PersonIcon />}
              label={t('일반유저')}
              iconPosition="start"
              sx={{ width: '50%' }}
            />
            <Tab
              icon={<AdminPanelSettingsIcon />}
              label={t('관리자')}
              iconPosition="start"
              sx={{ width: '50%' }}
            />
          </Tabs>
          <FormInput
            name="email"
            value={formData.email}
            placeholder={selectedTab === 0 ? t('Email') : t('Admin Email')}
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
            <SignUpButton onClick={() => router.push(`/${projectUrl}/account/sign-up`)}>
              {t('Sign Up')}
            </SignUpButton>
          </Box>
          {selectedTab !== 0 && (
            <>
              <div>
                <SocialLoginButtons byPath="project" />
              </div>
            </>
          )}
        </FormBox>
      </FormContainer>
      <ModalBox state={isOpen} setState={onClose} modalConf={modalConf} size={isNext ? 'md' : 'lg'}>
        {!isNext ? FindPw1() : FindPw2()}
      </ModalBox>
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


