'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import FormInput from '@/components/FormInput';
import styled from '@emotion/styled';
import ShortUniqueId from 'short-unique-id';
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  TextareaAutosize,
} from '@mui/material';
import SelectItem from '@/components/SelectItem';
import { useUserStore } from '@/store/user';
import { PAYMENT } from '@/constants/payment';
import { Grade, GradePlan, NonGradePlan, Plan } from '@/type/Payment';
import priceToString from '@/utils/priceToString';
import Moment from 'moment';
import { getProjectUrls, updateProjectData } from '@/api/firestore/getProject';
import { db } from '@/lib/firebase';
import { collection, deleteDoc, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import Loading from '@/app/loading';
import { moduleActionApis } from '@/api/module';
import { useRouter } from 'next/navigation';
import { TERMS_OF_USE_EN, TERMS_OF_USE_KR } from '@/constants/terms';
import { useTranslation } from 'react-i18next';
import SmallInfoIcon from '@/images/icons/SmallInfoIcon';
import { paymentHandler } from '@/lib/iamport';
import Modal from '@/components/Modal';
import ModalBox from '@/components/Modal';
import PaymentInfo from '@/components/account/payment/PaymentInfo';
import { useProjectStore } from '@/store/project';
import { updateCurrentUser } from '@/api/firestore/getUsers';
import sendNotification from '@/utils/sendNodification';
import PlanModal from '@/components/home/plan/PlanModal';
import getPriceByCountryCode from '@/utils/getPriceByCountryCode';
import { updateExhibitionByProjectId } from '@/api/firestore/getExhibitions';
import { useLanguageStore } from '@/store/language';
import { ReservedWords } from '@/constants/projectUrl';

interface Props {}

export default function Page({}: Props) {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const {
    uid,
    email,
    userName,
    updateInfo: updateUserInfo,
    updatePaymentStatus,
    countryCodeText,
    updateProjectMap,
  } = useUserStore();
  const { projectId, updateInfo } = useProjectStore();
  const [planInfos, setPlanInfos] = useState<Plan[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isFreeTrial, setIsFreeTrial] = useState<boolean>(false);
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [selectedPlanTier, setSelectedPlanTier] = useState<string>('free');
  const [openPlanModal, setOpenPlanModal] = useState<boolean>(false);
  const { language } = useLanguageStore();
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
  const [formData, setFormData] = useState({
    email: email,
    name: userName,
    userId: uid,
    billingPlan: 'business-1',
    cardNo: '',
    exDate: '',
    cvcNo: '',
    coupon: '',
    subscription: 'annual',
    exLimitNo: 20,
    terms: false,
    payDate: new Date(),
    projectId: projectId,
    projectUrl: new ShortUniqueId().randomUUID(8),
    isUpgrade: false,
    expiredAt: Timestamp.now(),
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
  const [isOpen, setIsOpen] = useState(false);
  const [modalConf, setModalConf] = useState({});
  const [paypalOrderId, setPaypalOrderId] = useState('');

  useEffect(() => {
    const tempKey = new ShortUniqueId().randomUUID(8);
    const today = new Date();
    setFormData((prevState) => ({
      ...prevState,
      payDate: today,
      // projectUrl: tempKey,
    }));
  }, []);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    selectedPlanRef.current = selectedPlan;
  }, [selectedPlan]);

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
      // if (['business', 'enterprise'].includes(key)) {
      if (plan.hasGrade) {
        plan.grades.forEach((grade) => {
          tempPlans.push(grade);
        });
      } else {
        tempPlans.push(plan as NonGradePlan);
      }
      tempPlanInfos.push(plan);
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
        email: email,
        name: userName,
        userId: uid,
        projectId,
      }));
    }
  }, [uid, formData.userId]);

  useEffect(() => {
    if (!formData.exLimitNo) return;
    setSelectedPlan(plans.find((plan: any) => plan.maxExhibition === formData.exLimitNo));
  }, [formData.exLimitNo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    console.log('change', name, value);
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

  const addAndUpdateDocs = async (data: any, expiredAt: Date, orderId: string) => {
    // Project 업데이트
    await updateDoc(doc(db, 'Project', projectId), {
      projectUrl: formDataRef.current.projectUrl,
      subscriptionModel: formDataRef.current.subscription,
      tier: selectedPlanTier.toLowerCase(),
      exhibitionLimit: formDataRef.current.exLimitNo,
      expiredAt,
      config: {
        adminMaxCount: selectedPlanRef.current.adminMaxCount,
      },
    });
    // 해당 프로젝트 전시 정보 업데이트
    await updateExhibitionByProjectId(projectId, {
      projectTier: selectedPlanTier.toLowerCase(),
      projectExpiredAt: expiredAt,
    });

    if (selectedPlanTier !== 'free') {
      // 빌링키 업데이트
      await updateCurrentUser(uid, 'owner', {
        ['paymentStatus.billingKey']: true,
        ['paymentStatus.paid']: true,
        updatedAt: Timestamp.now(),
      });
      updatePaymentStatus('billingKey', true);
      updatePaymentStatus('paid', true);
    } else {
      await updateCurrentUser(uid, 'owner', {
        ['paymentStatus.paid']: true,
        updatedAt: Timestamp.now(),
      });
      updatePaymentStatus('paid', true);
    }
    await updateProjectData(projectId, {
      subscriptionModel: formDataRef.current.subscription,
      exhibitionLimit: formDataRef.current.exLimitNo,
      expiredAt: expiredAt,
      updatedAt: Timestamp.now(),
      status: selectedPlanTier !== 'free' ? 'processing' : 'activated',
      tier: selectedPlanTier.toLowerCase(),
    });
    updateInfo('isExpired', false);
    updateInfo('status', selectedPlanTier !== 'free' ? 'processing' : 'activated');
    updateInfo('tier', selectedPlanTier.toLowerCase());

    updateInfo('projectUrl', formDataRef.current.projectUrl);
    updateProjectMap(projectId);

    // Order 업데이트
    const orderDoc = doc(db, 'Order', orderId);
    const addtionalDataForFree =
      selectedPlanTier === 'free'
        ? {
            id: orderId,
            amount: data.price,
            status: 'paid',
            paid_at: data.startAt.seconds,
          }
        : {};
    await updateDoc(orderDoc, {
      updatedAt: Timestamp.now(),
      projectId: projectId,
      ...addtionalDataForFree,
    });
    if (selectedPlanTier !== 'free') {
      // New Order 업데이트
      const newOrderDoc = doc(db, 'Order', data.newOrderId);
      await updateDoc(newOrderDoc, {
        updatedAt: Timestamp.now(),
        projectId: projectId,
        // 최초 결제시 빌링키 결제로 변경되어 수정
        // status: 'reserved',
      });
    }
    // 프로젝트 추가 후, 모듈 API 호출
    // cloud 안 쓸 예정이라 삭제.
    // await moduleActionApis
    //   .setProject(projectId, {})
    //   .then((res) => {
    //     console.log('Set project module complete!', res);
    //   })
    //   .catch((e) => {
    //     console.error('Set project module error!', e);
    //   });

    // 구독 완료 알림
    await sendNotification('N1003', uid, {});
  };

  const startForFree = async (orderId: string) => {
    const orderDoc = doc(db, 'Order', orderId);
    const orderSnap = await getDoc(orderDoc);

    if (orderSnap.exists()) {
      const data = orderSnap.data();
      const expiredAt = new Date(data.endAt.seconds * 1000 + data.endAt.nanoseconds / 1000000);

      // Add and update docs
      addAndUpdateDocs(data, expiredAt, orderId);
      // 무료 플랜으로 시작합니다!
      // alert(t(`Welcome to Onthewall!`));

      updateInfo('projectUrl', formDataRef.current.projectUrl);
      updateProjectMap(projectId);

      router.push(`/${formDataRef.current.projectUrl}/main`);
      setIsPaying(false);
    }
  };

  const onSubmit = async () => {
    const urlInput = document.querySelector('input[name="projectUrl"]') as HTMLInputElement;
    if (!formDataRef.current.terms) {
      alert(t('Please agree to the terms'));
      return;
    } else if (formDataRef.current.projectUrl === '') {
      alert(t('Please enter your project URL'));
      if (urlInput) {
        urlInput.focus();
      }
      return;
    } else if (formDataRef.current.projectUrl !== '') {
      // Project ID 예약어 체크

      if (!validateInput('projectUrl', formDataRef.current.projectUrl)) {
        alert(
          t(
            'Your URL is invalid.\nOnly alphabets and numbers are allowed.\nMinimum 5 characters, maximum 20 characters are allowed.'
          )
        );
        // 해당 input field 비우고 foucs
        setFormData((prevState) => ({
          ...prevState,
          projectUrl: '',
        }));
        if (urlInput) {
          urlInput.focus();
        }
        return;
      } else if (ReservedWords.includes(formDataRef.current.projectUrl)) {
        alert(t('This URL is not available'));
        // 해당 input field 비우고 foucs
        setFormData((prevState) => ({
          ...prevState,
          projectUrl: '',
        }));
        if (urlInput) {
          urlInput.focus();
        }
        return;
      }
      await isUrlExist(formDataRef.current.projectUrl).then((res) => {
        if (res) {
          // 해당 input field 비우고 foucs
          setFormData((prevState) => ({
            ...prevState,
            projectUrl: '',
          }));
          if (urlInput) {
            urlInput.focus();
          }
          alert(t('This URL is already in use'));
          return;
        } else {
          if (selectedPlanTier !== 'free' && contryCode !== 'KR') {
            // paypal 결제
            setIsOpen(true);
          } else {
            // API 호출
            console.log('API 호출 for project URL');
            setIsPaying(true);
            // 결제 로직
            paymentHandler(
              router,
              t,
              formDataRef.current,
              selectedPlanRef.current,
              isFreeTrial,
              selectedPlanTier,
              setIsPaying,
              true,
              undefined,
              startForFree,
              addAndUpdateDocs,
              contryCode
            );
          }
        }
      });
    }
  };

  const validateInput = (name: string, value: string) => {
    switch (name) {
      case 'cardNo':
        return /^\d{16}$/.test(value); // 카드 번호는 16자리 숫자
      case 'exDate':
        return /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value); // MM/YY 형식
      case 'cvcNo':
        return /^\d{3,4}$/.test(value); // CVC는 3자리 또는 4자리 숫자
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); // 이메일 형식
      case 'projectUrl':
        // 최소 5자리, 최대 20자리, 영문 대소문자, 숫자만 허용
        // return /^[a-zA-Z][a-zA-Z0-9]{0,19}$/.test(value);
        return /^[a-zA-Z0-9]{5,20}$/.test(value);
      default:
        return true;
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value !== '' && !validateInput(name, value)) {
      switch (name) {
        case 'cardNo':
          alert(t('Card number is invalid'));
          break;
        case 'exDate':
          alert(t('Expiration date is invalid'));
          break;
        case 'cvcNo':
          alert(t('CVC is invalid'));
          break;
        case 'email':
          alert(t('Email is invalid'));
          break;
        case 'projectUrl':
          // 맨 앞글자가 영어인지 확인
          // if (!/^[a-zA-Z]/.test(value)) {
          // 	alert('Your URL is invalid\nThe first letter must be an alphabet');
          // } else {
          //최소 5자, 최대 20자, 숫자 영어만 가능
          alert(
            t(
              'Your URL is invalid.\nOnly alphabets and numbers are allowed.\nMinimum 5 characters, maximum 20 characters are allowed.'
            )
          );
          // }
          break;
        default:
          alert(`${name} ${t('is invalid')}`);
      }
      // 해당 input field 비우고 foucs
      setFormData((prevState) => ({
        ...prevState,
        [name]: '',
      }));
      e.target.focus();
    }
  };

  const isUrlExist = async (url: string) => {
    let isExist = false;
    await getProjectUrls().then((res) => {
      if (!res) return;
      res.find((ele: string) => {
        if (ele === url) {
          isExist = true;
        }
      });
    });
    return isExist;
  };

  const handlePlanSelect = (value: string) => {
    setSelectedPlanTier(value);
    if (value === 'free' || value.includes('personal')) {
      setFormData((prevState) => ({ ...prevState, projectUrl: new ShortUniqueId().randomUUID(8) }));
    } else {
      setFormData((prevState) => ({ ...prevState, projectUrl: '' }));
    }
  };

  useEffect(() => {
    if (!selectedPlanTier) return;
    const tempPlans: (Grade | NonGradePlan)[] = [];
    Object.keys(localizedPayment).forEach((key) => {
      const plan = localizedPayment[key] as Plan;
      if (plan.hasGrade) {
        plan.grades.forEach((grade) => {
          if (grade.value.includes(selectedPlanTier)) {
            tempPlans.push(grade);
          }
        });
      } else {
        if ((plan as NonGradePlan).value === selectedPlanTier) {
          tempPlans.push(plan as NonGradePlan);
        }
      }
    });
    setPlans(tempPlans);
    setFormData((prevState) => ({
      ...prevState,
      exLimitNo: tempPlans[0].maxExhibition,
      subscription: selectedPlanTier === 'free' ? 'annual' : prevState.subscription,
    }));
  }, [selectedPlanTier]);

  const onClickModalInfo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenPlanModal(true);
  };

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

  return (
    <>
      <Root>
        {isPaying && <Loading isSpinner={true} />}
        <Container>
          <TrialContainer>
            <TrialTitle>{t('Choose the plan that suits you.')}</TrialTitle>
            <TrialDesc>
              {t('Compare and select from various exhibition options on Onthewall.')}
              <br />
              {t(`*All plans can be changed or canceled freely.`)}
            </TrialDesc>
            <TrialInput>
              <span>https://onthewall.io/</span>
              <TextField
                id="standard-basic"
                label={selectedPlanTier === 'free' || selectedPlanTier.includes('personal') ? '' : t('your link')}
                variant="standard"
                value={formData.projectUrl}
                name="projectUrl"
                onChange={handleChange}
                disabled={selectedPlanTier === 'free' || selectedPlanTier.includes('personal')}
              />
            </TrialInput>
          </TrialContainer>
          <Hr />
          <FormContainer customStyles="margin:0 0 25px;">
            <FormBody customStyles="width: 100%;">
              <FormTitle customStyles="margin-top: 15px;">
                {t('Plan')} <span onClick={handlePlanModalOpen}>{t('Details')}</span>
              </FormTitle>

              <PlanContainer>
                {planInfos.map((plan: any) => (
                  <PlanItem
                    key={plan.value}
                    selected={selectedPlanTier === plan.value}
                    onClick={() => handlePlanSelect(plan.value)}
                  >
                    <Desc>{t(plan.label)}</Desc>
                    <Desc customStyles="font-size: 16px; font-weight: 400;">{t(plan.desc)}</Desc>
                    {/* <div onClick={onClickModalInfo}>
                      <SmallInfoIcon fill={selectedPlanTier === plan.value ? '#fff' : '#94A3B8'} />
                    </div> */}
                  </PlanItem>
                ))}
              </PlanContainer>
            </FormBody>
          </FormContainer>
          <FormContainer>
            <FormBody>
              {/* <CardDetailsContainer>
								<FormTitle>Card details</FormTitle>
								<FormInput
									name="cardNo"
									value={formData.cardNo}
									placeholder="Credit card number"
									onChange={handleChange}
									onBlur={handleBlur}
									className={`default no-margin`}
									customStyles="margin-bottom: 12px !important;"
								/>
								<FormInput
									name="exDate"
									value={formData.exDate}
									placeholder="MM/YY"
									onChange={handleChange}
									onBlur={handleBlur}
									className={`default no-margin`}
									customStyles="margin-bottom: 12px !important;"
									maxLength={5}
								/>
								<FormInput
									name="cvcNo"
									value={formData.cvcNo}
									placeholder="CVC"
									onBlur={handleBlur}
									onChange={handleChange}
									className={`default no-margin`}
									customStyles="margin-bottom: 34px !important;"
									maxLength={4}
								/>
								<Hr />
							</CardDetailsContainer> */}
              <StyledHr className="dashed" />
              <ExhibitionNoContainer>
                <div className="desc">
                  <Desc>{t('Number of Exhibitions')}</Desc>
                  <span>
                    {Moment(formData.payDate).format('MM.DD.YYYY')} ~{' '}
                    {isFreeTrial
                      ? Moment(formData.payDate).add(14, 'day').subtract(1, 'day').format('MM.DD.YYYY')
                      : formData.subscription === 'monthly'
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
              <Hr className="dashed" />
              <FormTitle customStyles="margin-top: 15px;">{t('Coupon')}</FormTitle>
              <FormInput
                name="coupon"
                value={formData.coupon}
                placeholder={t('Enter your promotion code')}
                onChange={(e) => handleChange(e)}
                className={`default no-margin`}
              />
            </FormBody>
            <StyledHr className="dashed" />
            <FormBody>
              {/* <FormTitle>Plan</FormTitle> */}
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
                            ({t('Monthly ')}
                            {contryCode !== 'KR' ? '$' : '₩'}
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
                {isFreeTrial ? (
                  <>
                    <Desc>{t(`${contryCode !== 'KR' ? '$' : '₩'}0`)}</Desc>
                    <Desc customStyles="color: #88909C; font-weight: 400; text-decoration: line-through; margin-left: 5px;">
                      {contryCode !== 'KR' ? '$' : '₩'}
                      {selectedPlan &&
                        (formData.subscription === 'monthly'
                          ? priceToString(selectedPlan.amountPerMonth)
                          : priceToString(selectedPlan.annualSale))}
                    </Desc>
                  </>
                ) : (
                  <Desc>
                    {contryCode !== 'KR' ? '$' : '₩'}
                    {selectedPlan &&
                      (formData.subscription === 'monthly'
                        ? priceToString(selectedPlan.amountPerMonth)
                        : priceToString(selectedPlan.annualSale))}
                  </Desc>
                )}
              </div>
            </ReceiptBody>
            <ReceiptBody>
              <Desc>{t('Upcoming Payment Date')}</Desc>
              <Desc customStyles="color: #88909C;">
                {isFreeTrial
                  ? Moment(formData.payDate).add(14, 'day').format('ll')
                  : formData.subscription === 'monthly'
                  ? Moment(formData.payDate).add(1, 'month').format('ll')
                  : Moment(formData.payDate).add(1, 'year').format('ll')}
              </Desc>
            </ReceiptBody>
          </ReceiptContainer>
          <Hr />
          <TermsContainer>
            <FormControlLabel
              required
              control={<Checkbox checked={formData.terms} onChange={(e) => handleChange(e)} name="terms" />}
              label={t('I agree to all of the terms below(Required)')}
            />
            {/* Terms of Use TextArea */}
            <Textarea maxRows={7.5} defaultValue={language === 'en' ? TERMS_OF_USE_EN : TERMS_OF_USE_KR} readOnly />
          </TermsContainer>
          <ButtonContainer>
            <StartButton onClick={onSubmit}>
              {selectedPlanTier === 'free' ? t('Start for Free') : t('Submit')}
            </StartButton>
          </ButtonContainer>
        </Container>
      </Root>
      {/* <Modal state={openPlanModal} setState={() => setOpenPlanModal(false)} modalConf={{ title: 'plan 설명' }} /> */}
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
          isUpgrade={false}
          addAndUpdateDocs={addAndUpdateDocs}
          isFirstPayment={true}
        />
      </ModalBox>
    </>
  );
}

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

const TrialContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  margin-bottom: 30px;
`;

const TrialTitle = styled.span`
  max-width: 500px;
  font-weight: bold;
  font-size: 28px;
  margin-bottom: 13px;
`;

const TrialDesc = styled.span`
  max-width: 550px;
  font-weight: 400;
  font-size: 16px;
  color: #88909c;
  margin-bottom: 15px;
`;

const TrialInput = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-weight: 700;
`;

const Hr = styled.hr`
  width: 100%;
  color: #87909c;

  &.dotted {
    border-top: 1px dotted #000;
  }

  &.dashed {
    border-top: 1px dashed #000;
  }
`;

const FormContainer = styled.div<{ customStyles?: string }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 20px 0 30px;
  ${(props) => props.customStyles} @media (
    max-width: 768px) {
    flex-direction: column;
    margin: 0 0 25px;
  }
`;

const FormBody = styled.div<{ customStyles?: string }>`
  width: 45%;
  display: flex;
  flex-direction: column;
  ${(props) => props.customStyles} @media (
    max-width: 768px) {
    width: 100%;
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

const CardDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
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
      margin: auto;
      margin-top: 0;
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
    padding: 0;
    padding-right: 8px;
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
    padding: 0;
    padding-right: 8px;
  }
`;

const StyledFormControlLabel = styled(FormControlLabel)<{ checked: boolean; first?: string }>`
  border: ${(props) => (props.checked ? '2px solid #115DE6' : '1px solid #64748b')};
  border-radius: 5px;
  padding: ${(props) => (props.checked ? '19px' : '20px')};
  ${(props) => props.first === 'true' && 'margin-bottom: 12px;'};
`;

const ReceiptContainer = styled.div`
  width: 100%;
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

  width: 100%;
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
`;

const PlanContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PlanItem = styled.div<{ selected: boolean }>`
  display: flex;
  gap: 10px;
  flex-direction: column;
  justify-content: space-between;
  padding: 38px 20px;
  border: 1px solid #94a3b8;
  border-radius: 5px;
  cursor: pointer;
  word-break: keep-all;
  color: ${({ selected }) => (selected ? '#fff' : '#000')};
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
