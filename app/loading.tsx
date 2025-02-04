'use client';

// Loading 컴포넌트 코드
import styled from '@emotion/styled';
import { LinearProgress } from '@mui/material';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 80%;
  position: relative;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgb(255, 255, 255);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

interface Props {
  isSpinner?: boolean;
}

export default function Loading({ isSpinner }: Props) {
  return (
    <Wrapper>
      {isSpinner ? (
        <SpinnerContainer>
          <Spinner />
        </SpinnerContainer>
      ) : (
        <Container>
          <LinearProgress />
        </Container>
      )}
    </Wrapper>
  );
}
