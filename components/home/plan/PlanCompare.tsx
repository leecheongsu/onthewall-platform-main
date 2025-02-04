import React, { useEffect, useState } from 'react';

// data
import { comparePlan, compareDataKR, compareDataEN } from '@/constants/plan';

// store
import { useLanguageStore } from '@/store/language';

// style
import styled from '@emotion/styled';

// lib
import { useTranslation } from 'next-i18next';

// components
import CategoryTable from '@/components/home/plan/PlanCompareTable';
type Props = {};

const PlanCompare = (props: Props) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [data, setData] = useState<any>([]);
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    setWidth(document.documentElement.clientWidth);
  }, []);

  useEffect(() => {
    setData(language === 'kr' ? compareDataKR : compareDataEN);
  }, [language]);
  return (
    <>
      <Title>{t('Compare Plans')}</Title>
      <Box width={width}>
        <Table width={width}>
          <Thead>
            <Tr>
              <Th></Th>
              {comparePlan.map((item, index) => (
                <Th key={index}>{item}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((category: any, index: number) => (
              <CategoryTable key={index} category={t(category.category)} items={category.items} />
            ))}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

export default PlanCompare;

const Title = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const Box = styled.div<{ width: number }>`
  @media (max-width: 768px) {
    width: ${({ width }) => width}px;
    overflow-x: auto;
    padding: 0 20px;
  }
`;

const Table = styled.table<{ width: number }>`
  width: 100%;
  border-collapse: collapse;

  @media (max-width: 768px) {
    width: ${({ width }) => width * 1.5}px;
  }
`;

const Thead = styled.thead``;

const Th = styled.th`
  padding: 10px;
  font-weight: 700;
  text-align: center;
  width: 130px;
  &:first-child {
    width: 430px;
    @media (max-width: 768px) {
      width: 150px;
    }
  }
  @media (max-width: 768px) {
    width: 70px;
  }
`;

const Tbody = styled.tbody``;

const Tr = styled.tr``;
