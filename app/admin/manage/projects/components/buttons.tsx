import Dropdown from '@mui/joy/Dropdown';
import MenuButton from '@mui/joy/MenuButton';
import IconButton from '@mui/joy/IconButton';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@mui/material/Modal';
import CloseIcon from '@/images/icons/Close';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';
import SelectItem from '@/components/SelectItem';
import { comparePlan } from '@/constants/plan';
import { Grade, NonGradePlan, Plan } from '@/type/Payment';
import { PAYMENT } from '@/constants/payment';
import { TextField } from '@mui/material';
import { adminApis } from '@/api/admin';
import { Timestamp } from 'firebase/firestore';
import { updateProjectData } from '@/api/firestore/getProject';
import { addOrder, getOrderByProjectIdRealtime } from '@/api/firestore/getOrder';
import { updateCurrentUser } from '@/api/firestore/getUsers';
import { updateExhibitionByProjectId, updateExhibitionByUid } from '@/api/firestore/getExhibitions';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: any;
  onClose: () => void;
}

export const Actions = ({ isOpen, setIsOpen, data, onClose }: Props) => {
  const { i18n, t } = useTranslation();
  const [tiers, setTiers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isSelect, setIsSelect] = useState(false);
  const [orderId, setOrderId] = React.useState('');
  const orderIdRef = useRef<string>(orderId);

  const [formData, setFormData] = useState({
    tier: '',
    exhibitionLimit: 0,
    expiredAt: Timestamp.now(),
    status: 'expired',
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

  useEffect(() => {
    let unsubscribe = () => {};
    // 결제 예약이 있는지 확인
    if (data.id) {
      unsubscribe = getOrderByProjectIdRealtime(data.id, (res: any) => {
        if (res) setOrderId(res?.id);
        else setOrderId('');
      });
    }
    setTiers(
      comparePlan.slice(0, 4).map((plan) => ({
        title: plan,
        value: plan.toLowerCase() as ProjectStatus,
      }))
    );

    setFormData({
      tier: data.tier as ProjectTier,
      exhibitionLimit: data.exhibitionLimit,
      expiredAt: data.expiredAt,
      status: 'activated' as ProjectStatus,
    });
    return () => {
      unsubscribe();
    };
  }, [data]);

  useEffect(() => {
    orderIdRef.current = orderId;
  }, [orderId]);

  const handleConfirmButton = async () => {
    const { tier, exhibitionLimit, expiredAt } = formData;

    if (!tier) {
      alert(t('Please select a Tier.'));
      return;
    }

    if (!exhibitionLimit || exhibitionLimit === 0) {
      alert(t('Please select an Exhibition Limit.'));
      return;
    }

    if (!expiredAt) {
      alert(t('Please select an expiration date.'));
      return;
    }

    const now = new Date();
    const selectedDate = new Date(expiredAt.toDate());
    const selectedAmount = selectedPlan && selectedPlan.annualSale;
    const customDataStr = JSON.stringify({
      buyer_id: data.ownerId,
      plan: selectedPlan.value,
      payPeriod: 12,
      amount: selectedAmount,
      promotionCode: '',
      isUpgrade: false,
      isCloud: true,
      isFreeTrial: false,
    });

    if (selectedDate < now) {
      alert(t('The expiration date cannot be earlier than today.'));
      return;
    }
    try {
      if (orderIdRef.current !== '') {
        // cancel subscription
        await axios
          .post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payScheduleCancel', {
            customer_uid: data.ownerId,
            merchant_uid: orderIdRef.current,
          })
          .then(async (res) => {
            if (res.data.status !== 'success') {
              alert(t('Failed to cancel subscription.\n') + res.data.message);
              return;
            } else {
              console.log('Subscription cancelled successfully.');
            }
          })
          .catch(async (err) => {
            console.log(err);
            if (err.response.data.status === 'cancelFail' || !err.response.data.message) {
              alert(t('Failed to cancel subscription.\n') + err.response.data.message);
            } else {
              alert(t('Failed to cancel subscription.\n') + err);
            }
            return;
          });
      }
      // Project 데이터 업데이트
      await updateProjectData(data.id, { ...formData, subscriptionModel: 'custom', updatedAt: Timestamp.now() });
      // User 데이터 업데이트
      await updateCurrentUser(data.ownerId, 'owner', {
        ['paymentStatus.paid']: true,
        ['paymentStatus.billingKey']: false,
        updatedAt: Timestamp.now(),
      });
      // Order 데이터 삽입
      await addOrder({
        amount: selectedAmount,
        price: selectedAmount,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        buyer_id: data.ownerId,
        plan: selectedPlan.value,
        payPeriod: 12,
        projectId: data.id,
        promotionCode: '',
        startAt: Timestamp.now(),
        paid_at: Timestamp.now().seconds,
        endAt: expiredAt,
        isUpgrade: false,
        isFreeTrial: false,
        // 커스텀 상태 추가
        status: 'custom',
        custom_data: customDataStr,
      });
      // Exhibition 데이터 업데이트
      await updateExhibitionByProjectId(data.id, {
        projectTier: tier,
        projectExpiredAt: expiredAt,
        updatedAt: Timestamp.now(),
      });
      // Exhibition 데이터 업데이트(uid)
      await updateExhibitionByUid(data.ownerId, {
        projectId: data.id,
        projectTier: tier,
        projectExpiredAt: expiredAt,
        updatedAt: Timestamp.now(),
      });
      alert(t('Successfully updated.'));
    } catch (e) {
      console.error('Error updating data: ', e);
      alert(t('Failed to update.'));
    } finally {
      handleClose();
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIsSelect(true);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // 입력된 날짜를 기반으로 Date 객체 생성
    const selectedDate = new Date(value);

    // 시간을 23시 59분으로 설정
    selectedDate.setHours(23, 59, 0, 0); // (hour, minute, second, millisecond)

    setFormData((prev) => ({
      ...prev,
      expiredAt: Timestamp.fromDate(selectedDate),
    }));
  };

  useEffect(() => {
    if (!formData.tier) return;
    const selectedTier = formData.tier;

    const tempPlans: (Grade | NonGradePlan)[] = [];
    Object.keys(PAYMENT).forEach((key) => {
      const plan = PAYMENT[key] as Plan;
      if (plan.hasGrade) {
        plan.grades.forEach((grade) => {
          if (grade.value.includes(selectedTier)) {
            tempPlans.push(grade);
          }
        });
      } else {
        if ((plan as NonGradePlan).value === selectedTier) {
          tempPlans.push(plan as NonGradePlan);
        }
      }
    });
    setPlans(tempPlans);
    setFormData((prev) => ({
      ...prev,
      exhibitionLimit: isSelect ? tempPlans[0].maxExhibition : prev.exhibitionLimit,
    }));
  }, [formData.tier]);

  useEffect(() => {
    if (formData.exhibitionLimit && plans.length > 0) {
      const selectedPlan = plans.find((plan) => plan.maxExhibition === formData.exhibitionLimit);
      if (selectedPlan) {
        setSelectedPlan(selectedPlan as Grade | NonGradePlan);
      }
    }
  }, [formData.exhibitionLimit, plans]);

  const handleClose = () => {
    onClose();
    setIsSelect(false);
  };

  const getDate = (expiredAt: Timestamp) => {
    if (!expiredAt) return '';
    return new Date(expiredAt.seconds * 1000).toISOString().split('T')[0];
  };

  return (
    <>
      {/* <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{ root: { color: 'neutral', size: 'sm' } }}
        >
          <MoreHorizRoundedIcon />
        </MenuButton>
        <Menu size="sm" sx={{ minWidth: 140 }}>
          <MenuItem onClick={() => setIsOpen(true)}>Edit</MenuItem>
        </Menu>
      </Dropdown> */}
      <>
        <Modal open={isOpen} onClose={handleClose}>
          <Box>
            <CloseButton onClick={onClose}>
              <CloseIcon className="w-6 h-6" />
            </CloseButton>
            <Contents>
              <Row>
                <Label>{t('Tier')}</Label>
                <SelectItem name="tier" value={formData.tier} onChange={handleSelectChange} items={tiers}></SelectItem>
              </Row>
              <Row>
                <Label>{t('ExhibitionLimit')}</Label>
                <SelectItem
                  name="exhibitionLimit"
                  value={formData.exhibitionLimit}
                  onChange={handleSelectChange}
                  items={plans.map((plan) => ({
                    title: '~ ' + plan.maxExhibition.toString(),
                    value: plan.maxExhibition,
                  }))}
                  style={{ width: 'auto' }}
                ></SelectItem>
              </Row>
              <Row>
                <Label>{t('ExpiredAt')}</Label>
                <TextField
                  type="date"
                  value={getDate(formData.expiredAt)}
                  onChange={handleDateChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{ width: 'auto' }}
                />
              </Row>
            </Contents>
            <Buttons>
              <StyleButton
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleClose();
                }}
                style={{ textTransform: 'capitalize' }}
              >
                {t('Close')}
              </StyleButton>
              <StyleButton
                color="primary"
                variant="contained"
                onClick={handleConfirmButton}
                style={{ textTransform: 'capitalize' }}
              >
                {t('Confirm')}
              </StyleButton>
            </Buttons>
          </Box>
        </Modal>
      </>
    </>
  );
};

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 40px;
  border-radius: 10px;
  min-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const CloseButton = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const Buttons = styled.div`
  display: flex;
  margin-top: 40px;
  gap: 10px;
`;

const StyleButton = styled(Button)`
  cursor: pointer;
  padding: 7px 70px;
  border-radius: 5px;
`;

const Contents = styled.div`
  width: 100%;
  padding: 22px 42px;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 10px;
`;

const Label = styled.div`
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: -0.02em;
  color: #94a2b8;
  font-weight: 500;
  width: 150px;
`;
