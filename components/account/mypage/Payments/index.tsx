import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { useUserStore } from '@/store/user';
import moment from 'moment';
import priceToString from '@/utils/priceToString';
import { useProjectStore } from '@/store/project';
import { getOrderList, getOrderListRealtime } from '@/api/firestore/getOrder';
import getMaxExhibitionByValue from '@/utils/getMaxExhibition';
import { unsubscribe } from 'diagnostics_channel';
import { useTranslation } from 'react-i18next';
type Props = {};

function LoginInfo({}: Props) {
  const { i18n, t } = useTranslation();
  const { email, countryCodeText } = useUserStore((state) => state);
  const { projectId } = useProjectStore((state) => state);
  const [orders, setOrders] = useState<any[]>([]);
  /**
   * 국가 코드
   * @default 'US'
   * @type {string}
   * @example 'KR' 국내 결제
   * @example 'US' 해외 결제(페이팔)
   * @example 'MY' 말레이시아 시연용
   */
  const [contryCode, setCountryCode] = useState<string>('US');

  const DUMMY_ORDERS = [
    {
      paidAt: new Date('2024-05-01'),
      price: 10000,
      numberOfExhibition: 30,
      plan: 'monthly',
      status: 'completed',
    },
    {
      paidAt: new Date('2021-04-01'),
      price: 10000,
      numberOfExhibition: 30,
      plan: 'monthly',
      status: 'completed',
    },
    {
      paidAt: new Date('2021-03-01'),
      price: 10000,
      numberOfExhibition: 30,
      plan: 'monthly',
      status: 'completed',
    },
    {
      paidAt: new Date('2021-03-01'),
      price: 10000,
      numberOfExhibition: 30,
      plan: 'monthly',
      status: 'fail',
    },
  ];

  useEffect(() => {
    let unsubscribe = () => {};
    if (projectId) {
      unsubscribe = getOrderListRealtime(projectId, (res: any) => {
        setOrders(res);
      });
    }
    return () => {
      unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    setCountryCode(countryCodeText);
  }, [countryCodeText]);

  const getStatus = useCallback(
    (status: string) => {
      if (status === 'paid') {
        return 'Completed';
      } else if (status === 'cancelled') {
        return 'Cancelled';
      } else if (status === 'reserved') {
        return 'Reserved';
      } else if (status === 'failed') {
        return 'Failed';
      } else if (status === 'none') {
        return 'None';
      } else if (status === 'requested') {
        // 빌링키 발급 요청
        return 'Requested';
      } else {
        return 'Failed';
      }
    },
    [orders]
  );

  const getPlan = useCallback(
    (plan: number) => {
      if (plan === 1) {
        return 'Monthly';
      } else if (plan === 12) {
        return 'Annual';
      }
    },
    [orders]
  );

  const getPayDate = useCallback(
    (status: string, order: any) => {
      switch (status) {
        case 'reserved':
          return moment.unix(order.startAt.seconds).format('YYYY-MM-DD HH:mm');
        case 'cancelled':
          // return moment.unix(order.revoked_at).format('YYYY-MM-DD HH:mm');
          return moment.unix(order.startAt.seconds).format('YYYY-MM-DD HH:mm');
        case 'paid':
          return moment.unix(order.paid_at).format('YYYY-MM-DD HH:mm');
        case 'failed':
          return moment.unix(order.startAt.seconds).format('YYYY-MM-DD HH:mm');
        default:
          return moment.unix(order.startAt.seconds).format('YYYY-MM-DD HH:mm');
      }
    },
    [orders]
  );

  const getOriginalPrice = useCallback(
    (order: any) => {
      const customData = JSON.parse(order.custom_data);
      return priceToString(customData.amount);
    },
    [orders]
  );

  return (
    <Container>
      <Header>{t('Payments')}</Header>
      <Body>
        <Contents>
          {orders
            .filter(
              (order) =>
                order.status !== undefined &&
                order.status !== 'none' &&
                order.status !== 'requested' &&
                // 관리자 설정인 경우 제외
                order.status !== 'custom' &&
                // 빌링키 발급인 경우 제외(페이팔)
                !(order.plan !== 'free' && order.amount === 0)
            )
            .map((order) => (
              <OrderItem key={order.id}>
                <Top>
                  <PayDate>{getPayDate(order.status, order)}</PayDate>
                  <Status>{t(`${getStatus(order.status)}`)}</Status>
                </Top>
                <Details>
                  <Row>
                    <Label>{t('Plan')}</Label>
                    <Value>{t(`${getPlan(order.payPeriod)}`)}</Value>
                  </Row>
                  <Row>
                    <Label>{t('Number of Exhibitions')}</Label>
                    <Value>{getMaxExhibitionByValue(order.plan)}</Value>
                  </Row>
                  <Row>
                    <Label>{t('Cost')}</Label>
                    <Value>
                      {order.pay_method === 'paypal' ? '$' : '₩'} {priceToString(order.amount ?? order.price)}
                      {priceToString(order.amount ?? order.price) !== getOriginalPrice(order) && (
                        <StrikeThroughNum>
                          {order.isUpgrade === true &&
                            `${order.pay_method === 'paypal' ? '$' : '₩'} ${getOriginalPrice(order)}`}
                        </StrikeThroughNum>
                      )}
                    </Value>
                  </Row>
                </Details>
              </OrderItem>
            ))}
        </Contents>
      </Body>
    </Container>
  );
}

export default LoginInfo;
const Container = styled.div`
  padding: 26px 40px;
`;
const Header = styled.div`
  font-size: 20px;
  font-weight: bold;
  line-height: 1.33;
  letter-spacing: -0.02em;
  color: #2d3748;
  margin-bottom: 24px;
  border-bottom: 1px solid #3a4454;
  padding-bottom: 8px;
`;
const Contents = styled.div``;
const Body = styled.div`
  margin-top: 24px;
`;

const OrderItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 16px;
  height: 36px;
  gap: 12px;
  border: 1px solid #ecf0f6;
  padding: 22px 28px;
  height: 170px;
`;
const PayDate = styled.div`
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #2d3748;
  font-weight: 600;
`;
const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const Status = styled.div`
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #2d3748;
  font-weight: 600;
`;
const Details = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
`;

const Label = styled.div`
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #94a2b8;
  font-weight: 500;
`;

const Value = styled.div`
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #2d3748;
`;

const StrikeThroughNum = styled.span`
  text-decoration: line-through;
  color: #94a2b8;
  font-size: 14px;
  font-weight: 400;
  margin-left: 4px;
`;
