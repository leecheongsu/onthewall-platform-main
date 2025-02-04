'use client';

import { useSearchParams } from 'next/navigation';
import Moment from 'moment/moment';
import SelectItem from '@/components/SelectItem';
import { Button, Checkbox, FormControlLabel, Radio, RadioGroup, TextareaAutosize } from '@mui/material';
import priceToString from '@/utils/priceToString';
import styled from '@emotion/styled';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Grade, NonGradePlan, Plan, PaymentMaxEx, GradePlan } from '@/type/Payment';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { TERMS_OF_USE_EN, TERMS_OF_USE_KR } from '@/constants/terms';
import Loading from '@/app/loading';
import ShortUniqueId from 'short-unique-id';
import { PAYMENT } from '@/constants/payment';
import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';
import {
  getPaidOrderByProjectId,
  getOrderByProjectIdRealtime,
  updateOrder,
  getOrderDoc,
} from '@/api/firestore/getOrder';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { updateProjectData } from '@/api/firestore/getProject';
import { useOrderStore } from '@/store/order';
import { useTranslation } from 'react-i18next';
import SmallInfoIcon from '@/images/icons/SmallInfoIcon';
import { db } from '@/lib/firebase';
import { paymentHandler } from '@/lib/iamport';
import { updateCurrentUser } from '@/api/firestore/getUsers';
import ModalBox from '@/components/Modal';
import PaymentInfo from '@/components/account/payment/PaymentInfo';
import sendNotification from '@/utils/sendNodification';
import PlanModal from '@/components/home/plan/PlanModal';
import getNextPeriodTimestamp from '@/utils/getNextPeriodTimestamp';
import getPriceByCountryCode from '@/utils/getPriceByCountryCode';
import { updateExhibitionByProjectId } from '@/api/firestore/getExhibitions';
import { useLanguageStore } from '@/store/language';

function Page() {
  // const { IMP } = window;
  const { t } = useTranslation();
  const router = useRouter();
  const { language } = useLanguageStore();
  const {
    projectId,
    projectUrl,
    subscriptionModel,
    exhibitionLimit,
    expiredAt,
    isExpired,
    currentExhibitionCount,
    tier,
    updateInfo,
  } = useProjectStore();
  const {
    uid,
    email,
    userName,
    paymentStatus,
    updateInfo: updateUserInfo,
    updatePaymentStatus,
    countryCodeText,
  } = useUserStore();
  const { orderId: orderIdAtFirst, fetchOrderDataByProjectId, fetchOrderDataStatus } = useOrderStore((state) => state);
  const searchParams = useSearchParams()!!;
  // const type = searchParams.get('type')!!;
  let type = 'direct';

  const [planInfos, setPlanInfos] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isFreeTrial, setIsFreeTrial] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [isNotChanged, setIsNotChanged] = useState<boolean>(true);
  const [orderId, setOrderId] = useState<string>('');
  const [isUpgrade, setIsUpgrade] = useState<boolean>(false);
  const isNotChangedRef = useRef(isNotChanged);
  const orderIdRef = useRef<string>(orderId);
  const isUpgradeRef = useRef<boolean>(isUpgrade);
  const [isFirstLoading, setIsFirstLoading] = useState<boolean>(true);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('free');
  const [openPlanModal, setOpenPlanModal] = useState<boolean>(false);

  /**
   * 국가 코드
   * @default 'US'
   * @type {string}
   * @example 'KR' 국내 결제
   * @example 'US' 해외 결제(페이팔)
   * @example 'MY' 말레이시아 시연용
   */
  const [contryCode, setCountryCode] = useState<string>('US');
  const [localizedPayment, setLocalizedPayment] = useState<any>(PAYMENT);
  const [isOpen, setIsOpen] = useState(false);
  const [modalConf, setModalConf] = useState({});
  const [paypalOrderId, setPaypalOrderId] = useState('');

  const [formData, setFormData] = useState({
    email: email,
    name: userName,
    userId: uid,
    billingPlan: 'business-1',
    cardNo: '',
    exDate: '',
    cvcNo: '',
    subscription: subscriptionModel,
    exLimitNo: exhibitionLimit,
    terms: false,
    projectId: projectId,
    projectUrl: projectUrl,
    payDate: new Date(),
    expiredAt: new Date(),
  });

  const [selectedPlan, setSelectedPlan] = useState<Grade | NonGradePlan>({
    value: 'free',
    label: '무료 사용자',
    maxExhibition: 1,
    amountPerMonth: 0,
    annual: 0,
    annualSale: 0,
    adminMaxCount: 0,
  });
  const formDataRef = useRef(formData);
  const selectedPlanRef = useRef(selectedPlan);

  // 허용된 exNo 리스트 생성
  const allowedExNoList: number[] = [
    (PAYMENT.free as NonGradePlan).maxExhibition,
    ...(PAYMENT.personal as GradePlan).grades.map((grade) => grade.maxExhibition),
    ...(PAYMENT.business as GradePlan).grades.map((grade) => grade.maxExhibition),
    (PAYMENT.enterprise as NonGradePlan).maxExhibition,
  ];

  const getMaxExhibitionListByPlan = (plan: string | null) => {
    if (!plan) {
      return [];
    }
    const paymentPlan = PAYMENT[plan] as Plan | undefined;
    // 해당 플랜이 없는 경우 빈 배열 반환
    if (!paymentPlan) {
      return [];
    }

    // NonGradePlan의 경우
    if (!paymentPlan.hasGrade) {
      return [(paymentPlan as NonGradePlan).maxExhibition];
    }

    // GradePlan의 경우 maxExhibition 값을 배열로 반환
    const grades = (paymentPlan as GradePlan).grades;
    const maxExhibitions = grades.map((grade) => grade.maxExhibition);

    return maxExhibitions;
  };

  const validateParams = useCallback(() => {
    const result = {
      plan: null,
      exNo: null,
      model: null,
      isParam: false,
    };

    type paymentPlan = keyof typeof PAYMENT;
    const plan: paymentPlan | null = searchParams.get('plan');
    const exNoString = searchParams.get('exNo');
    const exNo: number | null = exNoString ? Number(exNoString) : null;
    const model = searchParams.get('model');

    // 파라미터가 하나라도 있으면 isParam을 true로 설정
    const hasParams = plan !== null || exNo !== null || model !== null;

    // 각 파라미터 유효성 검사
    const validPlan = plan !== null && Object.keys(PAYMENT).includes(plan) ? plan : null;
    const validExNo = exNo !== null && getMaxExhibitionListByPlan(plan).includes(exNo) ? exNo : null;
    const validModel = model !== null && ['monthly', 'annual'].includes(model) ? model : null;

    // 유효한 파라미터와 isParam true 설정 반환
    return {
      plan: validPlan,
      exNo: validExNo,
      model: validModel,
      isParam: hasParams, // 하나라도 있으면 true로 설정
    };
  }, [searchParams]);

  useEffect(() => {
    let unsubscribe = () => {};
    if (projectId) {
      const validateRes = validateParams();
      fetchOrderDataByProjectId(projectId);
      setSelectedPlanTier(validateRes.plan ?? tier.toLowerCase());
      setFormData((prevState) => ({
        ...prevState,
        projectUrl,
        expiredAt: expiredAt ? expiredAt : new Date(),
        subscription: subscriptionModel,
        exLimitNo: exhibitionLimit,
        payDate: type === 'reservation' && expiredAt ? expiredAt : new Date(),
      }));
      unsubscribe = getOrderByProjectIdRealtime(projectId, (res: any) => {
        if (res) setOrderId(res?.id);
        else setOrderId('');
      });
    }
    return () => {
      unsubscribe();
    };
  }, [projectId]);

  useEffect(() => {
    isNotChangedRef.current = isNotChanged;
  }, [isNotChanged]);

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    isUpgradeRef.current = isUpgrade;
  }, [isUpgrade]);

  useEffect(() => {
    setCountryCode(countryCodeText);
    const localizedAmount = getPriceByCountryCode(countryCodeText);
    const calculatedPayment = {
      ...PAYMENT,
      personal: {
        ...PAYMENT.personal,
        grades: (PAYMENT.personal as GradePlan).grades.map((grade) => ({
          ...grade,
          amountPerMonth: Math.round(
            localizedAmount * grade.maxExhibition * (grade.value === 'personal-1' ? 0.89 : 1.1)
          ),
          annual: Math.round(localizedAmount * grade.maxExhibition * (grade.value === 'personal-1' ? 0.89 : 1.1) * 12),
          annualSale: Math.round(
            localizedAmount * grade.maxExhibition * (grade.value === 'personal-1' ? 0.89 : 1.1) * 12 * 0.8
          ),
        })),
      },
      business: {
        ...PAYMENT.business,
        grades: (PAYMENT.business as GradePlan).grades.map((grade) => ({
          ...grade,
          amountPerMonth: Math.round(
            localizedAmount * grade.maxExhibition * (['business-4', 'business-5'].includes(grade.value) ? 0.88 : 1.1)
          ),
          annual: Math.round(
            localizedAmount *
              grade.maxExhibition *
              (['business-4', 'business-5'].includes(grade.value) ? 0.88 : 1.1) *
              12
          ),
          annualSale: Math.round(
            localizedAmount *
              grade.maxExhibition *
              (['business-4', 'business-5'].includes(grade.value) ? 0.88 : 1.1) *
              12 *
              0.8
          ),
        })),
      },
      enterprise: {
        ...PAYMENT.enterprise,
        amountPerMonth: Math.round(localizedAmount * (PAYMENT.enterprise as NonGradePlan).maxExhibition * 0.942857),
        annual:
          Math.round((localizedAmount * (PAYMENT.enterprise as NonGradePlan).maxExhibition * 0.942857 * 12) / 1000) *
          1000,
        annualSale:
          Math.round((localizedAmount * (PAYMENT.enterprise as NonGradePlan).maxExhibition * 0.942857 * 12) / 1000) *
          1000 *
          0.8,
      },
    };
    setLocalizedPayment(calculatedPayment);
  }, [countryCodeText]);

  useEffect(() => {
    if (!localizedPayment) return;
    const tempPlans: (Grade | NonGradePlan)[] = [];
    const tempPlanInfos: any[] = [];
    Object.keys(localizedPayment).forEach((key) => {
      const plan = localizedPayment[key] as Plan;
      let maxExhibition = 0;
      // if (['business', 'enterprise'].includes(key)) {
      if (plan.hasGrade) {
        plan.grades.forEach((grade) => {
          if (grade.maxExhibition >= currentExhibitionCount) {
            tempPlans.push(grade);
            maxExhibition = grade.maxExhibition;
          }
        });
      } else {
        if (plan.maxExhibition >= currentExhibitionCount) {
          tempPlans.push(plan as NonGradePlan);
          maxExhibition = plan.maxExhibition;
        }
      }
      tempPlanInfos.push({ ...plan, maxExhibition });
      // }
    });
    setPlans(tempPlans);
    setPlanInfos(tempPlanInfos);
  }, [localizedPayment]);

  // uid가 설정된 이후에 formData를 업데이트하기 위해 useEffect 사용
  useEffect(() => {
    if (uid && formData.userId !== uid) {
      setFormData((prevState) => ({
        ...prevState,
        email: email || prevState.email,
        name: userName || prevState.name,
        userId: uid,
        projectId: projectId || prevState.projectId,
      }));
    }
  }, [uid, formData.userId]);

  // useEffect(() => {
  //   if (!formData.exLimitNo) return;
  //   setSelectedPlan(plans.find((plan: any) => plan.maxExhibition === formData.exLimitNo));
  //   if (formData.subscription === subscriptionModel && formData.exLimitNo === exhibitionLimit) {
  //     setIsNotChanged(true);
  //   } else {
  //     setIsNotChanged(false);
  //   }
  // }, [formData]);

  useEffect(() => {
    if (!formData.exLimitNo || !plans.length) return;

    const matchedPlan = plans.find((plan: any) => plan.maxExhibition === formData.exLimitNo);

    // 현재 선택된 플랜과 비교하여 동일한지 확인 후 상태 업데이트
    if (matchedPlan && matchedPlan !== selectedPlan) {
      setSelectedPlan(matchedPlan);
    }

    // `isNotChanged`를 설정하는 조건을 추가
    if (formData.subscription === subscriptionModel && formData.exLimitNo === exhibitionLimit) {
      if (!isNotChanged) {
        setIsNotChanged(true);
      }
    } else {
      if (isNotChanged) {
        setIsNotChanged(false);
      }
    }
  }, [
    formData.exLimitNo,
    plans,
    formData.subscription,
    subscriptionModel,
    exhibitionLimit,
    selectedPlan,
    isNotChanged,
  ]);

  useEffect(() => {
    selectedPlanRef.current = selectedPlan;
    if (!selectedPlan) return;
    if (exhibitionLimit < selectedPlan.maxExhibition) {
      setIsUpgrade(true);
    } else {
      setIsUpgrade(false);
    }
  }, [selectedPlan]);

  useEffect(() => {
    if (fetchOrderDataStatus === 'wait') {
      setIsPaying(true);
    } else if (fetchOrderDataStatus === 'done' || fetchOrderDataStatus === 'error') {
      setIsPaying(false);
    }
  }, [fetchOrderDataStatus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: name === 'terms' ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    const tempKey = new ShortUniqueId().randomUUID(8);
    const today = new Date();
    setFormData((prevState) => ({
      ...prevState,
      uid,
      email,
      userName,
      payDate: today,
      // projectUrl: tempKey,
    }));
  }, []);

  useEffect(() => {
    console.log(type);
    if (type === 'reservation') {
      setShowTerms(true);
    } else {
      setShowTerms(false);
    }
  }, [type]);

  const restartForFree = async (order: any, selectedAmount: number, isBeforeStart: boolean) => {
    const customData = JSON.parse(order.custom_data);
    const endAt = getNextPeriodTimestamp(12, Timestamp.now()).toDate();
    try {
      const newDocRef = await addDoc(collection(db, 'Order'), {
        ...order,
        amount: selectedAmount,
        price: selectedAmount,
        name: `${selectedPlanRef.current.label} Regular payment (${formDataRef.current.subscription})`,
        custom_data: JSON.stringify({
          ...customData,
          plan: selectedPlanRef.current.value,
          payPeriod: formDataRef.current.subscription === 'monthly' ? 1 : 12,
          amount: selectedAmount,
          promotionCode: '',
        }),
        startAt: Timestamp.now(),
        endAt: endAt,
        payPeriod: formDataRef.current.subscription === 'monthly' ? 1 : 12,
        plan: selectedPlanRef.current.value,
        isUpgrade: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        paid_at: Timestamp.now().seconds,
      });
      await updateDoc(newDocRef, {
        id: newDocRef.id,
        merchant_uid: newDocRef.id,
      });
      await updateProjectData(projectId, {
        subscriptionModel: formDataRef.current.subscription,
        exhibitionLimit: formDataRef.current.exLimitNo,
        expiredAt: endAt,
        updatedAt: Timestamp.now(),
        status: 'activated',
        tier: selectedPlanTier.toLowerCase(),
      });
      // 해당 프로젝트 전시 정보 업데이트
      await updateExhibitionByProjectId(projectId, {
        projectTier: selectedPlanTier.toLowerCase(),
        projectExpiredAt: expiredAt,
      });
      updateInfo('isExpired', false);
      updateInfo('status', 'activated');
      updateInfo('tier', selectedPlanTier.toLowerCase());
      // 구독 완료 알림
      await sendNotification('N1003', uid, {});

      alert(t('Successfully ') + (isBeforeStart ? 'changed' : 'restarted') + t(' subscription.'));
    } catch (err: any) {
      console.log(err);
      alert(t('Failed to ') + (isBeforeStart ? 'change' : 'restart') + t(' subscription.\n') + err);
    } finally {
      router.push(`/${projectUrl}/account/my-page?tab=subscribe`);
    }
  };

  const onSubmit = async () => {
    if (orderIdAtFirst !== '' && isNotChangedRef.current) {
      alert(t('You should change the plan first.'));
      return;
    }
    /**
     * 예약 취소 및 재예약 로직
     */
    const confirm = window.confirm(
      t(
        `Are you sure you want to ${
          tier === 'free' ? (isExpired ? 'restart' : 'change') : orderIdAtFirst === '' ? 'restart' : 'change'
        } your subscription?`
      )
    );
    if (confirm) {
      setIsPaying(true);
      if (orderIdRef.current !== '') {
        // cancel subscription
        await axios
          .post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payScheduleCancel', {
            customer_uid: uid,
            merchant_uid: orderIdRef.current,
          })
          .then(async (res) => {
            if (res.data.status !== 'success') {
              alert(t('Failed to cancel subscription.\n') + res.data.message);
              router.push(`/${projectUrl}/account/my-page?tab=subscribe`);
              return;
            } else {
              console.log('Subscription cancelled successfully.');
              restartSubscription();
            }
          })
          .catch(async (err) => {
            console.log(err);
            if (err.response.data.status === 'cancelFail' || !err.response.data.message) {
              alert(t('Failed to cancel subscription.\n') + err.response.data.message);
              await updateOrder(orderIdRef.current, { status: 'paid' });
            } else {
              alert(t('Failed to cancel subscription.\n') + err);
            }
            router.push(`/${projectUrl}/account/my-page?tab=subscribe`);
            return;
          });
      } else if (orderIdAtFirst !== '') {
        // 다음 결제가 예약 중 입니다. 다시 시도 해주세요.
        alert('The next payment is in progress. Please try again later.');
        fetchOrderDataByProjectId(projectId);
        return;
      } else {
        restartSubscription();
      }
    }
  };

  const restartSubscription = useCallback(async () => {
    await getPaidOrderByProjectId(projectId).then(async (order: any) => {
      if (order) {
        const customData = JSON.parse(order.custom_data);
        const isBeforeStart = order.endAt.seconds > Date.now() / 1000;
        /**
         * 기간 만료 후 예약시 재결제(payByBillingKey)로 변경
         */
        const startAt = isBeforeStart
          ? order.startAt
          : Timestamp.fromDate(
              new Date(
                Timestamp.now()
                  .toDate()
                  .setMinutes(Timestamp.now().toDate().getMinutes() + 2)
              )
            );
        const endAt = isBeforeStart ? order.endAt : getNextPeriodTimestamp(customData.payPeriod, Timestamp.now());
        const selectedAmount =
          selectedPlanRef.current &&
          (formDataRef.current.subscription === 'monthly'
            ? selectedPlanRef.current.amountPerMonth
            : selectedPlanRef.current.annualSale);
        // 업그레이드시 남은 시간에 따라 결제 금액 변경
        let calculatedAmount = selectedAmount;
        if (isBeforeStart && isUpgradeRef.current && order.plan !== 'free') {
          // monthly > annual 업그레이드시 가격 조정
          const isMonthlyToAnnual = order.payPeriod === 1 && formDataRef.current.subscription === 'annual';

          // test 기준 period는 분 단위로 계산
          const now = Timestamp.now().toDate();
          const endAtDate = endAt.toDate();
          const startAtDate = startAt.toDate();

          // 현재 선택된 결제 주기 종료 시점 계산
          const selectedPeriodEndAt = new Date(startAtDate);
          const selectedPeriodMonths = formDataRef.current.subscription === 'monthly' ? 1 : 12; // 선택된 주기: 월 또는 연
          selectedPeriodEndAt.setMonth(selectedPeriodEndAt.getMonth() + selectedPeriodMonths);
          // 시간을 유지 (startAt 기준으로)
          selectedPeriodEndAt.setHours(
            startAtDate.getHours(),
            startAtDate.getMinutes(),
            startAtDate.getSeconds(),
            startAtDate.getMilliseconds()
          );

          // 총 기간 계산 (일 단위)
          const totalDaysPrev = Math.ceil((endAtDate.getTime() - startAtDate.getTime()) / (1000 * 60 * 60 * 24));

          // 현재 선택된 주기의 총 기간 계산 (일 단위)
          const totalDaysSelected = Math.ceil(
            (selectedPeriodEndAt.getTime() - startAtDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // 남은 일수 계산
          let remainingDaysPrev = Math.ceil((endAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          // 남은 일수가 음수일 경우 0으로 처리 (이미 기간이 지났으면 0)
          if (remainingDaysPrev < 0) remainingDaysPrev = 0;

          // 할인 결제액(이전 주기 기준)
          const leftAmount = order.amount * (remainingDaysPrev / totalDaysPrev);

          // 선택된 주기 기준으로 남은 기간에 대한 결제 금액 계산
          calculatedAmount = Math.round(
            ((isMonthlyToAnnual ? selectedPlanRef.current.annual : selectedAmount) / totalDaysSelected) *
              remainingDaysPrev -
              leftAmount
          );
          // 음수일 경우 0으로 처리
          if (calculatedAmount < 0) calculatedAmount = 1;
        }

        // 무료 플랜으로 변경
        if (selectedPlanTier === 'free') {
          restartForFree(order, selectedAmount, isBeforeStart);
          return;
        }

        // 카드정보 미입력 시 결제 추가
        if (!paymentStatus.billingKey) {
          console.log('카드 정보 입력 결제 추가 해야됨');
          // 빌링키 발급
          paymentHandler(
            router,
            t,
            formDataRef.current,
            selectedPlanRef.current,
            isFreeTrial,
            selectedPlanTier,
            setIsPaying,
            false,
            isUpgradeRef.current,
            undefined,
            addAndUpdateDocs
          );
        } else {
          // 기존 결제 정보로 결제
          try {
            const res = await axios.post(
              !isBeforeStart || isUpgradeRef.current
                ? 'https://us-central1-gd-virtual-staging.cloudfunctions.net/payByBillingKey'
                : 'https://us-central1-gd-virtual-staging.cloudfunctions.net/payScheduleResume',
              {
                order: {
                  ...order,
                  amount: calculatedAmount,
                  price: calculatedAmount,
                  name: `${selectedPlanRef.current.label} Regular payment (${formDataRef.current.subscription})`,
                  custom_data: JSON.stringify({
                    ...customData,
                    plan: selectedPlanRef.current.value,
                    payPeriod: formDataRef.current.subscription === 'monthly' ? 1 : 12,
                    amount: selectedAmount,
                    promotionCode: '',
                  }),
                  startAt: startAt,
                  endAt: endAt,
                  payPeriod: formDataRef.current.subscription === 'monthly' ? 1 : 12,
                  plan: selectedPlanRef.current.value,
                  isUpgrade: isBeforeStart && isUpgradeRef.current,
                  // 플랜 Free > 유료 전환시 날짜 즉시 적용되도록 변경
                  isDirect: order.plan === 'free',
                },
              }
            );

            if (res.data.status !== 'success') {
              alert(t(`Failed to ${isBeforeStart ? 'change' : 'restart'} subscription.\n`) + res.data.message);
            } else {
              const endAtTimestamp = res.data.data.endAt;
              const endAtDate = new Date(
                !isBeforeStart || isUpgradeRef.current
                  ? endAtTimestamp._seconds * 1000 + endAtTimestamp._nanoseconds / 1000000
                  : endAtTimestamp.seconds * 1000 + endAtTimestamp.nanoseconds / 1000000
              );
              const expiredAtTimestamp = Timestamp.fromDate(endAtDate);
              await addAndUpdateDocs(expiredAtTimestamp, isBeforeStart, false);
            }
          } catch (err: any) {
            console.log(err);
            const errorMessage =
              err.response?.data?.status === 'scheduleFail' || !err.response?.data?.message
                ? err.response?.data?.message
                : err;
            alert(t(`Failed to ${isBeforeStart ? 'change' : 'restart'} subscription.\n`) + errorMessage);
          } finally {
            setIsPaying(false);
            router.push(`/${projectUrl}/account/my-page?tab=subscribe`);
          }
        }
      } else {
        alert(t('There is no paid order to restart.'));
        setIsPaying(false);
      }
    });
  }, [projectId, selectedPlan, formData, isUpgrade]);

  const addAndUpdateDocs = async (expiredAt: Timestamp, isBeforeStart: boolean, isBillingKeyUpdate: boolean) => {
    try {
      await updateDoc(doc(db, 'Project', projectId), {
        projectUrl: formDataRef.current.projectUrl,
        subscriptionModel: formDataRef.current.subscription,
        tier: selectedPlanTier.toLowerCase(),
        exhibitionLimit: formDataRef.current.exLimitNo,
        expiredAt: expiredAt,
        config: {
          adminMaxCount: selectedPlanRef.current.adminMaxCount,
        },
      });
      // 해당 프로젝트 전시 정보 업데이트
      await updateExhibitionByProjectId(projectId, {
        projectTier: selectedPlanTier.toLowerCase(),
        projectExpiredAt: expiredAt,
      });

      if (isBillingKeyUpdate) {
        // 빌링키 업데이트
        await updateCurrentUser(uid, 'owner', {
          ['paymentStatus.billingKey']: true,
          ['paymentStatus.paid']: true,
          updatedAt: Timestamp.now(),
        });
        updatePaymentStatus('billingKey', true);
        updatePaymentStatus('paid', true);
      }
      await updateProjectData(projectId, {
        subscriptionModel: formDataRef.current.subscription,
        exhibitionLimit: formDataRef.current.exLimitNo,
        expiredAt: expiredAt,
        updatedAt: Timestamp.now(),
        status: 'processing',
        tier: selectedPlanTier.toLowerCase(),
      });
      updateInfo('isExpired', false);
      updateInfo('status', 'processing');
      updateInfo('tier', selectedPlanTier.toLowerCase());
      // 구독 완료 알림
      await sendNotification('N1003', uid, {});

      alert(t(`Successfully ${isBeforeStart ? 'changed' : 'restarted'} subscription.`));
    } catch (err: any) {
      console.log(err);
      alert(t(`Failed to ${isBeforeStart ? 'change' : 'restart'} subscription.\n`) + err);
    }
  };

  const handlePlanSelect = (value: string, isClicked: boolean, isDisabled: boolean) => {
    if (isDisabled) return;
    if (isClicked) setIsFirstLoading(false);
    setSelectedPlanTier(value);
  };

  useEffect(() => {
    if (!selectedPlanTier) return;
    const tempPlans: (Grade | NonGradePlan)[] = [];
    const validateRes = validateParams();
    Object.keys(localizedPayment).forEach((key) => {
      const plan = localizedPayment[key] as Plan;
      if (plan.hasGrade) {
        plan.grades.forEach((grade) => {
          if (grade.value.includes(selectedPlanTier) && grade.maxExhibition >= currentExhibitionCount) {
            tempPlans.push(grade);
          }
        });
      } else {
        if ((plan as NonGradePlan).value === selectedPlanTier && plan.maxExhibition >= currentExhibitionCount) {
          tempPlans.push(plan as NonGradePlan);
        }
      }
    });
    setPlans(tempPlans);
    setFormData((prevState) => ({
      ...prevState,
      exLimitNo: isFirstLoading
        ? validateRes.isParam
          ? validateRes.exNo !== null
            ? validateRes.exNo
            : tempPlans[0]?.maxExhibition
          : exhibitionLimit
        : tempPlans[0]?.maxExhibition,
      subscription:
        selectedPlanTier === 'free'
          ? 'annual'
          : isFirstLoading
          ? validateRes.isParam
            ? validateRes.model !== null
              ? validateRes.model
              : prevState.subscription
            : subscriptionModel
          : prevState.subscription,
    }));
  }, [selectedPlanTier]);

  const handlePlanModalOpen = () => {
    setOpenPlanModal(true);
  };

  const onClose = useCallback(async () => {
    if (paypalOrderId !== '') {
      const docRef = doc(db, 'Order', paypalOrderId);
      await deleteDoc(docRef);
    }
    setIsOpen(false);
  }, [paypalOrderId]);

  useEffect(() => {
    if (isOpen) {
      setModalConf({
        title: t('결제 정보 확인'),
        blindFilter: true,
        backdropClick: true,
        customStyles: 'padding: 60px 80px;',
      });
    }
  }, [isOpen]);

  const onClickHandler = useCallback(() => {
    // 다운그레이드 제한 추가
    if (selectedPlan.maxExhibition < currentExhibitionCount) {
      alert(t(`You cannot change the plan if the current number of exhibitions exceeds the selected plan's limit.`));
    } else if (!isExpired && subscriptionModel === 'custom') {
      alert(t('커스텀 플랜은 구독 기한 만료 후 변경 가능합니다.\n플랜 변경이 필요하다면 관리자에게 문의해주세요.'));
    } else if (
      (tier === 'free' ? !isExpired : orderIdAtFirst !== '') &&
      orderIdRef.current !== '' &&
      formDataRef.current.subscription !== subscriptionModel
    ) {
      // 구독 만료 전 플랜 변경하는 경우 월/연간 요금제 변경 못하도록 수정(가격 및 내역 정상화)
      alert(t('You cannot change the subscription model until your current plan has expired.'));
    } else {
      selectedPlanTier !== 'free' && contryCode !== 'KR' && !paymentStatus.billingKey ? setIsOpen(true) : onSubmit();
    }
  }, [selectedPlanTier, currentExhibitionCount, selectedPlan, contryCode, paymentStatus]);

  // 결제 누락 처리용 추가
  // const payWithOrderId = async () => {
  //   const result = window.prompt('재결제 할 orderId를 입력해주세요.');
  //   if (result) {
  //     await getOrderDoc(result).then(async (order: any) => {
  //       if (order) {
  //         console.log('@@@order', order);
  //         const customData = JSON.parse(order.custom_data);
  //         try {
  //           const res = await axios.post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payByBillingKey', {
  //             order: {
  //               ...order,
  //             },
  //           });
  //           if (res.data.status !== 'success') {
  //             alert(t(`Failed to restart subscription.\n`) + res.data.message);
  //           } else {
  //             const endAtTimestamp = res.data.data.endAt.seconds
  //               ? res.data.data.endAt
  //               : { seconds: res.data.data.endAt._seconds, nanoseconds: res.data.data.endAt._nanoseconds };
  //             const endAtDate = new Date(endAtTimestamp.seconds * 1000 + endAtTimestamp.nanoseconds / 1000000);
  //             const expiredAtTimestamp = Timestamp.fromDate(endAtDate);
  //             if (order.projectId) {
  //               await updateDoc(doc(db, 'Project', order.projectId), {
  //                 expiredAt: expiredAtTimestamp,
  //                 updatedAt: Timestamp.now(),
  //               });
  //               await updateExhibitionByProjectId(order.projectId, {
  //                 projectExpiredAt: expiredAtTimestamp,
  //                 updatedAt: Timestamp.now(),
  //               });
  //             }
  //             alert(t('Successfully restarted subscription.'));
  //           }
  //         } catch (err: any) {
  //           console.log(err);
  //           const errorMessage =
  //             err.response?.data?.status === 'scheduleFail' || !err.response?.data?.message
  //               ? err.response?.data?.message
  //               : err;
  //           alert(t(`Failed to start subscription.\n`) + errorMessage);
  //         }
  //       }
  //     });
  //   }
  // };

  return (
    <>
      <Root>
        {isPaying && <Loading isSpinner={true} />}
        <Container>
          <Title>
            {tier === 'free' ? (isExpired ? 'Restart' : 'Change') : orderIdAtFirst === '' ? 'Restart' : 'Change'}{' '}
            {t('The Plan')}
          </Title>
          <Hr />
          <FormContainer customStyles="margin:0 0 25px;">
            <FormBody customStyles="gap: 0;">
              <FormTitle customStyles="margin-top: 15px;">
                {t('Plan')} <span onClick={handlePlanModalOpen}>{t('Details')}</span>
              </FormTitle>
              <PlanContainer>
                {planInfos.map((plan: any) => (
                  <PlanItem
                    key={plan.value}
                    selected={selectedPlanTier === plan.value}
                    disabled={plan.maxExhibition < currentExhibitionCount}
                    onClick={() => handlePlanSelect(plan.value, true, plan.maxExhibition < currentExhibitionCount)}
                  >
                    <Desc>{t(plan.label)}</Desc>
                    <Desc customStyles="font-size: 16px; font-weight: 400;">{t(plan.desc)}</Desc>
                    {/* <SmallInfoIcon fill={selectedPlanTier === plan.value ? '#fff' : '#94A3B8'} /> */}
                  </PlanItem>
                ))}
              </PlanContainer>
            </FormBody>
          </FormContainer>
          <FormContainer>
            <FormBody>
              <StyledHr className="dashed" />
              <ExhibitionNoContainer>
                <div className="desc">
                  <Desc>{t('Number of Exhibitions')}</Desc>
                  <span>
                    {Moment(formData.payDate).format('MM.DD.YYYY')} ~{' '}
                    {formData.subscription === 'monthly'
                      ? Moment(formData.payDate).add(1, 'month').subtract(1, 'day').format('MM.DD.YYYY')
                      : Moment(formData.payDate).add(1, 'year').subtract(1, 'day').format('MM.DD.YYYY')}
                  </span>
                </div>
                <div className="selectContainer">
                  <SelectItem
                    value={formData.exLimitNo}
                    items={plans.map((plan) => ({
                      title: '~ ' + plan.maxExhibition.toString(),
                      value: plan.maxExhibition,
                    }))}
                    onChange={(e) => handleSelectChange(e)}
                    name="exLimitNo"
                  ></SelectItem>
                </div>
              </ExhibitionNoContainer>
              <StyledHr className="dashed" />
              <SubscriptionContainer>
                <div className="desc">
                  <Desc>{t('Subscription Model')}</Desc>
                  <AddDesc>(Including VAT)</AddDesc>
                </div>
                <StyledRadioGroup name="subscription" value={formData.subscription} onChange={(e) => handleChange(e)}>
                  <StyledFormControlLabel
                    value="annual"
                    control={<Radio />}
                    label={
                      <div className="labelContainer">
                        <div>{t('Annual Subscription')}</div>
                        <div>
                          <AddDesc>
                            ({t('Monthly')} {contryCode !== 'KR' ? '$' : '₩'}
                            {selectedPlan && priceToString(Math.round(selectedPlan.annualSale / 12))})
                          </AddDesc>
                          <AddDesc customStyles="font-size: 18px; font-weight: 600; color: #000;">
                            {contryCode !== 'KR' ? '$' : '₩'}
                            {selectedPlan && priceToString(selectedPlan.annualSale)}
                          </AddDesc>
                        </div>
                      </div>
                    }
                    checked={formData.subscription === 'annual'}
                    first="true"
                    disabled={selectedPlanTier === 'free'}
                  />
                  <StyledFormControlLabel
                    value="monthly"
                    control={<Radio />}
                    label={
                      <div className="labelContainer">
                        <div>{t('Monthly Subscription')}</div>
                        <div>
                          <AddDesc customStyles="font-size: 18px; font-weight: 600; color: #000;">
                            {contryCode !== 'KR' ? '$' : '₩'}
                            {selectedPlan && priceToString(selectedPlan.amountPerMonth)}
                          </AddDesc>
                        </div>
                      </div>
                    }
                    checked={formData.subscription === 'monthly'}
                    disabled={selectedPlanTier === 'free'}
                  />
                </StyledRadioGroup>
              </SubscriptionContainer>
            </FormBody>
          </FormContainer>
          <Hr />
          <ReceiptContainer>
            <ReceiptBody>
              <Desc>{t("Today's Payment Amount")}</Desc>
              <div>
                <Desc>
                  {contryCode !== 'KR' ? '$' : '₩'}
                  {selectedPlan &&
                    (formData.subscription === 'monthly'
                      ? priceToString(selectedPlan.amountPerMonth)
                      : priceToString(selectedPlan.annualSale))}
                </Desc>
              </div>
            </ReceiptBody>
            <ReceiptBody>
              <Desc>{t('Upcoming Payment Date')}</Desc>
              <Desc customStyles="color: #88909C;">
                {formData.subscription === 'monthly'
                  ? Moment(formData.payDate).add(1, 'month').format('ll')
                  : Moment(formData.payDate).add(1, 'year').format('ll')}
              </Desc>
            </ReceiptBody>
          </ReceiptContainer>
          <Hr />
          {showTerms ? (
            <TermsContainer>
              <FormControlLabel
                required
                control={<Checkbox checked={formData.terms} onChange={(e) => handleChange(e)} name="terms" />}
                label={t('I agree to all of the terms below(Required)')}
              />
              {/* Terms of Use TextArea */}
              <Textarea maxRows={7.5} defaultValue={language === 'en' ? TERMS_OF_USE_EN : TERMS_OF_USE_KR} readOnly />
            </TermsContainer>
          ) : (
            <br />
          )}
          <ButtonContainer>
            <StartButton
              onClick={onClickHandler}
              disabled={
                selectedPlanTier === 'free'
                  ? isExpired
                    ? false
                    : isNotChanged
                  : orderIdAtFirst === ''
                  ? false
                  : isNotChanged
              }
            >
              {selectedPlanTier === 'free' ? t('Restart for Free') : t('Submit')}
            </StartButton>
            {/* 결제 누락 처리용 추가 */}
            {/* <Button variant="outlined" onClick={payWithOrderId}>
              {t('Pay with order_Id')}
            </Button> */}
          </ButtonContainer>
        </Container>
      </Root>
      {openPlanModal && (
        <PlanModal
          open={openPlanModal}
          onClose={() => {
            setOpenPlanModal(false);
          }}
        />
      )}
      <ModalBox state={isOpen} setState={onClose} modalConf={modalConf}>
        <PaymentInfo
          setIsPaying={setIsPaying}
          formData={formData}
          selectedPlan={selectedPlan}
          contryCode={contryCode}
          onClose={onClose}
          setPaypalOrderId={setPaypalOrderId}
          isUpgrade={isUpgrade}
          addAndUpdateDocs={addAndUpdateDocs}
          isFirstPayment={false}
        />
      </ModalBox>
    </>
  );
}

export default Page;

const Root = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 10px 135px;
  width: 100%;

  @media (max-width: 768px) {
    // padding: 50px 0 100px; // 예시: padding 조정
  }
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Noto Sans', sans-serif;
  width: 100vw;
  max-width: 1200px;

  @media (max-width: 768px) {
    padding: 0 20px; // 예시: padding 조정
    width: 100%;
  }
`;

const Title = styled.span`
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 40px;
`;

const Hr = styled.hr`
  width: 75%;
  color: #87909c;

  &.dotted {
    border-top: 1px dotted #000;
  }

  &.dashed {
    border-top: 1px dashed #000;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FormContainer = styled.div<{ customStyles?: string }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 20px 0 30px;
  ${(props) => props.customStyles}

  @media (max-width: 768px) {
    flex-direction: column;
    margin: 0 0 25px;
  }
`;

const FormBody = styled.div<{ customStyles?: string }>`
  width: 70%;
  display: flex;
  flex-direction: column;
  gap: 30px;
  ${(props) => props.customStyles}

  @media (max-width: 768px) {
    width: 100%;
    gap: 0;
  }
`;

const FormTitle = styled.span<{ customStyles?: string }>`
  font-family: Noto Sans;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  ${(props) => props.customStyles}
  & span {
    font-size: 14px;
    color: #115de6;
    cursor: pointer;
    text-decoration: underline;
    margin-left: 5px;
  }
`;

const Desc = styled.span<{ customStyles?: string }>`
  font-family: Noto Sans;
  font-weight: 600;
  font-size: 18px;
  ${(props) => props.customStyles}
`;

const ExhibitionNoContainer = styled.div`
  // height: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  .desc {
    display: flex;
    flex-direction: column;
    font-family: Noto Sans;
    font-size: 14px;
    font-weight: 400;
  }

  .selectContainer {
    display: flex;

    select {
      margin: 0 auto auto;
    }

    .MuiSelect-select {
      padding: 13.5px 17.5px;
      font-size: 14px;
    }

    .MuiSelect-icon {
      color: #cbd4e1;
    }
  }

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const SubscriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  // margin-top: 18px;

  .desc {
    display: flex;
    font-family: Noto Sans;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  @media (max-width: 768px) {
    margin-top: 20px;
  }
`;

const AddDesc = styled.span<{ customStyles?: string }>`
  font-size: 14px;
  font-weight: 400;
  color: #94a3b8;
  ${(props) => props.customStyles}
`;

const StyledRadioGroup = styled(RadioGroup)`
  & .MuiFormControlLabel-root {
    margin-left: 0;
    margin-right: 0;
    width: 100%;
  }

  & .MuiRadio-root {
    color: #64748b;
    padding: 0 8px 0 0;
  }

  & .MuiFormControlLabel-label {
    width: 100%;
    font-family: Noto Sans;
    font-weight: 600;
    font-size: 16px;
    color: #000;

    .labelContainer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      & div {
        display: flex;
        align-items: center;
        gap: 8px;

        &:first-child {
          margin-top: 3px;
        }
      }
    }

    @media (max-width: 768px) {
      .labelContainer {
        flex-direction: column;

        & div {
          flex-direction: column;
          gap: 0;
        }
      }
    }
  }

  & .Mui-checked {
    color: #115de6 !important;
    padding: 0 8px 0 0;
  }
`;

const StyledFormControlLabel = styled(FormControlLabel)<{ checked: boolean; first?: string }>`
  border: ${(props) => (props.checked ? '2px solid #115DE6' : '1px solid #64748b')};
  border-radius: 5px;
  padding: ${(props) => (props.checked ? '19px' : '20px')};
  ${(props) => props.first === 'true' && 'margin-bottom: 12px;'};
`;

const ReceiptContainer = styled.div`
  width: 75%;
  display: flex;
  flex-direction: column;
  margin: 20px 0 28px;
  gap: 20px;
`;

const ReceiptBody = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TermsContainer = styled.div`
  & .MuiFormControlLabel-label {
    user-select: none;
    font-family: Noto Sans;
    font-size: 14px;
  }

  width: 75%;
  display: flex;
  flex-direction: column;
  margin: 11px 0 70px;
`;

const Textarea = styled(TextareaAutosize)(
  ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    font-family: 'Noto Sans';
    font-size: 14px;
    font-weight: 400;
    line-height: 1.5;
    padding: 15px 20px;
    border-radius: 5px;
    color: #CBD4E1;
    border: 1px solid #CBD4E1;

    &:hover {
    //   border-color: #115DE6;
    }

    &:focus {
    //   border-color: #115DE6};
        color: #000;
    }

    // firefox
    &:focus-visible {
      outline: 0;
    }
  `
);

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-direction: column;
  gap: 20px;
`;

const StartButton = styled(Button)`
  width: 500px;
  font-family: Noto Sans;
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  background-color: #115de6;
  padding: 13.5px 20px;
  border-radius: 5px;

  &:hover {
    background-color: #0a4d9b;
  }
  &:disabled {
    background-color: #d3d3d3;
  }
`;

const PlanContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlanItem = styled.div<{ selected: boolean; disabled: boolean }>`
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: space-between;
  padding: 38px 20px;
  border: 1px solid #94a3b8;
  border-radius: 5px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  word-break: keep-all;
  color: ${({ selected, disabled }) => (disabled ? '#aeaeae' : selected ? '#fff' : '#000')};
  background-color: ${({ selected }) => (selected ? '#115DE6' : 'transparent')};
  border-color: ${({ selected }) => (selected ? 'transparent' : '#94a3b8')};

  @media (max-width: 768px) {
    position: relative;

    & div {
      position: absolute;
      right: 20px;
    }
  }
`;

const StyledHr = styled(Hr)`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;
