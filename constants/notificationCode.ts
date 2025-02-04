import { NotificationCode } from '../type/Notification';
const SHOWROOM_DOMAIN = 'https://art.onthewall.io/';
const HOME_DOMAIN = 'https://onthewall.io';
/**
 * Note. 대상에 따른 코드 타입
 *
 *           1. N1--- : Owner
 *           2. N2--- : Admin
 *           3. N3--- : Anyone
 *
 */

export const NOTIFICATION_CODE: NotificationCode = {
  N1001: {
    type: 'credit',
    path: 'all',
    title: {
      en: '[Onthewall] Payment Information Expired',
      ko: '[온더월] 결제 정보 만료 알림',
    },
    message: {
      en: 'Your payment information has expired. Please update your payment details.',
      ko: '결제 정보가 만료되었습니다. 결제 정보를 업데이트해주세요.',
    },
    content: {
      en: 'Your payment information has expired. Please update your payment details.',
      ko: '결제 정보가 만료되었습니다. 결제 정보를 업데이트해주세요.',
    },
    // condition: "결제 정보가 만료되었을 때",
    link: '/account/payment',
  },
  N1002: {
    type: 'credit',
    path: 'all',
    title: {
      en: '[Onthewall] Subscription Ended',
      ko: '[온더월] 구독 종료 알림',
    },
    message: {
      en: 'Your subscription has ended. Please make a payment to continue using the service.',
      ko: '구독이 종료되었습니다. 계속 사용하시려면 결제해주세요.',
    },
    content: {
      en: 'Your subscription has ended. Please make a payment to continue using the service.',
      ko: '구독이 종료되었습니다. 계속 사용하시려면 결제해주세요.',
    },
    // condition: "스스로 구독 취소해서 구독 종료 되었을 때",
    link: '/account/my-page?tab=subscribe',
  },
  N1003: {
    type: 'credit',
    path: 'all',
    title: {
      en: '[Onthewall] Subscription Complete',
      ko: '[온더월] 구독 완료 알림',
    },
    message: {
      en: 'Your subscription is complete. Thank you 🥳',
      ko: '구독이 완료되었습니다. 감사합니다🥳',
    },
    content: {
      en: 'Your subscription is complete. Thank you 🥳',
      ko: '구독이 완료되었습니다. 감사합니다🥳',
    },

    // condition: "",
    link: '',
  },
  N1004: {
    type: 'credit',
    path: 'all',
    title: {
      en: '[Onthewall] Subscription Expiry Reminder',
      ko: '[온더월] 구독 만료 알림',
    },
    message: {
      en: `Hello {{name}},
                  
  We would like to inform you that the free version of the Virtual Exhibition Platform you are currently using will soon expire. The scheduled payment date is [Payment Date], and this notification is sent 7 days prior to the payment date.
  
  Service Details: With the Virtual Exhibition Platform, you can conveniently create and visit various exhibitions from around the world from the comfort of your home. It provides high-resolution images and detailed artwork descriptions to offer an experience similar to an actual exhibition.
  
  Subscription Start Date: {{subscriptionStartDate}}
  Payment Cycle: {{paymentCycle}}
  Payment Date: {{paymentDate}}
  
  If you do not wish to continue using the service, please refer to the cancellation method below.
  
  Cancellation Method:
  
  1. Log in to Onthewall.
  2. Go to the 'My Account' page.
  3. Click on 'Cancel Subscription' in the subscription management section.
  4. Select the reason for cancellation and click 'Confirm' to complete the process.
  
  Cancellation Link: {{cancellationLink}}
  
  If you have any questions, please contact our customer support team.`,
      ko: '곧 무료 버전의 가상 전시 플랫폼 사용이 만료될 예정입니다. 만료일로부터 7일 전에 결제 알림을 보내드립니다.',
    },
    content: {
      en: 'Free version will eb soon expire.',
      ko: '곧 무료 버전의 가상 전시 플랫폼 사용이 만료될 예정입니다. 만료일로부터 7일 전에 결제 알림을 보내드립니다.',
    },
    // condition: "결제 예정일 7일 전에 알림",
    // data type: { name: string, paymentDate: string, subscriptionStartDate: string, paymentCycle: string, cancellationLink: string }
    link: `${HOME_DOMAIN}/account/payment`,
  },
  N1005: {
    type: 'credit',
    path: 'all',
    title: {
      en: '[Onthewall] Payment Information Expired',
      ko: '[온더월] 결제 정보 만료 알림',
    },
    message: {
      en: 'Your payment information has expired. Please update your payment details.',
      ko: '결제 정보가 만료되었습니다. 결제 정보를 업데이트해주세요.',
    },
    content: {
      en: 'Your payment information has expired. Please update your payment details.',
      ko: '결제 정보가 만료되었습니다. 결제 정보를 업데이트해주세요.',
    },
    // condition: "결제 정보가 만료되었을 때",
    link: `${HOME_DOMAIN}/account/payment`,
  },
  N1006: {
    type: 'credit',
    path: 'all',
    title: {
      en: '[Onthewall] Subscription Expiry Notification',
      ko: '[온더월] 구독 만료 예정 알림',
    },
    message: {
      en: 'Your subscription will expire in {{value}} days. If your subscription expires, the main page and all exhibitions will be deactivated.',
      ko: '{{value}}일 후 구독이 만료됩니다. 구독이 만료된 경우 메인 페이지와 모든 전시회는 비활성화됩니다.',
    },
    content: {
      en: 'Your subscription will expire in {{value}} days. If your subscription expires, the main page and all exhibitions will be deactivated.',
      ko: '{{value}}일 후 구독이 만료됩니다. 구독이 만료된 경우 메인 페이지와 모든 전시회는 비활성화됩니다.',
    },
    // condition: "스스로 구독 취소해서 구독 만료 예정일 때",
    // data type: { value: number }
    link: `/account/my-page?tab=subscribe`,
  },
  N2001: {
    type: 'info',
    path: 'web',
    title: {
      en: '[Onthewall] Exhibition Liked',
      ko: '[온더월] 전시회 좋아요 알림',
    },
    message: {
      en: '{{value}} people have liked the exhibition {{exhibitionTitle}}. 🎉',
      ko: '{{exhibitionTitle}}에 {{value}}명이 좋아요를 눌렀어요🎉',
    },
    content: {
      en: '{{value}} people have liked the exhibition {{exhibitionTitle}}. 🎉',
      ko: '{{exhibitionTitle}}에 {{value}}명이 좋아요를 눌렀어요🎉',
    },
    // condition: "[30, 50, 100... 100단위]명의 좋아요를 눌렀을 때",
    // data type: { exhibitionTitle: string, value: number, exhibitionId: string }
    link: `${SHOWROOM_DOMAIN}/{{exhibitionId}}`,
  },
  N2002: {
    type: 'info',
    path: 'all',
    title: {
      en: '[Onthewall] Exhibition Entry Notification',
      ko: '[온더월] 전시회 방문 알림',
    },
    message: {
      en: '{{value}} people have entered the exhibition {{exhibitionTitle}}. 🎉',
      ko: '{{exhibitionTitle}}에 {{value}}명이 전시회를 방문했어요🎉',
    },
    content: {
      en: '{{value}} people have entered the exhibition {{exhibitionTitle}}. 🎉',
      ko: '{{exhibitionTitle}}에 {{value}}명이 전시회를 방문했어요🎉',
    },
    // condition: "[30, 50, 100... 100단위]명이 전시회를 방문했을 때",
    // data type: { exhibitionTitle: string, value: number, exhibitionId: string }
    link: `${SHOWROOM_DOMAIN}/{{exhibitionId}}`,
  },
  N2003: {
    type: 'info',
    path: 'all',
    title: {
      en: '[Onthewall] Exhibition Comment Notification',
      ko: '[온더월] 전시회 댓글 알림',
    },
    message: {
      en: '{{value}} people have commented on the exhibition {{exhibitionTitle}}. 🎉',
      ko: '{{exhibitionTitle}}에 {{value}}명이 댓글을 남겼어요🎉',
    },
    content: {
      en: '{{value}} people have commented on the exhibition {{exhibitionTitle}}. 🎉',
      ko: '{{exhibitionTitle}}에 {{value}}명이 댓글을 남겼어요🎉',
    },
    // condition: "[30, 50, 100... 100단위]명이 댓글을 남겼을 때",
    // data type: { exhibitionTitle: string, value: number, exhibitionId: string; }
    link: `${SHOWROOM_DOMAIN}/{{exhibitionId}}`,
  },
  N2004: {
    type: 'info',
    path: 'all',
    title: {
      en: '[Onthewall] Exhibition Published',
      ko: '[온더월] 전시회 출판 알림',
    },
    message: {
      en: 'The exhibition {{exhibitionTitle}} has been published. Enjoy the exhibition.',
      ko: '{{exhibitionTitle}}이 출판되었습니다. 전시회를 관람하세요.',
    },
    content: {
      en: 'The exhibition {{exhibitionTitle}} has been published. Enjoy the exhibition.',
      ko: '{{exhibitionTitle}}이 출판되었습니다. 전시회를 관람하세요.',
    },
    // condition: "전시가 출판되었을 경우",
    // data type: { exhibitionTitle: string, exhibitionId: string }
    link: `${SHOWROOM_DOMAIN}/{{exhibitionId}}`,
  },
  N2005: {
    type: 'info',
    path: 'all',
    title: {
      en: '[Onthewall] Exhibition Publication Request',
      ko: '[온더월] 전시회 출판 요청 알림',
    },
    message: {
      en: '{{exhibitionTitle}} has requested to publish the exhibition. Please review and approve the exhibition.',
      ko: '{{exhibitionTitle}}이 출판 요청되었습니다. 검토 후 승인해주세요.',
    },
    content: {
      en: '{{exhibitionTitle}} has requested to publish the exhibition. Please review and approve the exhibition.',
      ko: '{{exhibitionTitle}}이 출판 요청되었습니다. 검토 후 승인해주세요.',
    },
    // condition: "전시가 출판 요청되었을 때",
    // data type: { exhibitionTitle: string, exhibitionId: string }
    link: `${SHOWROOM_DOMAIN}/{{exhibitionId}}`,
  },
  N3001: {
    type: 'info',
    path: 'all',
    title: {
      en: '[Onthewall] Custom Notification',
      ko: '[온더월] 맞춤 알림',
    },
    message: {
      en: '{{message_en}}',
      ko: '{{message_ko}}',
    },
    content: {
      en: '{{content_en}}',
      ko: '{{content_ko}}',
    },
    // condition: "관리자가 직접 작성",
    // data type: { content_en: string, content_ko: string, message_ko: string, message_en: string }
    link: '',
  },
};
