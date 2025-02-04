'use client';

import React, { useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import moment from 'moment';
import { Button } from '@mui/material';
import { useProjectStore } from '@/store/project';
import Loading from '@/app/loading';
import { useTranslation } from 'react-i18next';
import { useOrderStore } from '@/store/order';
import axios from 'axios';
import { getPaidOrderByProjectId, getOrderByProjectIdRealtime, updateOrder } from '@/api/firestore/getOrder';
import { Timestamp } from 'firebase/firestore';
import PlanChangeButton from '@/components/account/mypage/Subscribe/PlanChange';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';
import { getProjectRealtime, updateProjectData } from '@/api/firestore/getProject';
type Props = {};

function Subscribe({}: Props) {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [orderId, setOrderId] = React.useState('');
  const {
    projectId,
    isExpired,
    subscriptionModel,
    exhibitionLimit,
    expiredAt,
    status,
    tier,
    fetchProjectDataById,
    fetchProjectDataStatus,
    updateInfo,
  } = useProjectStore((state) => state);
  const { uid } = useUserStore((state) => state);
  /**
   * 국가 코드
   * @default 'US'
   * @type {string}
   * @example 'KR' 국내 결제
   * @example 'US' 해외 결제(페이팔)
   * @example 'MY' 말레이시아 시연용
   */
  const [contryCode, setCountryCode] = useState<string>('US');

  useEffect(() => {
    setIsLoading(true);
    let unsubscribe = () => {};
    let unsubscribe2 = () => {};
    if (projectId) {
      unsubscribe = getOrderByProjectIdRealtime(projectId, (res: any) => {
        if (res) setOrderId(res?.id);
        else setOrderId('');
      });
      unsubscribe2 = getProjectRealtime(projectId, (res: any) => {
        if (res) {
          fetchProjectDataById(projectId);
        }
      });
    }
    return () => {
      unsubscribe();
      unsubscribe2();
    };
  }, [projectId]);

  useEffect(() => {
    if (isLoading) {
      updateInfo('status', 'processing');
    } else {
      if (status !== 'processing') {
        if (isExpired) {
          updateProjectData(projectId, { status: 'expired' });
        } else {
          updateProjectData(projectId, { status: 'activated' });
        }
      } else {
        if (orderId !== '') {
          updateProjectData(projectId, { status: 'activated' });
        }
      }
    }
  }, [isExpired, isLoading, orderId]);

  useEffect(() => {
    if (fetchProjectDataStatus === 'wait') {
      setIsLoading(true);
    }
    if (fetchProjectDataStatus === 'done' || fetchProjectDataStatus === 'error') {
      setIsLoading(false);
    }
  }, [fetchProjectDataStatus]);

  const handleChange = () => {
    if (subscriptionModel === 'custom') {
      alert(t('커스텀 플랜은 해당 버튼을 통해 구독을 변경할 수 없습니다.\n관리자에게 문의해주세요.'));
      return;
    }
    router.push(`/account/payment/plan`);
  };

  const handleCancel = useCallback(async () => {
    const confirm = window.confirm(t('Are you sure you want to cancel your subscription?'));
    if (confirm) {
      setIsLoading(true);
      if (orderId) {
        // cancel subscription
        await axios
          .post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payScheduleCancel', {
            customer_uid: uid,
            merchant_uid: orderId,
          })
          .then(async (res) => {
            if (res.data.status !== 'success') {
              alert(t('Failed to cancel subscription.\n') + res.data.message);
            } else {
              alert(t('Subscription cancelled successfully.'));
              fetchProjectDataById(projectId);
              setIsLoading(false);
            }
          })
          .catch((err) => {
            console.log(err);
            if (err.response.data.status === 'cancelFail' || !err.response.data.message) {
              updateOrder(orderId, { status: 'paid' });
              alert(t('Failed to cancel subscription.\n') + err.response.data.message);
            } else {
              alert(t('Failed to cancel subscription.\n') + err);
            }
            fetchProjectDataById(projectId);
            setIsLoading(false);
          });
      } else {
        alert(t('There is no reserved order to cancel.'));
        setIsLoading(false);
      }
    }
  }, [orderId]);

  const handleResume = useCallback(async () => {
    getPaidOrderByProjectId(projectId).then(async (order: any) => {
      if (order) {
        if (order.endAt.seconds > Date.now() / 1000) {
          if (subscriptionModel === 'custom') {
            alert(t('커스텀 플랜은 해당 버튼을 통해 구독을 재개할 수 없습니다.\n관리자에게 문의해주세요.'));
            return;
          }
          const confirm = window.confirm(t(`Are you sure you want to resume your subscription?`));
          if (confirm) {
            setIsLoading(true);
            await axios
              .post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payScheduleResume', {
                order,
              })
              .then(async (res) => {
                if (res.data.status !== 'success') {
                  alert(t('Failed to resume subscription.\n') + res.data.message);
                } else {
                  alert(t('Subscription resumed successfully.'));
                  fetchProjectDataById(projectId);
                }
              })
              .catch((err) => {
                console.log(err);
                if (err.response.data.status === 'scheduleFail' || !err.response.data.message) {
                  alert(t('Failed to resume subscription.\n') + err.response.data.message);
                } else {
                  alert(t('Failed to resume subscription.\n') + err);
                }
                fetchProjectDataById(projectId);
                setIsLoading(false);
              });
            return;
          } else {
            fetchProjectDataById(projectId);
            setIsLoading(false);
          }
        } else {
          // 구독 기간이 만료되었습니다. 재결제 하시겠습니까?
          const confirm = window.confirm(t(`Your subscription has expired.\nWould you like to restart subscription?`));
          if (confirm) {
            router.push(`/account/payment/plan`);
          } else {
            fetchProjectDataById(projectId);
            setIsLoading(false);
          }
          return;
        }
      } else {
        alert(t(`There is no cancelled order to ${isExpired ? 'restart' : 'resume'}.`));
        setIsLoading(false);
      }
    });
  }, [orderId, isExpired]);

  const getPlan = useCallback(
    (plan: string) => {
      switch (plan) {
        case 'monthly':
          return 'Monthly';
        case 'annual':
          return 'Annual';
        case 'custom':
          return 'Custom';
        default:
          return '';
      }
    },
    [subscriptionModel]
  );

  const getStatus = useCallback(
    (status: string) => {
      switch (status) {
        case 'processing':
          return 'Processing';
        case 'activated':
          return 'Activated';
        case 'expired':
          return 'Expired';
        default:
          return '';
      }
    },
    [status]
  );

  return (
    <Container>
      {isLoading && <Loading isSpinner={true} />}
      <Header>{t('Subscribe')}</Header>
      <Body>
        <Contents>
          <OrderItem>
            <Row>
              <Label>{t('Plan')}</Label>
              <Value>{t(`${getPlan(subscriptionModel)}`)}</Value>
            </Row>
            <Row>
              <Label>{t('Status')}</Label>
              <Value>{t(`${getStatus(status)}`)}</Value>
            </Row>
            <Row>
              <Label>{t('Number of Exhibitions')}</Label>
              <Value>{exhibitionLimit}</Value>
            </Row>
            <Row>
              <Label>{t('Next Billing Date')}</Label>
              <Value>{expiredAt ? moment(expiredAt).format('YYYY-MM-DD') : ''} </Value>
            </Row>
          </OrderItem>
          <ButtonGroup>
            {/* <PlanChangeButton /> */}
            {tier === 'free' ? (
              <>
                {!isExpired ? (
                  <Button variant="outlined" onClick={handleChange}>
                    {t('Change Subscription')}
                  </Button>
                ) : (
                  <StyledButton variant="outlined" onClick={handleResume}>
                    {t(`Restart Subscription`)}
                  </StyledButton>
                )}
              </>
            ) : status === 'processing' ? (
              <></>
            ) : orderId !== '' ? (
              <>
                <Button variant="outlined" onClick={handleChange}>
                  {t('Change Subscription')}
                </Button>
                <StyledButton variant="outlined" onClick={handleCancel}>
                  {t('Cancel Subscription')}
                </StyledButton>
              </>
            ) : (
              <>
                {!isExpired && (
                  <Button variant="outlined" onClick={handleChange}>
                    {t('Change Subscription')}
                  </Button>
                )}
                <StyledButton variant="outlined" onClick={handleResume}>
                  {t(`${isExpired ? 'Restart' : 'Resume'} Subscription`)}
                </StyledButton>
              </>
            )}
          </ButtonGroup>
        </Contents>
      </Body>
    </Container>
  );
}

export default Subscribe;
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
const Contents = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;
const Body = styled.div`
  margin-top: 24px;
`;

const OrderItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin-bottom: 16px;
  gap: 0px;
  border: 1px solid #ecf0f6;
  padding: 22px 28px;
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 36px;
  gap: 12px;
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

const StyledButton = styled(Button)`
  // 우측정렬
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
`;
