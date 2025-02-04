import { PAYMENT } from '@/constants/payment';

interface Grade {
  value: string;
  label: string;
  maxExhibition: number;
  amountPerMonth: number;
  annual: number;
  annualSale: number;
  adminMaxCount: number;
}

interface CommonPlan {
  value: string;
  label: string;
  hasGrade: boolean;
  features: string[];
  targetCustomer: string;
  desc: string;
}

interface NonGradePlan extends CommonPlan {
  hasGrade: false;
  maxExhibition: number;
  amountPerMonth: number;
  annual: number;
  annualSale: number;
  adminMaxCount: number;
}

interface GradePlan extends CommonPlan {
  hasGrade: true;
  grades: Grade[];
}

export type Plan = NonGradePlan | GradePlan;

interface PaymentPlans {
  [key: string]: Plan;
}

export type PaymentType = Exclude<
  | keyof typeof PAYMENT
  | (typeof PAYMENT)['personal']['grades'][number]['value']
  | (typeof PAYMENT)['business']['grades'][number]['value'],
  'personal' | 'business'
>;

export type PaymentLabel = Exclude<
  | (typeof PAYMENT)['free' | 'enterprise']['label']
  | (typeof PAYMENT)['personal']['grades'][number]['label']
  | (typeof PAYMENT)['business']['grades'][number]['label'],
  'personal' | 'business'
>;

export type PaymentMaxEx = Exclude<
  | (typeof PAYMENT)['free' | 'enterprise']['maxExhibition']
  | (typeof PAYMENT)['personal']['grades'][number]['maxExhibition']
  | (typeof PAYMENT)['business']['grades'][number]['maxExhibition'],
  'personal' | 'business'
>;
