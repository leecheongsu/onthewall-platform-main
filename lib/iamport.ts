// lib/iamport.ts

import React from 'react';
import axios from 'axios';
import { addDoc, collection, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Firebase 설정 파일 경로에 맞게 수정
import getNextPeriodTimestamp from '@/utils/getNextPeriodTimestamp';

const iamportCallback = async (
  router: any,
  t: any,
  rsp: any,
  merchantId: string,
  formData: any,
  setIsPaying: Function,
  isFirstPayment: boolean,
  addAndUpdateDocs?: Function
) => {
  console.log('@@@@iamportCallback', rsp, merchantId);
  // 주문 내역 ref
  const docRef = doc(db, 'Order', rsp.merchant_uid);
  // 결제 성공 시
  if (rsp.success) {
    await axios
      .post('https://us-central1-gd-virtual-staging.cloudfunctions.net/pay', {
        imp_uid: rsp.imp_uid,
        merchant_uid: rsp.merchant_uid,
      })
      .then(async (res) => {
        console.log('@@@res', res);
        // 가맹점 서버 결제 API 성공시 로직
        switch (res.data.status) {
          case 'vbankIssued':
            // 가상계좌 발급 시 로직
            break;
          case 'success':
            // 결제 성공 시 로직
            // 프로젝트 추가
            const data = res.data.data;
            // endAt을 Date로 변환 nanoseconds까지 계산
            const expiredAt = new Date(data.endAt._seconds * 1000 + data.endAt._nanoseconds / 1000000);
            const isBeforeStart = data.endAt._seconds > Date.now() / 1000;

            // Add and update docs
            if (addAndUpdateDocs) {
              if (isFirstPayment) {
                await addAndUpdateDocs(data, expiredAt, merchantId);
              } else {
                await addAndUpdateDocs(Timestamp.fromDate(expiredAt), isBeforeStart, true);
              }
            }
            break;
        }
        alert(t('Your payment has been completed!'));
        if (isFirstPayment) {
          router.push(`/${formData.projectUrl}/main`);
        } else {
          router.push(`/${formData.projectUrl}/account/my-page?tab=subscribe`);
        }
        setIsPaying(false);
      })
      .catch((e: any) => {
        // 결제 실패 시
        if (e.response?.data.status === 'scheduleFail' || !e.response?.data.message) {
          alert(t('Payment failed\n') + (e.response?.data.message || e));
        } else {
          alert(t('Payment failed\n') + e);
        }
        console.error('Error adding document: ', e);
        setIsPaying(false);
      });
  } else {
    // 결제 실패 시
    // await deleteDoc(docRef);
    alert(t('Billing key issuance failure'));
    setIsPaying(false);
  }
};

export const paymentHandler = async (
  router: any,
  t: any,
  formData: any,
  selectedPlan: any,
  isFreeTrial: boolean,
  selectedPlanTier: string,
  setIsPaying: React.Dispatch<React.SetStateAction<boolean>>,
  isFirstPayment: boolean,
  isUpgrade?: boolean,
  startForFree?: Function,
  addAndUpdateDocs?: Function,
  contryCode?: string
) => {
  if (!window.IMP) {
    console.log('IMP is not loaded');
    setIsPaying(false);
    return;
  } else if (formData.userId === '') {
    console.log('User ID is not loaded');
    setIsPaying(false);
    return;
  }
  const { IMP } = window;
  const selectedAmount =
    selectedPlan && (formData.subscription === 'monthly' ? selectedPlan.amountPerMonth : selectedPlan.annualSale);
  const customDataStr = JSON.stringify({
    buyer_id: formData.userId,
    plan: selectedPlan.value,
    payPeriod: formData.subscription === 'monthly' ? 1 : 12,
    amount: selectedAmount,
    promotionCode: '',
    isUpgrade: false,
    isCloud: true,
    isFreeTrial,
  });

  const docRef = await addDoc(collection(db, 'Order'), {
    price: selectedAmount,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    buyer_id: formData.email,
    plan: selectedPlan.value,
    payPeriod: formData.subscription === 'monthly' ? 1 : 12,
    projectId: formData.projectId,
    promotionCode: '',
    startAt: Timestamp.now(),
    endAt:
      selectedPlanTier === 'free'
        ? getNextPeriodTimestamp(12, Timestamp.now()).toDate()
        : getNextPeriodTimestamp(formData.subscription === 'monthly' ? 1 : 12, Timestamp.now()).toDate(),
    isUpgrade: isUpgrade ?? formData.isUpgrade,
    isFreeTrial,
    custom_data: customDataStr,
  })
    .then((docRef: any) => {
      if (startForFree && selectedPlanTier === 'free') {
        startForFree(docRef.id);
        return;
      }

      IMP.init('imp78805206');
      const params = {
        channelKey: 'channel-key-6a4e3a68-43fd-42fb-a1af-5d2fdb73be17', // 실서버
        // channelKey: 'channel-key-884fd6da-8cd9-45fb-8f16-7d656eeaad63', // 테스트
        // pg: 'html5_inicis.MOIforbill', // 실제 계약 후에는 실제 상점아이디로 변경
        // pg: 'html5_inicis.INIBillTst', // 테스트
        pay_method: 'card', // 'card'만 지원됩니다.
        // merchant_uid: `${user.id}_${new Date().getTime()}`, // 상점에서 관리하는 주문 번호
        merchant_uid: docRef.id, // 상점에서 관리하는 주문 번호
        // name: `{{plan}} 정기결제(월)`, {
        // 	plan: planToSubs.label,
        // },
        name: t(`${selectedPlan.label} Regular payment (${formData.subscription})`),
        amount: isFreeTrial ? 0 : selectedAmount,
        customer_uid: formData.userId, // 필수 입력.
        buyer_email: formData.email,
        buyer_name: formData.name,
        // buyer_tel: user.phone,
        m_redirect_url: 'https://platform.onthewall.io/pay/complete/', // 예: https://www.my-service.com/payments/complete/mobile
        custom_data: {
          buyer_id: formData.userId,
          plan: selectedPlan.value,
          payPeriod: formData.subscription === 'monthly' ? 1 : 12,
          amount: selectedAmount,
          promotionCode: '',
          isUpgrade: false,
          isCloud: true,
          isFreeTrial,
          isBillingKey: true,
        },
      };

      IMP.request_pay(params, async function (rsp: any) {
        await iamportCallback(
          router,
          t,
          rsp,
          params.merchant_uid,
          formData,
          setIsPaying,
          isFirstPayment,
          addAndUpdateDocs
        );
      });
      return;
    })
    .catch((e: any) => {
      console.error('Error adding document: ', e);
      setIsPaying(false);
    });
};
