import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Image from 'next/image';
import Kakao from '@/images/svg/kakao-circle.svg';
import Google from '@/images/svg/google-circle.svg';
import { platformAccountApis, platformManageApis } from '@/api/platform';
import { useUserStore } from '@/store/user';
import { useProjectStore } from '@/store/project';
import { useRouter, useSearchParams } from 'next/navigation';
import kakaoApis from '@/api/kakao';
import { getProjectUrl } from '@/api/firestore/getProject';
import googleApis from '@/api/google';
import { AuthErrorHandler } from '@/api/config';
import Loading from '@/app/loading';
import { useTranslation } from 'react-i18next';


interface Props {
  byPath: 'platform' | 'project' | string;
  curProjectId?: string;
}

function SocialLoginButtons({ byPath }: Props) {
  const { t } = useTranslation();
  const { login } = useUserStore();
  const { updateInfo, projectId, projectUrl } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  const accessLogin = async (email: string) => {
    try {
      const res = await platformAccountApis.getUser(email) as ApiResponse;

      if (res.meta.ok) {
        const { projects } = res.data as UserInfo;

        login(res.data as UserInfo);

        if (byPath === 'project') { // 프로젝트의 admin만 소셜로그인 가능함
          const isAdminHere = projects.some(project => project.id === projectId && project.status === 'admin');

          if (isAdminHere) {
            router.push(`/${projectUrl}/manage)`);
          } else {
            const isConfirm = confirm(t('You are not authorized to access this page. Do you want to go to your project page?'));
            if (isConfirm) {
              setIsLoading(true)
              const projectId = projects[0].id;
              const anotherRes = await platformManageApis.getProjectDataById(projectId);
              const anotherApiRes = anotherRes.data as ApiResponse;
              if (anotherApiRes.meta.ok) {
                const {
                  projectUrl: anotherProjectUrl
                } = anotherApiRes.data;

                setIsLoading(false)
                router.push(`/${anotherProjectUrl}/main`);
              }
            }
          }
        } else { // 플랫폼에서 유입
          router.push('/home');
        }
      }
    } catch (e) {
      console.error('Access Login Error : ', e);
      AuthErrorHandler(e);
    }
  };

  const handleKakaoClick = async () => {
    kakaoApis.authorized('/account/sign-in');
  };

  useEffect(() => {
    const code = params?.get('code');

    if (!code) return;

    console.log('code : ', code);

    const getKakaoUser = async (code: string) => {
      try {
        const res = await kakaoApis.getUserData(code, '/account/sign-in');
        const { email } = res.kakao_account;

        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());

        await accessLogin(email);
      } catch (e) {
        console.log('Kakao Get User Error : ', e);
        AuthErrorHandler(e);
      }
    };

    getKakaoUser(code);
  }, [params?.get('code')]);


  const handleGoogleClick = async () => {
    try {
      const userCredential = await googleApis.sign();

      if (userCredential && userCredential.user) {
        await accessLogin(userCredential.user.email!!);
      }
    } catch (e) {
      console.log('Google Click Error : ', e);
      AuthErrorHandler(e);
    }
  };

  if(isLoading) <Loading />;
  return (
    <Box>
      <Image
        src={Kakao}
        alt="kakao"
        onClick={handleKakaoClick}
      />
      <Image
        src={Google}
        alt="google"
        onClick={handleGoogleClick}
      />
    </Box>
  );
}

export default SocialLoginButtons;

const Box = styled.div`
    display: flex;
    flex-direction: row;
    padding-top: 15px;
    gap: 15px;
`;