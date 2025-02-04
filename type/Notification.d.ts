import { Timestamp } from 'firebase/firestore';
type NotificationType = 'info' | 'credit' | 'notification' | 'marketing';
type NotificationPath = 'all' | 'social' | 'web';

type NotificationData = {
  // 기본 정보
  id?: string;
  uid: string;
  email: string;
  countryCode: string;
  phone: string;
  isNotificationRead: boolean;
  createdAt: Timestamp;

  // 알림 설정
  important: boolean;
  title?: {
    [key in 'en' | 'ko']: string;
  };
  alarmStatus: {
    email: boolean;
    kakao: boolean;
    marketing: boolean;
  };
  path?: NotificationPath;
  type?: NotificationType;
  // 알림 정보
  code: string;
  data?: any;
};

type NotificationCodeData = {
  type: string;
  path: NotificationPath;
  title: {
    [key in 'en' | 'ko']: string;
  };
  message?: {
    [key in 'en' | 'ko']: string;
  };
  content: {
    [key in 'en' | 'ko']: string;
  };
  link: string;
};

type NotificationCode = {
  [key: string]: NotificationCodeData;
};
