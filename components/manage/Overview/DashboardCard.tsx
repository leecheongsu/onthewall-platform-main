import React from 'react';
import styled from '@emotion/styled';
import InfoIcon from '@mui/icons-material/Info';
import { Tooltip } from '@mui/material';
type Props = {
  header?: string;
  type?: 'number' | 'fraction'; // 숫자, 분수
  value?: Array<number>;
  imageSrc?: string;
  description?: string;
  increase?: boolean;
  help?: string;
};

function DashboardCard({
  header = 'Active exhibitions',
  type = 'fraction',
  value = [12, 30],
  imageSrc = '',
  description = '8.5% Up from yesterday',
  increase = true,
  help,
}: Props) {
  return (
    <Container>
      <Top>
        <Left>
          <Header>{header}</Header>
          <Info>
            <Value1>{value[0].toLocaleString()}</Value1>
            {type === 'fraction' && <Value2> / {value[1].toLocaleString()}</Value2>}
            <Tooltip title={help}>
              <InfoIcon />
            </Tooltip>
          </Info>
        </Left>
        <Right>
          <Image src={imageSrc} />
        </Right>
      </Top>
    </Container>
  );
}

export default DashboardCard;

const Container = styled.div`
  width: 100%;
  padding: 30px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 5px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.h2`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #88909c;
`;

const Info = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  font-size: 28px;
  font-weight: 500;
  color: #2d3748;
`;

const Value1 = styled.span`
  font-size: 28px;
  font-weight: 500;
  color: #202224;
  line-height: 1;
`;
const Value2 = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #202224;
  line-height: 1.2;
`;

const Description = styled.div`
  font-size: 16px;
  color: #12163c;
  font-weight: 600;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0px;
  & svg {
    width: 18px;
    height: 18px;
    color: #88909c;
    margin-left: 5px;
    align-self: start;
  }
`;

const Right = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Image = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
`;

const Bottom = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 6px;
`;
