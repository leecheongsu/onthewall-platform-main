import React from 'react';
import styled from '@emotion/styled';
type Props = {
  header: string;
  children: React.ReactNode;
};

function Card({ header, children }: Props) {
  return (
    <Container>
      <Header>{header}</Header>
      <Content>{children}</Content>
    </Container>
  );
}

export default Card;

const Container = styled.div`
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const Header = styled.h2`
  padding: 16px;
  font-size: 16px;
  color: #202224;
  font-weight: 500;
  height: 56px;
  border-bottom: 1px solid #e2e8f0;
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;
