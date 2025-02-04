// notification 보내는 함수
// config는 optional

import { getDoc, doc, Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationType, NotificationPath, NotificationData } from '@/type/Notification';
import { NOTIFICATION_CODE } from '@/constants/notificationCode';

type ConfigNotification = {
  // type 입력 안해도 code에 등록되어있으면 자동으로 type이 들어감. 특정 type으로 보내고 싶으면 입력
  type?: NotificationType;
  // path 입력 안해도 code에 등록되어있으면 자동으로 path가 들어감. 특정 path로 보내고 싶으면 입력
  path?: NotificationPath;
  // code에 등록되어있지 않은 특별한 title을 넣고 싶을 때 사용.
  title?: {
    [key in 'en' | 'ko']: string;
  };
  // 유저의 세팅과 관계없이 무조건 메일, 카카오 전송
  important?: boolean;
};

const sendNotification = async (code: string, uid: string, data: any, config: ConfigNotification = {}) => {
  const userSnap = await getDoc(doc(db, 'User', uid));
  const user: UserInfo = userSnap.data() as UserInfo;

  if (!user) {
    return {
      status: 'fail',
      message: 'User not found',
    };
  }
  if (!user.alarmStatus) {
    return {
      status: 'fail',
      message: 'User alarm status not found',
    };
  }
  if (!user.email) {
    return {
      status: 'fail',
      message: 'User email not found',
    };
  }

  const notification: NotificationData = {
    // 기본 정보
    uid: user.uid,
    email: user.email,
    countryCode: user.countryCode,
    phone: user.phone,
    isNotificationRead: false,
    createdAt: Timestamp.now(),

    // 알림 설정
    alarmStatus: user.alarmStatus,

    // 알림 정보
    code,
    data,
    important: config.important || false,
    path: config.path || (NOTIFICATION_CODE[code].path as NotificationPath),
    type: config.type || (NOTIFICATION_CODE[code].type as NotificationType),
    ...config,
  };

  await addDoc(collection(db, 'Notification'), notification);
  return {
    status: 'success',
    message: 'Notification sent',
  };
};

export default sendNotification;
