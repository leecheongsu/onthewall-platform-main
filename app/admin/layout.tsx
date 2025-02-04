'use client';
import React, { useEffect } from 'react';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { useDesignStore } from '@/store/design';
import { KEY } from '@/constants/globalDesign';

type Props = {
  children: React.ReactNode;
};

function layout({ children }: Props) {
  const router = useRouter();
  const { isLogin, status, email } = useUserStore();
  const { setGlobalDesignData } = useDesignStore((state) => state);
  const fetchData = async () => {
    setGlobalDesignData(KEY);
  };
  useEffect(() => {
    if (!isLogin) {
      // 로그인이 되어있지 않다면 로그인 페이지로 이동
      router.push('/admin/account/sign-in');
    } else {
      // 로그인이 되어있다면
      if (email !== 'support@gdcomm.io') {
        // 권한이 owner가 아니라면
        router.push('/main');
      }
    }
    fetchData();
  }, []);
  return <div>{children}</div>;
}

export default layout;
