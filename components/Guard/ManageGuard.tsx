import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

type Props = {
  children: React.ReactNode;
};

const LoginGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { isLogin, status, paymentStatus, ownProjectIds } = useUserStore();
  const { projectId, projectUrl } = useProjectStore();

  useEffect(() => {
    if (!ownProjectIds.includes(projectId)) {
      alert("You don't have permission to access this project.");
      router.push(`/${projectUrl}`);
    }
  }, [isLogin, paymentStatus.paid, status]);

  return <>{children}</>;
};

export default LoginGuard;
