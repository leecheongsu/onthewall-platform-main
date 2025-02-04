import React, { useEffect, useState } from 'react';
import Image from 'next/image';

// data
import { planDataKR, planDataEN } from '@/constants/plan';
import { PriceKR, PriceEN } from '@/constants/plan';

// lib
import { useTranslation } from 'next-i18next';

// style
import styled from '@emotion/styled';

// mui
import Button from '@mui/material/Button';

// icons
import User from '@/images/svg/user.svg';
import Polygon from '@/images/svg/polygon.svg';
import { useLanguageStore } from '@/store/language';
import Link from 'next/link';

interface Props {
  subscription: any;
  isModal?: boolean;
}

const PlanCard = ({ subscription, isModal }: Props) => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [width, setWidth] = useState<number>(0);
  const [data, setData] = useState<any>([]);
  const [price, setPrice] = useState<any>();
  useEffect(() => {
    setWidth(document.documentElement.clientWidth);
  }, []);

  useEffect(() => {
    setData(language === 'kr' ? planDataKR : planDataEN);
    const selectedPrice = language === 'kr' ? PriceKR : PriceEN;
    const priceType = subscription === 0 ? 'Monthly' : 'Annual';
    setPrice(selectedPrice[priceType]);
  }, [language, subscription]);

  return (
    <Container width={width}>
      {data?.map((data: any) => (
        <Card key={data.plan} width={width}>
          <div>
            <Plan>{data.plan}</Plan>

            <Price>
              {t('USD')} <span>{price[data.plan]}</span>
            </Price>
            {isModal ? null : (
              <Buttons>
                <SelectPlanButton fullWidth disabled={data.plan === 'API'} variant="contained">
                  {data.plan === 'Free' ? `${t('Try free for 1 years')}` : `${t('Select')}`}
                </SelectPlanButton>
              </Buttons>
            )}
            {data.plan === 'API' ? (
              <a target="_blank" href={data.plus} rel="noopener noreferrer">
                {t('Contact Us')}
              </a>
            ) : (
              <Add>{data.plus}</Add>
            )}

            <Explanation>
              {data.explanation.map((line: string, index: number) => (
                <p key={index}>{line}</p>
              ))}
            </Explanation>
          </div>
          {data.plan !== 'API' && (
            <Count>
              <p>
                <Image src={User} alt="User" />
                {data.exhibition} {t('Exhibition Space')}
              </p>
              <p>
                <Image src={Polygon} alt="Polygon" />
                {data.administrator} {t('Administrator')}
              </p>
            </Count>
          )}
        </Card>
      ))}
    </Container>
  );
};

export default PlanCard;

const Container = styled.div<{ width: number }>`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 30px;
  padding-top: 30px;
  margin-bottom: 10px;
  padding-bottom: 10px;

  @media (max-width: 768px) {
    display: flex;
    justify-content: flex-start;
    margin: 0 auto;
    padding: 20px 0;
    overflow-x: scroll;
    width: ${(props) => props.width - 20}px;
  }
`;

const Card = styled.div<{ width: number }>`
  display: flex;
  flex-direction: column;
  border: 1px solid #64748b;
  border-radius: 5px;
  padding: 30px 20px;
  &:hover {
    border: 1px solid #115de6;
    background-color: #fbfdff;
  }
  & a {
    text-align: center;
    font-size: 0.85rem;
    color: #115de6;
    margin-top: 20px;
    font-weight: bold;
    text-decoration: underline;
  }
  @media (max-width: 768px) {
    width: ${(props) => props.width - props.width / 2 + 50}px;
    flex-shrink: 0;
  }
`;

const Plan = styled.h3`
  font-size: 1.35rem;
  font-weight: bold;
  text-align: center;
  margin-top: 10px;
  margin-bottom: 5px;
`;

const SelectPlanButton = styled(Button)`
  text-transform: capitalize;
  font-size: 0.85rem;

  background-color: #115de6;
  &:hover {
    background-color: #fff;
    color: #115de6;
    box-sizing: border-box;
    box-shadow: 0 0 0 1px #115de6 inset;
  }
`;

const Price = styled.div`
  text-align: center;
  font-size: 0.85rem;
  margin-bottom: 30px;
  & span {
    font-size: 1.05rem;
    font-weight: bold;
    margin: 0 5px;
  }
`;

const Buttons = styled.div`
  text-align: center;
  margin: 15px 0;
`;

const Add = styled.p`
  font-size: 0.9rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Explanation = styled.div`
  margin-bottom: 60px;
  & p {
    font-size: 0.85rem;
    color: #64748b;
    line-height: 1.5;
  }
`;

const Count = styled.div`
  margin-top: auto;
  font-size: 0.8rem;
  color: #64748b;
  & p {
    display: flex;
  }
  & img {
    width: 15px;
    margin-right: 5px;
  }
`;
