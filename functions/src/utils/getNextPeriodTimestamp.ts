import * as admin from 'firebase-admin';

/**
 * 주어진 결제 주기(payPeriod)에 따라 Firebase 서버 시간을 기준으로 다음 결제 날짜를 계산
 * @param payPeriod 결제 주기 (1 = 한 달, 12 = 1년, 그 외 = 분 단위로 처리)
 * @param now Firebase 서버 시간
 * @returns 계산된 미래의 Timestamp
 */
const getNextPeriodTimestamp = (
  payPeriod: number,
  now: admin.firestore.Timestamp = admin.firestore.Timestamp.now()
): admin.firestore.Timestamp => {
  const currentDate = now.toDate(); // Firebase 서버 시간 기준
  const futureDate = new Date(currentDate); // 기존 시간 정보를 유지

  if (payPeriod === 1) {
    // 1개월 후로 설정
    futureDate.setMonth(futureDate.getMonth() + 1);
  } else if (payPeriod === 12) {
    // 1년 후로 설정
    futureDate.setFullYear(futureDate.getFullYear() + 1);
  } else {
    // 기타: 분 단위로 처리
    futureDate.setMinutes(futureDate.getMinutes() + payPeriod);
  }

  // 기존의 시간, 분, 초를 유지
  futureDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds());

  // 계산된 미래 시간 반환
  return admin.firestore.Timestamp.fromDate(futureDate);
};

export default getNextPeriodTimestamp;
