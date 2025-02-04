// 그냥 카드 컴포넌트에서 statistics는 커스텀 요소가 많아 따로 만들어서 사용
// date range와 select option이 있음.
import React from 'react';
import styled from '@emotion/styled';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import DateRange from '@/components/DateRange';
import DownloadIcon from '@mui/icons-material/Download';
import Button from '@mui/joy/Button';
import { Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

type Props = {
  header: string;
  children: React.ReactNode;
  selectOptions?: { value: string; label: string }[];
  selectState?: [string, React.Dispatch<React.SetStateAction<string>>];
  fromDate: any;
  setFromDate: React.Dispatch<React.SetStateAction<any>>;
  toDate: any;
  setToDate: React.Dispatch<React.SetStateAction<any>>;
  onDownloadClick: () => void;
};

function Card({
  header,
  children,
  selectOptions,
  selectState,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  onDownloadClick,
}: Props) {
  const { i18n } = useTranslation();
  return (
    <Container>
      <Header>
        {header}
        <End>
          <StyledButton variant="plain" onClick={onDownloadClick}>
            <Tooltip title={i18n.t('Download Records by CSV')}>
              <DownloadIcon color="disabled" />
            </Tooltip>
          </StyledButton>
          <DateRange fromDate={fromDate} setFromDate={setFromDate} toDate={toDate} setToDate={setToDate} />
          {selectOptions && selectState && (
            <StyledSelect value={selectState[0]}>
              {selectOptions.map((option, idx) => (
                <Option value={option.value} onClick={() => selectState[1](option.value)} key={idx}>
                  {option.label}
                </Option>
              ))}
            </StyledSelect>
          )}
        </End>
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

const End = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const StyledSelect = styled(Select)`
  height: 40px;
  border-radius: 5px;
  border-color: #c4c4c4;
`;

const StyledButton = styled(Button)`
  padding: 0px;
  margin: 0px;
`;
