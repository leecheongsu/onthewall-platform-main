import React, { useEffect } from 'react';
import Login from '@/components/Login';
import ManagePageHeader from '@/components/layouts/ManagePageHeader';
import Footer from '@/components/layouts/Footer';
import styled from '@emotion/styled';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';

type Props = {
  children: React.ReactNode;
};

const LoginGuard: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const { isLogin, status, paymentStatus, projects } = useUserStore();

  const [height, setHeight] = React.useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const footer = document.querySelector('footer')?.clientHeight || 0;
      setHeight(footer);
    };
    updateHeight();
  }, []);

  useEffect(() => {
    if (isLogin && status === 'general') {
      if (!paymentStatus.paid) {
        router.push('/account/payment');
      }
    }
  }, [isLogin, paymentStatus.paid, status]);

  return (
    <>
      {isLogin ? (
        <>{children}</>
      ) : (
        <Container>
          <ManagePageHeader />
          <Wrapper height={height}>
            <Login />
          </Wrapper>
          <Footer />
        </Container>
      )}
    </>
  );
};

export default LoginGuard;

const Container = styled.div`
  height: 100vh;
  margin: 0 auto;
  width: 100vw;
`;

const Wrapper = styled.div<{ height?: any }>`
  padding: 0 20px;
  padding-top: 60px;
  max-width: 1200px;
  width: 100vw;
  margin: 0 auto;
  min-height: calc(100vh - ${(props) => props?.height}px);
  display: flex;
  justify-content: center;
  align-items: center;
`;
