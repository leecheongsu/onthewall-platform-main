import React from 'react';
import styled from '@emotion/styled';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import DateRange from '@/components/DateRange';
type Props = {
  header: string;
  children: React.ReactNode;
  selectOptions?: { value: string; label: string }[];
  selectState?: [string, React.Dispatch<React.SetStateAction<string>>];
};

function Card({ header, children, selectOptions, selectState }: Props) {
  return (
    <Container>
      <Header>
        {header}
        {selectOptions && selectState && (
          <Select value={selectState[0]}>
            {selectOptions.map((option) => (
              <Option value={option.value} onClick={() => selectState[1](option.value)}>
                {option.label}
              </Option>
            ))}
          </Select>
        )}
      </Header>
      <Content>{children}</Content>
    </Container>
  );
}

export default Card;

const Container = styled.div`
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  width: 100%;
  overflow: hidden;
`;

const Header = styled.h2`
  padding: 16px;
  font-size: 16px;
  color: #202224;
  font-weight: 500;
  height: 56px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  select {
    border: none;
    background-color: transparent;
    font-size: 14px;
    color: #4b5563;
  }
`;
const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;
