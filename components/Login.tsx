'use client';

import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/Button';
import ModalBox from '@/components/Modal';
import WarningIcon from '@/images/icons/Wanring';
import FormInput from '@/components/FormInput';
import CheckIcon from '@/images/icons/Check';
import { useRouter } from 'next/navigation';
import styled from '@emotion/styled';
import { isValidEmail } from '@/utils/validation';
import { useUserStore } from '@/store/user';
import { useProjectStore } from '@/store/project';
import { projectAccountApis } from '@/api/project';
import { AuthErrorHandler } from '@/api/config';
import { platformManageApis } from '@/api/platform';
import SocialLoginButtons from '@/components/account/sign/button/social';
import { ACCESS_BUSINESS_AND_ABOVE } from '@/constants/acess';

export default function Page() {
  const { t } = useTranslation();

  const { projectId, projectUrl, fetchProjectDataByUrl, tier } = useProjectStore();

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
    const onClickCheck = () => {
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
                },
              },
            });
          }
        })
        .catch((e) => {
          alert(e.message);
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
  }, [findEmail, isOpen, projectId]);

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
          I sent you a password reset email.
          <br />
          Please check your mail.
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

    projectAccountApis
      .signIn(projectId, formData)
      .then(async (res) => {
        if (res.meta.ok) {
          const { paymentStatus, projects } = res.data as UserInfo;

          await login(res.data as UserInfo);

          // 플랜을 선택하지 않은 경우 예외처리
          if (paymentStatus.paid === false) {
            router.push('/account/payment');
            return;
          }

          const filtered = projects.filter((v) => v.status === 'admin');

          if (!res.data?.isProjectUser) {
            // 프로젝트 유저가 아닌 경우
            if (filtered.some((project) => project.status === 'admin')) {
              // admin이 하나라도 있으면 라우팅 시켜줌
              const isAdminHere = filtered.some((project) => project.id === projectId);
              if (!isAdminHere) {
                const yes = confirm(
                  'You are not authorized to access this page. Do you want to go to your project page?'
                );
                if (yes) {
                  const projectId = filtered[0].id;
                  const anotherRes = await platformManageApis.getProjectDataById(projectId);
                  const anotherApiRes = anotherRes.data as ApiResponse;
                  if (anotherApiRes.meta.ok) {
                    const { projectUrl: anotherProjectUrl, tier } = anotherApiRes.data;

                    if (!ACCESS_BUSINESS_AND_ABOVE.includes(tier)) {
                      router.push(`/${anotherProjectUrl}/manage`);
                    } else {
                      router.push(`/${anotherProjectUrl}/main`);
                    }
                  }
                } else {
                  router.push('/main');
                }
              } else {
                router.push(`/${projectUrl}/main`);
              }
            }
          } else {
            // 프로젝트 유저인 경우
            router.push(`/${projectUrl}/main`);
          }
        }
      })
      .catch((e) => {
        AuthErrorHandler(e);
        console.error('Project User SignIn : ', e);
      });
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSignInButton();
    }
  };

  return (
    <>
      <div className="form_container">
        <form className="form_box_sm">
          <span className="title pb-3">Welcome Back</span>
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
          <hr className="text-metal_light h-px w-full mt-2 border-dotted" />
          <div className="flex flex-row mt-4 gap-3 w-full items-center">
            <Button type="button" className="btn_text text-metal_light flex-1" onClick={onOpen}>
              {t('Forget Password?')}
            </Button>
            <Button
              type="button"
              className="btn_text text-main_blue border-l border-l-main_blue pl-2 flex-1"
              onClick={() => router.push(`/${projectUrl}/account/sign-up`)}
            >
              {t('Sign Up')}
            </Button>
          </div>
          {tier !== 'enterprise' && (
            <>
              <div>
                <SocialLoginButtons byPath="project" />
              </div>
            </>
          )}
        </form>
      </div>
      <ModalBox state={isOpen} setState={onClose} modalConf={modalConf} size={isNext ? 'md' : 'lg'}>
        {!isNext ? FindPw1() : FindPw2()}
      </ModalBox>
    </>
  );
}
