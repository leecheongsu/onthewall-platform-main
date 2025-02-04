import { getPaidOrderByProjectId } from '@/api/firestore/getOrder';
import Loading from '@/app/loading';
import Button from '@/components/Button';
import { db } from '@/lib/firebase';
import priceToString from '@/utils/priceToString';
import styled from '@emotion/styled';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FraudNetScript from './FraudNetScript';
import getNextPeriodTimestamp from '@/utils/getNextPeriodTimestamp';

interface Props {
  setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
  formData: any;
  selectedPlan: any;
  contryCode: string;
  onClose: () => void;
  setPaypalOrderId: React.Dispatch<React.SetStateAction<string>>;
  isUpgrade: boolean;
  addAndUpdateDocs: Function;
  isFirstPayment: boolean;
}

const PaymentInfo = ({
  setIsPaying,
  formData,
  selectedPlan,
  contryCode,
  onClose,
  setPaypalOrderId,
  isUpgrade,
  addAndUpdateDocs,
  isFirstPayment,
}: Props) => {
  const { IMP } = window;
  const { i18n, t } = useTranslation();
  const isPaypalLoaded = useRef(false);
  const [loading, setLoading] = useState(true);
  const [merchantUid, setMerchantUid] = useState('');
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (isPaypalLoaded.current) return;
    isPaypalLoaded.current = true;
    setPaypalOrderId('');

    const initPaypal = async () => {
      const order = await getPaidOrderByProjectId(formData.projectId);
      const selectedAmount =
        formData.subscription === 'monthly' ? selectedPlan.amountPerMonth : selectedPlan.annualSale;
      const customData = order
        ? JSON.parse(order.custom_data)
        : {
            buyer_id: formData.userId,
            plan: selectedPlan.value,
            payPeriod: formData.subscription === 'monthly' ? 1 : 12,
            amount: selectedAmount,
            promotionCode: '',
            isUpgrade: false,
            isCloud: true,
            isFreeTrial: false,
          };

      const customDataStr = JSON.stringify({
        ...customData,
        plan: selectedPlan.value,
        payPeriod: formData.subscription === 'monthly' ? 1 : 12,
        amount: selectedAmount,
        promotionCode: '',
      });

      const docRef = await addDoc(collection(db, 'Order'), {
        ...(order || {}),
        amount: 0,
        price: 0,
        name: `${selectedPlan.label} Regular payment (${formData.subscription})`,
        custom_data: customDataStr,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        buyer_id: formData.userId,
        plan: selectedPlan.value,
        payPeriod: formData.subscription === 'monthly' ? 1 : 12,
        projectId: formData.projectId,
        promotionCode: '',
        startAt: Timestamp.now(),
        endAt: Timestamp.now(),
        // 빌링키 요청
        status: 'requested',
        currency: contryCode === 'KR' ? 'KRW' : 'USD',
      });
      await updateDoc(docRef, {
        merchant_uid: docRef.id,
        id: docRef.id,
      });
      setPaypalOrderId(docRef.id);

      IMP.init('imp78805206');
      IMP.loadUI(
        'paypal-rt',
        {
          // pg: 'paypal_v2.UFYSG9T7RFW2A', // 테스트 서버
          pg: 'paypal_v2.CNFENTVKZ462A', // 실서버
          pay_method: 'paypal',
          merchant_uid: docRef.id,
          customer_uid: formData.userId,
          customer_id: formData.userId,
          name: t(`${selectedPlan.label} Regular payment (${formData.subscription})`),
          // notice_url: 'https://us-central1-gd-virtual-staging.cloudfunctions.net/iamportWebhookTest',
          notice_url: 'https://us-central1-gd-virtual-staging.cloudfunctions.net/iamportWebhook',
          custom_data: JSON.parse(customDataStr),
          bypass: {
            paypal_v2: {
              style: {
                height: 38.5,
              },
            },
          },
        },
        (rsp: any) => iamportCallback(rsp)
      ).then(() => {
        setLoading(false);
      });
    };

    initPaypal();
  }, []);

  const iamportCallback = useCallback(async (rsp: any) => {
    console.log('@@@iamportCallback', rsp);
    setIsPaying(true);
    setLoading(true);
    const docRef = doc(db, 'Order', rsp.merchant_uid);
    const order = (await getDoc(docRef)).data();
    const customData = JSON.parse(order?.custom_data);
    const isBeforeStart = order?.endAt.seconds > Date.now() / 1000;
    const startAt = isBeforeStart ? order?.startAt : Timestamp.now();
    const endAt = isBeforeStart ? order?.endAt : getNextPeriodTimestamp(customData.payPeriod, Timestamp.now());
    // 페이팔 정기 결제 실패 시 로직
    if (rsp.error_code) {
      // alert(`${rsp.error_code}: ${rsp.error_msg}`);
      try {
        switch (rsp.error_code) {
          case 'F500':
            await deleteDoc(docRef);
            // router.push(`/${projectUrl}/account/my-page?tab=subscribe`);
            onClose();
            break;
          case 'F400':
            await deleteDoc(docRef);
            // await updateDoc(docRef, {
            // 	status: 'cancelled',
            // });
            onClose();
            break;
        }
      } catch (err: any) {
        console.error('Error updating document: ', err);
      }
      setLoading(false);
      setIsPaying(false);
      return;
    } else {
      // 빌링키 발급 성공 시 로직
      const newDocRef = await addDoc(collection(db, 'Order'), {
        ...order,
        amount: customData.amount,
        price: customData.amount,
        startAt: startAt,
        endAt: endAt,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        isUpgrade: isBeforeStart && isUpgrade,
        // 플랜 Free > 유료 전환시 날짜 즉시 적용되도록 변경
        isDirect: order?.plan === 'free',
        currency: contryCode === 'KR' ? 'KRW' : 'USD',
        customer_uid: formData.userId,
        pay_method: 'paypal',
      });
      await updateDoc(newDocRef, {
        status: 'none',
        updatedAt: Timestamp.now(),
        merchant_uid: newDocRef.id,
        id: newDocRef.id,
      });
      setPaypalOrderId(newDocRef.id);
      setMerchantUid(newDocRef.id);
    }
  }, []);

  return (
    <Root>
      {loading && <Loading isSpinner={true} />}
      <FraudNetScript
        merchantUid={merchantUid}
        accountId={accountId}
        isUpgrade={isUpgrade}
        setLoading={setLoading}
        setIsPaying={setIsPaying}
        addAndUpdateDocs={addAndUpdateDocs}
        isFirstPayment={isFirstPayment}
        projectUrl={formData.projectUrl}
      />
      <Container>
        <ContentItem>
          <span>{t('플랜')}</span>
          <span>{selectedPlan.value}</span>
        </ContentItem>
        <ContentItem>
          <span>{t('이용기간')}</span>
          <span>{t(`{{count}} 개월`, { count: formData.subscription === 'monthly' ? 1 : 12 })}</span>
        </ContentItem>
        <ContentItem>
          <span>{t('금액')}</span>
          <span>
            {selectedPlan.value === 'free'
              ? t('무료')
              : t(`{{price}} ${contryCode !== 'KR' ? '$' : '원'}`, {
                  price:
                    formData.subscription === 'monthly'
                      ? priceToString(selectedPlan.amountPerMonth)
                      : priceToString(selectedPlan.annualSale),
                })}
          </span>
        </ContentItem>
        <ButtonContainer>
          <Button type={'button'} className={'btn_primary w-1/3'} onClick={onClose} variant={'contained'}>
            {t('취소')}
          </Button>
          <div className="portone-ui-container" data-portone-ui-type="paypal-rt">
            {/* <!-- 3. 여기에 페이팔 버튼이 생성됩니다. --> */}
          </div>
        </ButtonContainer>
      </Container>
    </Root>
  );
};

export default PaymentInfo;

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Noto Sans', sans-serif;
  width: 100%;
  max-width: 1200px;
  gap: 30px;
  margin-top: 30px;
`;

const ContentItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 8px;

  & > .portone-ui-container {
    & > #ui-container-paypal-rt {
      display: flex;
      position: relative;
    }
  }
`;
