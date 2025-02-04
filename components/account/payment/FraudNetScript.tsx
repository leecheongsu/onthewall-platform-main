import { db } from '@/lib/firebase';
import axios from 'axios';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import React, { useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project';
interface FraudNetScriptProps {
  merchantUid: string;
  accountId: string;
  isUpgrade: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
  addAndUpdateDocs: Function;
  isFirstPayment: boolean;
  projectUrl?: string;
}

const FraudNetScript = ({
  merchantUid,
  accountId,
  isUpgrade,
  setLoading,
  setIsPaying,
  addAndUpdateDocs,
  isFirstPayment,
  // 첫 결제시 프로젝트 URL
  projectUrl: projectURL,
}: FraudNetScriptProps) => {
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const { projectUrl } = useProjectStore((state) => state);

  useEffect(() => {
    if (!merchantUid) return;

    // JSON 데이터를 추가
    const scriptJson = document.createElement('script');
    scriptJson.type = 'application/json';
    scriptJson.setAttribute('fncls', 'fnparams-dede7cc5-15fd-4c75-a9f4-36c430ee3a99');
    scriptJson.text = JSON.stringify({
      f: merchantUid, //	주문번호(merchant_uid) 전달
      s: `ACCOUNTID_checkout-page`, // {페이팔 Account ID}_{페이지 유형} 형식
      sandbox: true,
    });

    // PayPal 스크립트를 추가
    const script = document.createElement('script');
    script.src = 'https://c.paypal.com/da/r/fb.js';
    script.type = 'text/javascript';

    // noscript 대체 이미지 추가 (JavaScript 비활성화 시)
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.src = `https://c.paypal.com/v1/r/d/b/ns?f=${merchantUid}&s=ACCOUNTID_checkout-page&js=0&r=1`;
    noscript.appendChild(img);

    // DOM에 추가
    document.body.appendChild(scriptJson);
    document.body.appendChild(script);
    document.body.appendChild(noscript);

    paypalRt();

    // 컴포넌트가 언마운트 될 때 클린업
    return () => {
      document.body.removeChild(scriptJson);
      document.body.removeChild(script);
      document.body.removeChild(noscript);
    };
  }, [merchantUid]);

  const paypalRt = async () => {
    const newDocRef = doc(db, 'Order', merchantUid);
    const newDoc = await getDoc(newDocRef);
    const newOrder = newDoc.data();
    const isBeforeStart = newOrder?.endAt.seconds > Date.now() / 1000;
    try {
      const res = await axios.post('https://asia-northeast3-gd-virtual-staging.cloudfunctions.net/paypalRt', {
        order: newOrder,
      });

      if (res.data.status !== 'success') {
        alert(t('Failed to ') + (isBeforeStart ? 'change' : 'restart') + t(' subscription.\n') + res.data.message);
      } else {
        console.log(t('Your payment has been completed!'));
        const endAtTimestamp = res.data.data.endAt;
        const endAtDate = new Date(endAtTimestamp.seconds * 1000 + endAtTimestamp.nanoseconds / 1000000);
        const expiredAtTimestamp = Timestamp.fromDate(endAtDate);
        if (isFirstPayment) {
          await addAndUpdateDocs(res.data.data, expiredAtTimestamp, merchantUid);
        } else {
          await addAndUpdateDocs(expiredAtTimestamp, isBeforeStart, true);
        }
      }
    } catch (err: any) {
      console.log(err);
      const errorMessage =
        err.response?.data?.status === 'scheduleFail' || !err.response?.data?.message
          ? err.response?.data?.message
          : err;
      alert(
        t('Failed to ') +
          (isFirstPayment ? 'start' : isBeforeStart ? 'change' : 'restart') +
          t(' subscription.\n') +
          errorMessage
      );
    } finally {
      setIsPaying(false);
      setLoading(false);
      if (isFirstPayment) {
        router.push(`/${projectURL}/main`);
      } else {
        router.push(`/${projectUrl}/account/my-page?tab=subscribe`);
      }
    }
  };

  return null; // 이 컴포넌트는 화면에 표시할 것이 없으므로 null을 반환합니다.
};

export default FraudNetScript;
