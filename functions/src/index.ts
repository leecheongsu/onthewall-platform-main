import * as admin from 'firebase-admin';

admin.initializeApp();

const express = require('express');
import * as functions from 'firebase-functions';

const cors = require('cors');

import CommonRouter from './common/index';

import PlatformAccountRouter from './platform/account';
import PlatformManageRouter from './platform/manage';

import PlatformCombineRouter from './platform/combine';
import PlatformCombineProjectRouter from './platform/combine_project';

import ProjectAccountRouter from './project/account';
import ProjectManageRouter from './project/manage';

// Payment
// import PaymentRouter from './payment/index';

import { errorHandler, validateFormHandler } from './common/handler';
import { NOTIFICATION_CODE, NotificationData } from './assets/notificationCode';
import * as path from 'path';
import { readModifyHTMLforNoti, sendMail } from './utils/mail';
import axios from 'axios';
import sendNotification from './utils/sendNodification';
import getNextPeriodTimestamp from './utils/getNextPeriodTimestamp';

const app = express();
// CORS 설정
// app.use(cors({ origin: true }));
app.use(cors());

app.use(validateFormHandler);

app.use('/common', CommonRouter);

/**
 * Note. OTWC 플랫폼
 */
app.use('/platform/account', PlatformAccountRouter);
app.use('/platform/manage', PlatformManageRouter);

app.use('/platform/combine', PlatformCombineRouter);
app.use('/platform/combine_project', PlatformCombineProjectRouter);

/**
 * Note. project, channel
 */
app.use('/project/account', ProjectAccountRouter);
app.use('/project/manage', ProjectManageRouter);

// Payment
// app.use('/payment', PaymentRouter);

app.use(errorHandler);

exports.userInviteExpirationCheck = functions
  .region('asia-northeast3')
  .pubsub.schedule('every 5 minutes')
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const projectRef = db.collection('Project');

      const projectSnapshot = await projectRef.get();

      const projectPromises = projectSnapshot.docs.map(async (doc) => {
        const projectId = doc.id;
        const userRef = projectRef.doc(projectId).collection('User');
        const now = admin.firestore.Timestamp.now();

        /**
         * TODO. 필요에 따라 상태 체크해서 삭제 할 것.
         */
        const snapshot = await userRef
          // .where('status', '==', 'pending')
          .where('expirationAt', '<', now)
          .get();

        const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(deletePromises);
      });

      await Promise.all(projectPromises);
      return null;
    } catch (e) {
      console.error('User Expiration Check:', e);
      return null;
    }
  });

exports.expiredSubscribe = functions
  .region('asia-northeast3')
  // .pubsub.schedule('every day 23:55') // 매일 23:55에 실행
  .pubsub.schedule('every 1 minutes') // 매 분마다 실행
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const today = new Date();
      // const expirationDays = [10, 7, 3, 1]; // 10일, 7일, 3일, 1일 전에 알림
      const expirationMinutes = [10, 5, 3, 1, -1]; // 10, 5, 3, 1분 전에 알림

      const projectsSnapshot = await db.collection('Project').get();

      projectsSnapshot.forEach(async (doc) => {
        const projectData = doc.data();
        const uid = projectData.ownerId;

        const paymentExpirationSeconds = projectData.expiredAt._seconds;
        const expirationDate = new Date(paymentExpirationSeconds * 1000);
        const differenceMilliseconds = expirationDate.getTime() - today.getTime();
        // const daysUntilExpiration = Math.ceil((differenceMilliseconds / 1000) * 60 * 60 * 24); // 일 단위 계산
        const minutesUntilExpiration = Math.ceil(differenceMilliseconds / (1000 * 60)); // 분 단위 계산

        // if (expirationDays.includes(daysUntilExpiration)) {
        if (expirationMinutes.includes(minutesUntilExpiration)) {
          console.log(`${minutesUntilExpiration} minutes until expiration.`);
          if (minutesUntilExpiration === 5) {
            // 구독 만료 예정 알림
            await sendNotification('N1006', uid, { value: minutesUntilExpiration });
          } else if (minutesUntilExpiration === -1) {
            // 구독 종료 알림
            await sendNotification('N1002', uid, {});
          }
        }
      });

      console.log('Expired Subscirbed notifications sent successfully.');
      return null;
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw new Error('Failed to send expired subscribe notifications.');
    }
  });

// 템플릿 문자열에서 {{key}} 형태의 변수를 치환하는 함수
const replaceTemplateStrings = (template: string, variables: any) => {
  return template.replace(/{{\s*([^{}\s]+)\s*}}/g, (match: string, key: string) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
};

exports.sendEmailByUserNotification = functions
  .region('asia-northeast3')
  .firestore.document('Notification/{notificationId}')
  .onCreate(async (snapshot, context) => {
    try {
      const notificationData: NotificationData = snapshot.data() as NotificationData;

      // 아이디 업데이트
      snapshot.ref.update({
        id: snapshot.id,
      });

      // 이메일을 전송 함수
      const sendEmail = async (notificationData: NotificationData) => {
        const countryCode = notificationData.countryCode.split('-')[0] as 'en' | 'ko';

        const message: string = NOTIFICATION_CODE[notificationData.code].message?.[countryCode] ?? '';
        const title = notificationData.title || NOTIFICATION_CODE[notificationData.code].title;

        const content = `
        <div id="content">
           ${replaceTemplateStrings(message, { value: notificationData.data?.value })}
        </div>
    `;
        if (!title) {
          throw new Error('Title is required');
        }
        if (!message) {
          throw new Error('Content is required');
        }

        const notiTemplate = path.resolve(__dirname, '../src/template/noti.html');

        const htmlForEmail = await readModifyHTMLforNoti(notiTemplate, title[countryCode], content);

        await sendMail(notificationData.email, title[countryCode], htmlForEmail, []);
      };
      // 카카오 전송 함수
      const sendKakao = async (notificationData: NotificationData) => {
        // TODO: 카카오 전송
      };

      // 이메일을 전송 로직
      if (notificationData.path === 'all' || notificationData.path === 'social') {
        if (notificationData.important === true) {
          // 0. 필수 설정이 되어있는 경우
          await sendEmail(notificationData);
        } else if (
          notificationData.type === 'marketing' ||
          NOTIFICATION_CODE[notificationData.code].type === 'marketing'
        ) {
          // 1.5 marketing 이면서 marketing 동의가 안된 경우
          // do nothing
        } else if (notificationData.alarmStatus.email === false) {
          // 1. 이메일 전송거절 설정이 되어있는 경우
          // do noting
        } else if (notificationData.email === '') {
          // 2. 이메일이 없는 경우
          // do nothing
        } else {
          // 3. 이메일 동의하고, 이메일 정보가 있는 경우
          await sendEmail(notificationData);
        }
      }
      // 카카오 전송 로직
      if (notificationData.path === 'all' || notificationData.path === 'social') {
        if (notificationData.important === true) {
          // 0. 필수 설정이 되어있는 경우
          await sendKakao(notificationData);
        } else if (notificationData.alarmStatus.kakao === false) {
          // 1. 카카오 전송거절 설정이 되어있는 경우
          // do noting
        } else if (
          notificationData.type === 'marketing' ||
          NOTIFICATION_CODE[notificationData.code].type === 'marketing'
        ) {
          // 1.5 marketing 이면서 marketing 동의가 안된 경우
          // do nothing
        } else if (notificationData.phone === '') {
          // 2. 카카오 정보가 없는 경우
          // do nothing
        } else {
          // 3. 카카오 동의하고, 카카오 정보가 있는 경우
          await sendKakao(notificationData);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email.');
    }
  });

exports.sendEmailByProjectUserNotification = functions
  .region('asia-northeast3')
  .firestore.document('Project/{projectId}/User/{userId}/Notification/{notificationId}')
  .onCreate(async (snapshot, context) => {
    try {
      const notificationData = snapshot.data();

      if (notificationData.path === 'email') {
        const message = NOTIFICATION_CODE[notificationData.code].message;

        const content = `
                <div id="content">
                   ${message}
                </div>
            `;

        const notiTemplate = path.resolve(__dirname, '../template/noti.html');

        const htmlForEmail = await readModifyHTMLforNoti(notiTemplate, notificationData.title, content);
        await sendMail(notificationData.email, notificationData.title, htmlForEmail, []);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email.');
    }
  });

// exports.expiredPaymentInfo = functions
//     .region('asia-northeast3')
//     .pubsub.schedule('every day 23:55')
//     .timeZone('Asia/Seoul')
//     .onRun(async context => {
//         try {
//             /**
//              * TODO. Payment관련 User 체크
//              */
//
//             const db = admin.firestore();
//
//
//             const batch = db.batch();
//
//             snapshot.forEach(doc => {
//                 const userId = doc.id;
//                 const userData = doc.data();
//                 const notification = {
//                     userId: userId,
//                     content: 'Your payment information has expired. Please update your payment details.',
//                     type: 'credit',
//                     createdAt: admin.firestore.FieldValue.serverTimestamp()
//                 };
//
//                 const notiRef = db
//                     .collection('User').doc(userId)
//                     .collection('Notification');
//
//                 batch.set(notiRef, notification);
//             });
//
//             await batch.commit();
//             console.log('Expired payment notifications sent successfully.');
//             return null;
//         } catch (error) {
//             console.error('Error sending notifications:', error);
//         }
//     });

// 클라우드 결제요청
exports.pay = functions.https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    try {
      const { imp_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
      /*
       * 액세스 토큰(access token) 발급 받기
       */
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증 토큰

      /*
       * imp_uid로 아임포트 서버에서 결제 정보 조회
       */
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
        method: 'get', // GET method
        headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
      });

      const paymentData = getPaymentData.data.response; // 조회한 결제 정보
      const { amount, status, custom_data } = paymentData;
      // JSON string convert
      const customData = JSON.parse(custom_data);

      /*
       * DB에서 결제되어야 하는 금액 조회
       */
      const db = admin.firestore();
      let docRef = db.collection('Order').doc(paymentData.merchant_uid);
      const doc = await docRef.get();

      if (doc.exists) {
        await db
          .collection('Order')
          .doc(paymentData.merchant_uid)
          .update({
            ...paymentData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            // 빌링키 요청
            status: customData.isBillingKey ? 'requested' : status,
          }); // DB에 결제 정보 저장
        let amountToBePaid = doc.data()?.price; // 결제 되어야 하는 금액

        /*
         * 결제 검증하기
         */
        if (amount === amountToBePaid) {
          // 결제금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
          switch (status) {
            case 'ready': // 가상계좌 발급
              // DB에 가상계좌 발급 정보 저장
              const { vbank_num, vbank_date, vbank_name } = paymentData;
              await db.collection('Order').doc(paymentData.merchant_uid).update({
                vbank_num,
                vbank_date,
                vbank_name,
              });
              // 가상계좌 발급 안내 문자메시지 발송
              // SMS.send({
              // 	text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`,
              // });
              return res.send({
                status: 'vbankIssued',
                message: '가상계좌 발급 성공',
              });
            case 'paid': // 결제 완료
              // 정기 결제일 경우 새로운 결제 예약
              if (
                paymentData.pg_id === 'INIBillTst' || // KG 이니시스 테스트
                paymentData.pg_id === 'MOIforbill' || // KG 이니시스 실서버
                paymentData.pg_id === 'UFYSG9T7RFW2A' || // Paypal 테스트
                paymentData.pg_id === 'CNFENTVKZ462A' // Paypal 실서버
              ) {
                // 빌링키 발급 요청시
                if (customData.isBillingKey === true) {
                  const updatedDoc = await docRef.get(); // 업데이트된 orderData를 재조회
                  const updatedOrderData = updatedDoc.data(); // 최신 데이터 가져오기

                  const resBillingKey = await axios.post(
                    'https://us-central1-gd-virtual-staging.cloudfunctions.net/payByBillingKey',
                    {
                      order: {
                        ...updatedOrderData,
                        custom_data: JSON.stringify({
                          ...customData,
                          isBillingKey: false,
                        }),
                      },
                    }
                  );
                  return res.send({
                    status: 'success',
                    message: '정기결제 예약 성공',
                    data: {
                      ...doc.data(),
                      newOrderId: resBillingKey.data.data.newOrderId,
                    },
                  });
                } else {
                  // 빌링키 발급이 아닌 결제시 정기결제 예약
                  const newDocRef = await db.collection('Order').add({
                    ...paymentData,
                    createdAt: admin.firestore.Timestamp.now(),
                    updatedAt: admin.firestore.Timestamp.now(),
                    startAt: doc.data()?.endAt,
                    endAt: getNextPeriodTimestamp(customData.payPeriod, doc.data()?.endAt).toDate(),
                    price: customData.amount,
                    buyer_id: customData.buyer_id,
                    plan: customData.plan,
                    payPeriod: customData.payPeriod,
                    promotionCode: customData.promotionCode,
                    isUpgrade: customData.isUpgrade,
                    isFreeTrial: false,
                    amount: customData.amount,
                    projectId: doc.data()?.projectId ? doc.data()?.projectId : '',
                    status: 'reserved',
                  });

                  const newDoc = await newDocRef.get();
                  const orderData = newDoc.data();

                  await newDocRef.update({
                    merchant_uid: newDocRef.id,
                  });

                  const schedule_at = Math.floor(orderData?.startAt.toDate().getTime() / 1000);

                  console.log('정기결제 Order add 성공', {
                    // 주문 번호
                    merchant_uid: newDocRef.id,
                    // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
                    schedule_at,
                    amount: customData.amount,
                    name: paymentData.name,
                    // ...
                  });

                  await axios({
                    url: 'https://api.iamport.kr/subscribe/payments/schedule',
                    method: 'post',
                    // 인증 토큰 Authorization header에 추가
                    headers: { Authorization: access_token },
                    data: {
                      customer_uid: paymentData.customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
                      schedules: [
                        {
                          // 주문 번호
                          merchant_uid: newDocRef.id,
                          // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
                          schedule_at,
                          amount: customData.amount,
                          name: paymentData.name,
                          buyer_name: paymentData.buyer_name,
                          buyer_email: paymentData.buyer_email,
                          buyer_tel: paymentData.buyer_tel,
                          buyer_addr: paymentData.buyer_addr,
                          buyer_postcode: paymentData.buyer_postcode,
                          custom_data: {
                            ...customData,
                            isFreeTrial: false,
                          },
                          currency: paymentData.pay_method === 'paypal' ? 'USD' : 'KRW',
                        },
                      ],
                    },
                  })
                    .then((res) => {
                      if (res.data.code !== 0) {
                        throw { status: 'scheduleFail', message: res.data.message };
                      } else {
                        console.log('정기결제 예약 성공!', res.data);
                      }
                    })
                    .catch(async (err) => {
                      console.log('정기결제 예약 실패', err);
                      /*
                       * 결제취소 (전액 자동환불)
                       */
                      try {
                        const result = await axios.post(
                          'https://us-central1-gd-virtual-staging.cloudfunctions.net/payAutoCancel',
                          {
                            merchant_uid: paymentData.merchant_uid,
                            cancel_request_amount: amount, // 환불금액
                            reason: '결제취소(자동환불)', // 환불사유
                          }
                        );
                        console.log('결제가 취소되었습니다.', result);
                        // await newDocRef.delete();
                        await newDocRef.update({
                          status: 'failed',
                        });
                      } catch (error) {
                        console.log('환불에 실패하였습니다!\n고객센터로 문의해 주세요.', error);
                      }
                      throw { status: 'scheduleFail', message: err.message };
                    });
                  return res.send({
                    status: 'success',
                    message: '정기결제 예약 성공',
                    data: {
                      ...doc.data(),
                      newOrderId: newDocRef.id,
                    },
                  });
                }
              } else {
                return res.send({
                  status: 'success',
                  message: '일반 결제 성공',
                });
              }
          }
          return res.send({
            status: 'success',
            message: '결제 성공',
            data: { ...doc.data() },
          });
        } else {
          // 결제금액 불일치. 위/변조 된 결제
          throw { status: 'forgery', message: '위조된 결제시도' };
        }
      } else {
        // Order doc 없음
        throw { status: 'nosuchDoc', message: 'Order doc 없음' };
      }
    } catch (e) {
      console.log('33333333333', e);
      return res.status(400).json(e);
    }
  });
});

// 결제 자동 취소(오류 발생 시)
exports.payAutoCancel = functions.https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    try {
      /*
       * 액세스 토큰(access token) 발급 받기
       */
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증 토큰

      /*
       * DB 결제정보 조회
       */
      const { merchant_uid, reason } = req.body;
      let paymentData: any;
      const db = admin.firestore();
      let docRef = db.collection('Order').doc(merchant_uid);
      await docRef
        .get()
        .then((doc) => {
          paymentData = doc.data();
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json(err);
        });

      const { imp_uid, amount, cancel_amount } = paymentData; // 조회한 결제정보로부터 imp_uid, amount(결제금액), cancel_amount(환불된 총 금액) 추출
      const cancelableAmount = amount - cancel_amount; // 환불 가능 금액(= 결제금액 - 환불 된 총 금액) 계산
      if (cancelableAmount <= 0) {
        // 이미 전액 환불된 경우
        return res.status(400).json({ message: '이미 전액환불된 주문입니다.' });
      }

      /*
       * 아임포트 REST API로 결제환불 요청
       */
      const getCancelData = await axios({
        url: 'https://api.iamport.kr/payments/cancel',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          reason, // 가맹점 클라이언트로부터 받은 환불사유
          imp_uid, // imp_uid를 환불 `unique key`로 입력
          // amount: cancel_request_amount, // 가맹점 클라이언트로부터 받은 환불금액 (미입력시 전액 환불)
          checksum: cancelableAmount, // [권장] 환불 가능 금액 입력
        },
      });
      const { response } = getCancelData.data; // 환불 결과

      /*
       * 환불 결과 동기화
       */
      const { merchant_uid: refund_merchant_uid } = response; // 환불 결과에서 주문정보 추출
      db.collection('Order')
        .doc(refund_merchant_uid)
        .update({
          ...response,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }) // DB에 환불 정보 업데이트
        .then(() => {
          return res.json({ message: '환불 완료!' });
        })
        .catch((err) => {
          console.log(err);
          return res.status(400).json({ message: '이미 전액환불된 주문입니다.' });
        });
      return null;
    } catch (e) {
      console.log('payCancel 오류 : ', e);
      return res.status(400).json(e);
    }
  });
});

// 결제 예약 취소
exports.payScheduleCancel = functions.https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    const db = admin.firestore();
    try {
      const { customer_uid, merchant_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
      /*
       * 액세스 토큰(access token) 발급 받기
       */
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증 토큰

      // 결제 예약 취소 처리
      const cancelSchedule = await axios({
        url: 'https://api.iamport.kr/subscribe/payments/unschedule',
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          customer_uid: customer_uid,
          merchant_uid: merchant_uid,
        },
      });
      if (cancelSchedule.data.code !== 0) {
        throw { status: 'cancelFail', message: cancelSchedule.data.message };
      }
      const { response } = cancelSchedule.data;
      /*
       * 취소 결과 동기화
       */
      if (response.length > 0) {
        console.log('response[0]', response[0]);
        const { merchant_uid: cancel_merchant_uid } = response[0]; // 취소 결과에서 주문정보 추출
        db.collection('Order')
          .doc(cancel_merchant_uid)
          .update({
            ...response[0],
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'cancelled',
          }) // DB에 취소 정보 업데이트
          .then(() => {
            return res.json({ status: 'success', message: '취소 완료!' });
          })
          .catch((err) => {
            console.log(err);
            return res.status(400).json({ message: '이미 취소된 주문입니다.' });
          });
      }
      return null;
    } catch (e) {
      console.log('payScheduleCancel 오류 : ', e);
      return res.status(400).json(e);
    }
  });
});

// 결제 재예약
exports.payScheduleResume = functions.https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    const db = admin.firestore();
    try {
      const { order } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
      console.log('@@@order', order);
      /*
       * 액세스 토큰(access token) 발급 받기
       */
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증 토큰

      // JSON string convert
      const customData = JSON.parse(order.custom_data);
      // 정기결제 예약
      const startAt = new admin.firestore.Timestamp(order.endAt.seconds, order.endAt.nanoseconds);
      const newDocRef = await db.collection('Order').add({
        ...order,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        startAt,
        endAt: getNextPeriodTimestamp(customData.payPeriod, startAt).toDate(),
      });
      const newDoc = await newDocRef.get();
      const orderData = newDoc.data();
      await newDocRef.update({
        merchant_uid: newDocRef.id,
      });
      const schedule_at = Math.floor(orderData?.startAt.toDate().getTime() / 1000);

      console.log('정기결제 Order add 성공', {
        // 주문 번호
        merchant_uid: newDocRef.id,
        // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
        schedule_at,
        amount: orderData?.amount,
        name: orderData?.name,
      });

      await axios({
        url: 'https://api.iamport.kr/subscribe/payments/schedule',
        method: 'post',
        // 인증 토큰 Authorization header에 추가
        headers: { Authorization: access_token },
        data: {
          customer_uid: order.customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
          schedules: [
            {
              // 주문 번호
              merchant_uid: newDocRef.id,
              // 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
              schedule_at,
              amount: order.amount,
              name: order.name,
              buyer_name: order.buyer_name,
              buyer_email: order.buyer_email,
              buyer_tel: order.buyer_tel,
              buyer_addr: order.buyer_addr,
              buyer_postcode: order.buyer_postcode,
              custom_data: {
                ...customData,
                isFreeTrial: false,
              },
              currency: order.pay_method === 'paypal' ? 'USD' : 'KRW',
            },
          ],
        },
      })
        .then(async (res) => {
          if (res.data.code !== 0) {
            throw { status: 'scheduleFail', message: res.data.message };
          } else {
            console.log('정기결제 예약 성공!', res.data);
            await newDocRef.update({
              status: 'reserved',
            });
          }
        })
        .catch(async (err) => {
          console.log('정기결제 예약 실패', err);
          /*
           * 결제취소 (전액 자동환불)
           */
          try {
            const result = await axios.post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payAutoCancel', {
              merchant_uid: order.merchant_uid,
              cancel_request_amount: order.amount, // 환불금액
              reason: '결제취소(자동환불)', // 환불사유
            });
            console.log('결제가 취소되었습니다.', result);
            // await newDocRef.delete();
            await newDocRef.update({
              status: 'failed',
            });
          } catch (error) {
            console.log('환불에 실패하였습니다!\n고객센터로 문의해 주세요.', error);
          }
          throw { status: 'scheduleFail', message: err.message };
        });
      return res.send({
        status: 'success',
        message: '정기결제 예약 성공',
        data: {
          ...order,
          newOrderId: newDocRef.id,
        },
      });
    } catch (e) {
      console.log('payScheduleResume 오류 : ', e);
      return res.status(400).json(e);
    }
  });
});

// 아임포트 비 인증 결제(빌링키 결제)
exports.payByBillingKey = functions.https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    const db = admin.firestore();
    try {
      const { order } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
      console.log('@@@order', order);
      /*
       * 액세스 토큰(access token) 발급 받기
       */
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증 토큰

      const startAt = order.startAt.seconds
        ? order.startAt
        : { seconds: order.startAt._seconds, nanoseconds: order.startAt._nanoseconds };
      const endAt = order.endAt.seconds
        ? order.endAt
        : { seconds: order.endAt._seconds, nanoseconds: order.endAt._nanoseconds };
      console.log('@@@startAt, endAt', startAt, endAt);

      // JSON string convert
      const customData = JSON.parse(order.custom_data);
      // 정기결제 예약
      const newDocRef = await db.collection('Order').add({
        ...order,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        startAt:
          order.isDirect || !order.isUpgrade
            ? admin.firestore.Timestamp.now()
            : new admin.firestore.Timestamp(startAt.seconds, startAt.nanoseconds),
        endAt:
          order.isDirect || !order.isUpgrade
            ? getNextPeriodTimestamp(customData.payPeriod, admin.firestore.Timestamp.now()).toDate()
            : new admin.firestore.Timestamp(endAt.seconds, endAt.nanoseconds),
      });
      await newDocRef.update({
        merchant_uid: newDocRef.id,
      });
      const newDoc = await newDocRef.get();
      const orderData = newDoc.data();

      console.log('정기결제 Order add 성공', {
        // 주문 번호
        merchant_uid: newDocRef.id,
        amount: orderData?.amount,
        name: orderData?.name,
      });

      await axios({
        url: 'https://api.iamport.kr/subscribe/payments/again',
        method: 'post',
        // 인증 토큰 Authorization header에 추가
        headers: { Authorization: access_token },
        data: {
          customer_uid: order.customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
          merchant_uid: newDocRef.id,
          amount: order.amount,
          name: order.name,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          buyer_tel: order.buyer_tel,
          buyer_addr: order.buyer_addr,
          buyer_postcode: order.buyer_postcode,
          custom_data: {
            ...customData,
            isFreeTrial: false,
          },
          currency: order.pay_method === 'paypal' ? 'USD' : 'KRW',
        },
      })
        .then((res) => {
          if (res.data.code !== 0) {
            throw { status: 'restartFail', message: res.data.message };
          } else if (res.data.response.status === 'failed') {
            throw { status: 'restartFail', message: res.data.response.fail_reason };
          } else {
            console.log('정기결제 빌링키 결제 성공!', res.data);
          }
        })
        .catch(async (err) => {
          console.log('정기결제 빌링키 결제 실패', err);
          /*
           * 결제취소 (전액 자동환불)
           */
          try {
            const result = await axios.post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payAutoCancel', {
              merchant_uid: order.merchant_uid,
              cancel_request_amount: order.amount, // 환불금액
              reason: '결제취소(자동환불)', // 환불사유
            });
            console.log('결제가 취소되었습니다.', result);
            // await newDocRef.delete();
            await newDocRef.update({
              status: 'failed',
            });
          } catch (error) {
            console.log('환불에 실패하였습니다!\n고객센터로 문의해 주세요.', error);
          }
          throw { status: 'restartFail', message: err.message };
        });
      return res.send({
        status: 'success',
        message: '정기결제 빌링키 결제 성공',
        data: {
          ...orderData,
          newOrderId: newDocRef.id,
        },
      });
    } catch (e) {
      console.log('payByBillingKey 오류 : ', e);
      return res.status(400).json(e);
    }
  });
});

// 페이팔 정기결제
exports.paypalRt = functions.region('asia-northeast3').https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    const db = admin.firestore();
    try {
      const { order } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
      /*
       * 액세스 토큰(access token) 발급 받기
       */
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post', // POST method
        headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });
      const { access_token } = getToken.data.response; // 인증 토큰

      // JSON string convert
      const customData = JSON.parse(order.custom_data);
      console.log('페이팔 정기결제 Order add 성공', {
        // 주문 번호
        merchant_uid: order.id,
        amount: order.amount,
        name: order.name,
      });
      // DB 연결
      const docRef = db.collection('Order').doc(order.id);
      await docRef.update({
        updatedAt: admin.firestore.Timestamp.now(),
        startAt:
          order.isDirect || !order.isUpgrade
            ? admin.firestore.Timestamp.now()
            : new admin.firestore.Timestamp(order.startAt.seconds, order.startAt.nanoseconds),
        endAt:
          order.isDirect || !order.isUpgrade
            ? getNextPeriodTimestamp(customData.payPeriod, admin.firestore.Timestamp.now()).toDate()
            : new admin.firestore.Timestamp(order.endAt.seconds, order.endAt.nanoseconds),
      });

      await axios({
        url: 'https://api.iamport.kr/subscribe/payments/again',
        method: 'post',
        // 인증 토큰 Authorization header에 추가
        headers: { Authorization: access_token },
        data: {
          customer_uid: order.customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
          merchant_uid: order.id,
          amount: order.amount,
          name: order.name,
          buyer_name: order.buyer_name,
          buyer_email: order.buyer_email,
          buyer_tel: order.buyer_tel,
          buyer_addr: order.buyer_addr,
          buyer_postcode: order.buyer_postcode,
          custom_data: {
            ...customData,
            isFreeTrial: false,
          },
          currency: order.pay_method === 'paypal' ? 'USD' : 'KRW',
        },
      })
        .then((res) => {
          if (res.data.code !== 0) {
            throw { status: 'restartFail', message: res.data.message };
          } else if (res.data.response.status === 'failed') {
            throw { status: 'restartFail', message: res.data.response.fail_reason };
          } else {
            console.log('정기결제 빌링키 결제 성공!', res.data);
          }
        })
        .catch(async (err) => {
          console.log('정기결제 빌링키 결제 실패', err);
          /*
           * 결제취소 (전액 자동환불)
           */
          try {
            const result = await axios.post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payAutoCancel', {
              merchant_uid: order.merchant_uid,
              cancel_request_amount: customData.amount, // 환불금액
              reason: '결제취소(자동환불)', // 환불사유
            });
            console.log('결제가 취소되었습니다.', result);
            // await newDocRef.delete();
            await docRef.update({
              status: 'failed',
            });
          } catch (error) {
            console.log('환불에 실패하였습니다!\n고객센터로 문의해 주세요.', error);
          }
          throw { status: 'restartFail', message: err.message };
        });
      return res.send({
        status: 'success',
        message: '페이팔 정기결제 빌링키 결제 성공',
        data: {
          ...order,
          newOrderId: order.id,
        },
      });
    } catch (e) {
      console.log('paypalRt 오류 : ', e);
      return res.status(400).json(e);
    }
  });
});

// 아임포트 토큰 발급
exports.getIamportToken = functions.region('asia-northeast3').https.onRequest((req, res) => {
  cors({ origin: true })(req, res, async () => {
    try {
      const response = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          imp_key: '4686930638841492', // REST API 키
          imp_secret: 'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
        },
      });

      const { access_token } = response.data.response;
      return res.send({ access_token });
    } catch (error) {
      console.error('Error getting Iamport token:', error);
      return res.status(500).json(error);
    }
  });
});

// 10000ms timeout
// 4gb memory
exports.rest = functions.runWith({ timeoutSeconds: 100, memory: '2GB' }).https.onRequest(app);
