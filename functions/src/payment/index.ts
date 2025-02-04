// import { Router } from 'express';
// import * as admin from 'firebase-admin';
// import axios from 'axios';
//
// const router = Router();
//
// // 클라우드 결제요청
// router.post('/pay', async (req, res, next) => {
// 	try {
// 		const { imp_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
// 		/*
// 		 * 액세스 토큰(access token) 발급 받기
// 		 */
// 		const getToken = await axios({
// 			url: 'https://api.iamport.kr/users/getToken',
// 			method: 'post', // POST method
// 			headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
// 			data: {
// 				imp_key: '4686930638841492', // REST API 키
// 				imp_secret:
// 					'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
// 			},
// 		});
// 		const { access_token } = getToken.data.response; // 인증 토큰
//
// 		/*
// 		 * imp_uid로 아임포트 서버에서 결제 정보 조회
// 		 */
// 		const getPaymentData = await axios({
// 			url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
// 			method: 'get', // GET method
// 			headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
// 		});
//
// 		const paymentData = getPaymentData.data.response; // 조회한 결제 정보
//
// 		/*
// 		 * DB에서 결제되어야 하는 금액 조회
// 		 */
// 		const db = admin.firestore();
// 		let docRef = db.collection('Order').doc(paymentData.merchant_uid);
// 		const doc = await docRef.get();
//
// 		if (doc.exists) {
// 			await db
// 				.collection('Order')
// 				.doc(paymentData.merchant_uid)
// 				.update({
// 					...paymentData,
// 					updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 				}); // DB에 결제 정보 저장
//
// 			let amountToBePaid = doc.data()?.price; // 결제 되어야 하는 금액
// 			const { amount, status, custom_data } = paymentData;
// 			// JSON string convert
// 			const customData = JSON.parse(custom_data);
//
// 			/*
// 			 * 결제 검증하기
// 			 */
// 			if (amount === amountToBePaid) {
// 				// 결제금액 일치. 결제 된 금액 === 결제 되어야 하는 금액
// 				switch (status) {
// 					case 'ready': // 가상계좌 발급
// 						// DB에 가상계좌 발급 정보 저장
// 						const { vbank_num, vbank_date, vbank_name } = paymentData;
// 						await db.collection('Order').doc(paymentData.merchant_uid).update({
// 							vbank_num,
// 							vbank_date,
// 							vbank_name,
// 						});
// 						// 가상계좌 발급 안내 문자메시지 발송
// 						// SMS.send({
// 						// 	text: `가상계좌 발급이 성공되었습니다. 계좌 정보 ${vbank_num} ${vbank_date} ${vbank_name}`,
// 						// });
// 						return res.send({
// 							status: 'vbankIssued',
// 							message: '가상계좌 발급 성공',
// 						});
// 						break;
// 					case 'paid': // 결제 완료
// 						// 정기 결제일 경우 새로운 결제 예약
// 						if (paymentData.pg_id === 'INIBillTst' || paymentData.pg_id === 'MOIforbill') {
// 							// 정기결제 예약
// 							const newDocRef = await db.collection('Order').add({
// 								...paymentData,
// 								createdAt: admin.firestore.Timestamp.now(),
// 								updatedAt: admin.firestore.Timestamp.now(),
// 								startAt: doc.data()?.endAt,
// 								endAt: new Date(
// 									doc
// 										.data()
// 										?.endAt.toDate()
// 										.setMinutes(doc.data()?.endAt.toDate().getMinutes() + 1),
// 								),
// 								price: paymentData.amount,
// 								buyer_id: customData.buyer_id,
// 								plan: customData.plan,
// 								payPeriod: customData.payPeriod,
// 								promotionCode: customData.promotionCode,
// 								isUpgrade: customData.isUpgrade,
// 							});
//
// 							const newDoc = await newDocRef.get();
// 							const orderData = newDoc.data();
//
// 							await newDocRef.update({
// 								merchant_uid: newDocRef.id,
// 							});
//
// 							const schedule_at = Math.floor(orderData?.startAt.toDate().getTime() / 1000);
//
// 							console.log('정기결제 Order add 성공', {
// 								// 주문 번호
// 								merchant_uid: newDocRef.id,
// 								// 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
// 								schedule_at,
// 								amount: amountToBePaid,
// 								name: paymentData.name,
// 								// ...
// 							});
//
// 							await axios({
// 								url: 'https://api.iamport.kr/subscribe/payments/schedule',
// 								method: 'post',
// 								// 인증 토큰 Authorization header에 추가
// 								headers: { Authorization: access_token },
// 								data: {
// 									customer_uid: paymentData.customer_uid, // 카드(빌링키)와 1:1로 대응하는 값
// 									schedules: [
// 										{
// 											// 주문 번호
// 											merchant_uid: newDocRef.id,
// 											// 결제 시도 시각 in Unix Time Stamp. 예: 다음 달 1일
// 											schedule_at,
// 											amount: amountToBePaid,
// 											name: paymentData.name,
// 											buyer_name: paymentData.buyer_name,
// 											buyer_email: paymentData.buyer_email,
// 											buyer_tel: paymentData.buyer_tel,
// 											buyer_addr: paymentData.buyer_addr,
// 											buyer_postcode: paymentData.buyer_postcode,
// 											custom_data,
// 										},
// 									],
// 								},
// 							})
// 								.then(res => {
// 									console.log('정기결제 예약 성공', res.data);
// 								})
// 								.catch(err => {
// 									console.log('정기결제 예약 실패', err);
// 								});
// 							return res.send({
// 								status: 'success',
// 								message: '정기결제 예약 성공',
// 							});
// 						} else {
// 							return res.send({
// 								status: 'success',
// 								message: '일반 결제 성공',
// 							});
// 						}
// 						break;
// 				}
// 			} else {
// 				// 결제금액 불일치. 위/변조 된 결제
// 				throw { status: 'forgery', message: '위조된 결제시도' };
// 			}
// 		} else {
// 			// Order doc 없음
// 			throw { status: 'nosuchDoc', message: 'Order doc 없음' };
// 		}
// 	} catch (e) {
// 		console.log('33333333333', e);
// 		// return res.status(400).json(e);
// 		return next(e);
// 	}
// });
//
// // 결제 자동 취소(오류 발생 시)
// router.post('/pay/cancel', async (req, res, next) => {
// 	try {
// 		/*
// 		 * 액세스 토큰(access token) 발급 받기
// 		 */
// 		const getToken = await axios({
// 			url: 'https://api.iamport.kr/users/getToken',
// 			method: 'post', // POST method
// 			headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
// 			data: {
// 				imp_key: '4686930638841492', // REST API 키
// 				imp_secret:
// 					'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
// 			},
// 		});
// 		const { access_token } = getToken.data.response; // 인증 토큰
//
// 		/*
// 		 * DB 결제정보 조회
// 		 */
// 		const { merchant_uid, reason } = req.body;
// 		let paymentData: any;
// 		const db = admin.firestore();
// 		let docRef = db.collection('Order').doc(merchant_uid);
// 		await docRef
// 			.get()
// 			.then(doc => {
// 				paymentData = doc.data();
// 			})
// 			.catch(err => {
// 				console.log(err);
// 				return res.status(400).json(err);
// 			});
//
// 		const { imp_uid, amount, cancel_amount } = paymentData; // 조회한 결제정보로부터 imp_uid, amount(결제금액), cancel_amount(환불된 총 금액) 추출
// 		const cancelableAmount = amount - cancel_amount; // 환불 가능 금액(= 결제금액 - 환불 된 총 금액) 계산
// 		if (cancelableAmount <= 0) {
// 			// 이미 전액 환불된 경우
// 			return res.status(400).json({ message: '이미 전액환불된 주문입니다.' });
// 		}
//
// 		/*
// 		 * 아임포트 REST API로 결제환불 요청
// 		 */
// 		const getCancelData = await axios({
// 			url: 'https://api.iamport.kr/payments/cancel',
// 			method: 'post',
// 			headers: {
// 				'Content-Type': 'application/json',
// 				Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
// 			},
// 			data: {
// 				reason, // 가맹점 클라이언트로부터 받은 환불사유
// 				imp_uid, // imp_uid를 환불 `unique key`로 입력
// 				// amount: cancel_request_amount, // 가맹점 클라이언트로부터 받은 환불금액 (미입력시 전액 환불)
// 				checksum: cancelableAmount, // [권장] 환불 가능 금액 입력
// 			},
// 		});
// 		const { response } = getCancelData.data; // 환불 결과
//
// 		/*
// 		 * 환불 결과 동기화
// 		 */
// 		const { merchant_uid: refund_merchant_uid } = response; // 환불 결과에서 주문정보 추출
// 		db.collection('Order')
// 			.doc(refund_merchant_uid)
// 			.update({
// 				...response,
// 				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 			}) // DB에 환불 정보 업데이트
// 			.then(() => {
// 				return res.json({ message: '환불 완료!' });
// 			})
// 			.catch(err => {
// 				console.log(err);
// 				return res.status(400).json({ message: '이미 전액환불된 주문입니다.' });
// 			});
// 	} catch (e) {
// 		console.log('payCancel 오류 : ', e);
// 		// return res.status(400).json(e);
// 		return next(e);
// 	}
// });
//
// // 아임포트 결제처리
// const payUpdate = async (paymentData: any, orderData: any) => {
// 	const db = admin.firestore();
// 	const exhibitionId = orderData.exhibitionId;
// 	const merchantId = paymentData.merchant_uid;
//
// 	let exhibitionData = (await db.collection('Exhibition').doc(exhibitionId).get()).data();
// 	exhibitionData = exhibitionData ? exhibitionData : {};
//
// 	// 페이팔 결제일 경우
// 	let payUrl = 'https://us-central1-gd-virtual-staging.cloudfunctions.net/pay';
// 	if (paymentData.pg_provider === 'paypal' || paymentData.pg_provider === 'paypal_v2') {
// 		payUrl = 'https://us-central1-gd-virtual-staging.cloudfunctions.net/paypalRt';
// 	}
//
// 	if (paymentData.status === 'paid' || paymentData.status === 'ready') {
// 		// 결제 성공 시 로직,
// 		axios
// 			.post(payUrl, {
// 				imp_uid: paymentData.imp_uid,
// 				merchant_uid: paymentData.merchant_uid,
// 			})
// 			.then(response => {
// 				// 가맹점 서버 결제 API 성공시 로직
// 				switch (response.data.status) {
// 					case 'vbankIssued':
// 						// 가상계좌 발급 시 로직
// 						console.log('가상계좌 발급 완료');
// 						break;
// 					case 'success':
// 						// 결제 성공 시 로직
// 						if (
// 							admin.firestore.Timestamp.now().seconds <
// 							(exhibitionData?.expiredAt ? exhibitionData.expiredAt.seconds : 0)
// 						) {
// 							if (exhibitionData?.plan !== orderData.plan) {
// 								// // 환불 요청
// 								// let lastOrderId = exhibitionData.orderIds[exhibitionData.orderIds.length - 1];
// 								// db.collection('Order').doc(lastOrderId).update({
// 								//   refund_request_at: admin.firestore.Timestamp.now(),
// 								//   refund_status: 'refund',
// 								//   updatedAt: admin.firestore.Timestamp.now(),
// 								// });
//
// 								// 만료 전 플랜변경 (개인 -> 비즈니스)
// 								db.collection('Exhibition')
// 									.doc(exhibitionId)
// 									.update({
// 										plan: orderData.plan,
// 										stagePlan: orderData.plan,
// 										orderIds: admin.firestore.FieldValue.arrayUnion(merchantId),
// 									});
// 							} else {
// 								// 만료 전 기간연장 (플랜 유지)
// 								db.collection('Exhibition')
// 									.doc(exhibitionId)
// 									.update({
// 										plan: orderData.plan,
// 										stagePlan: orderData.plan,
// 										expiredAt: new Date(
// 											exhibitionData?.expiredAt
// 												.toDate()
// 												.setMonth(
// 													exhibitionData.expiredAt.toDate().getMonth() + orderData.payPeriod,
// 												),
// 										),
// 										orderIds: admin.firestore.FieldValue.arrayUnion(merchantId),
// 										updatedAt: admin.firestore.Timestamp.now(),
// 									});
// 							}
// 						} else {
// 							// 만료 후 결제 or 새로 결제 (플랜 상관X)
// 							db.collection('Exhibition')
// 								.doc(exhibitionId)
// 								.update({
// 									plan: orderData.plan,
// 									stagePlan: orderData.plan,
// 									paidAt: admin.firestore.Timestamp.now(),
// 									expiredAt: new Date(
// 										admin.firestore.Timestamp.now()
// 											.toDate()
// 											.setMonth(
// 												admin.firestore.Timestamp.now().toDate().getMonth() + orderData.payPeriod,
// 											),
// 									),
// 									orderIds: admin.firestore.FieldValue.arrayUnion(merchantId),
// 									updatedAt: admin.firestore.Timestamp.now(),
// 								});
// 						}
//
// 						try {
// 							if (orderData.isUpgrade !== 'true') {
// 								// 출판
// 								let draftsRef = db.collection('Exhibition').doc(exhibitionId).collection('drafts');
// 								draftsRef
// 									.orderBy('editedAt', 'desc')
// 									.limit(1)
// 									.get()
// 									.then(querySnapshot => {
// 										querySnapshot.forEach(doc => {
// 											db.collection('Exhibition')
// 												.doc(exhibitionId)
// 												.collection('published')
// 												.add({
// 													data: doc.data().data,
// 													editedAt: admin.firestore.Timestamp.now(),
// 												})
// 												.then(() => {
// 													db.collection('Exhibition').doc(exhibitionId).update({
// 														publishedAt: admin.firestore.Timestamp.now(),
// 													});
// 												});
// 										});
// 									});
// 							}
//
// 							// 프로모션 코드 사용 처리
// 							if (orderData.promotionCode) {
// 								db.collection('Promotion')
// 									.doc(orderData.promotionCode)
// 									.update({
// 										usedCount: admin.firestore.FieldValue.increment(1),
// 										usedExhibitions: admin.firestore.FieldValue.arrayUnion(exhibitionId),
// 										usedUsers: admin.firestore.FieldValue.arrayUnion(orderData.buyer_id),
// 									})
// 									.catch(error => {
// 										console.error('Error updating document Promotion: ', error);
// 									});
// 							}
//
// 							// 결제 완료 알림
// 							db.collection(`User/${orderData.buyer_id}/Notification`)
// 								.add({
// 									type: 'pay',
// 									title: `전시 ${exhibitionData?.title}이(가) ${
// 										orderData.plan === 'personal' ? '개인' : '비즈니스'
// 									} 플랜으로 결제되었습니다.`,
// 									content: `금액 : ${orderData.price
// 										.toString()
// 										.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
// 										paymentData.pg_provider === 'paypal' ? '달러' : '원'
// 									}`,
// 									userId: orderData.buyer_id,
// 									exhibitionId,
// 									createdAt: admin.firestore.Timestamp.now(),
// 									isNotificationRead: false,
// 									data: {
// 										exhibitionId,
// 										exhibitionTitle: exhibitionData?.title ? exhibitionData.title : '',
// 									},
// 								})
// 								.then(docRef => {
// 									db.collection(`User/${orderData.buyer_id}/Notification`).doc(docRef.id).update({
// 										id: docRef.id,
// 									});
// 								})
// 								.catch(error => {
// 									console.error('Error creating collection Notification: ', error);
// 								});
//
// 							// 카톡 보내기
// 							axios
// 								.post(
// 									'https://msggw.supersms.co:9443/v1/send/kko',
// 									{
// 										msg_type: 'AL',
// 										mt_failover: 'N',
// 										msg_data: `[OTWC]\n클라우드 결제 완료 안내\n\n[결제완료]\n클라우드 ${
// 											exhibitionData?.title
// 										}이(가) ${
// 											orderData.plan === 'personal' ? '개인' : '비즈니스'
// 										}으로 결제되었습니다.\n금액: ${orderData.price
// 											.toString()
// 											.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${
// 											paymentData.pg_provider === 'paypal' ? '달러' : '원'
// 										}\n\n결제내역 보기: ${'https://platform.onthewall.io/mypage'}`,
// 										msg_attr: {
// 											sender_key: '2d6bc4f469dc2330995ed3a760e756cd50cbe013',
// 											response_method: 'push',
// 											template_code: 'pay-alarm',
// 										},
// 									},
// 									{
// 										headers: {
// 											'X-IB-Client-Id': 'gdcomm_talk',
// 											'X-IB-Client-Passwd': 'UBMzZ9te7RAcSImX6RrG',
// 										},
// 									},
// 								)
// 								.then(data => {
// 									// console.log('kakaoMessage send');
// 								})
// 								.catch(err => {
// 									console.log('error kakaoMessage', err);
// 								});
// 						} catch (err) {
// 							console.log('warning : ', err);
// 						}
// 						break;
// 				}
// 			})
// 			.catch(err => {
// 				console.log('결제취소 절차 시작', err);
// 				/*
// 				 * 결제취소 (전액 자동환불)
// 				 */
// 				axios
// 					.post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payAutoCancel', {
// 						merchant_uid: merchantId,
// 						cancel_request_amount: orderData.price, // 환불금액
// 						reason: '결제취소(자동환불)', // 환불사유
// 					})
// 					.then(result => {
// 						console.log('결제가 취소되었습니다.');
// 					})
// 					.catch(error => {
// 						console.log('환불에 실패하였습니다!\n고객센터로 문의해 주세요.');
// 					});
// 			});
// 	} else {
// 		// 결제 실패 시 로직,
// 		console.log('결제에 실패하였습니다.' + ' ' + paymentData.fail_reason);
// 		console.log('paymentData: ', paymentData);
// 	}
// };
//
// // 아임포트 관리자 페이지와 동기화
// router.post('/iamportWebhook', async (req, res, next) => {
// 	const { imp_uid, merchant_uid, status } = req.body;
// 	const db = admin.firestore();
//
// 	const getPaymentData = async () => {
// 		/*
// 		 * 액세스 토큰(access token) 발급 받기
// 		 */
// 		const getToken = await axios({
// 			url: 'https://api.iamport.kr/users/getToken',
// 			method: 'post', // POST method
// 			headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
// 			data: {
// 				imp_key: '4686930638841492', // REST API 키
// 				imp_secret:
// 					'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
// 			},
// 		});
// 		const { access_token } = getToken.data.response; // 인증 토큰
//
// 		/*
// 		 * imp_uid로 아임포트 서버에서 결제 정보 조회
// 		 */
// 		const getPaymentDatafromIamPort = await axios({
// 			url: `https://api.iamport.kr/payments/${imp_uid}`,
// 			method: 'get', // GET method
// 			headers: { Authorization: access_token },
// 		});
//
// 		return getPaymentDatafromIamPort.data.response; // 조회한 결제 정보
// 	};
//
// 	let docRef = db.collection('Order').doc(merchant_uid);
// 	docRef
// 		.get()
// 		.then(async doc => {
// 			if (doc.exists) {
// 				if (status !== 'cancelled') {
// 					/*
//             // DB에 결제정보 잘 들어갔을때
//             */
// 					if (doc.data()?.imp_uid === imp_uid) {
// 						return res.send('ok');
// 					} else {
// 						/*
//               // DB에 결제정보 안 들어갔을때
//               */
// 						const paymentData = await getPaymentData(); // 아임포트에서 결제정보 조회
//
// 						if (paymentData.merchant_uid !== merchant_uid) {
// 							console.log('결제정보 불일치');
// 							return res.status(500).send('결제정보 불일치');
// 						} else if (
// 							paymentData.pg_provider === 'paypal' ||
// 							paymentData.pg_provider === 'paypal_v2'
// 						) {
// 							payUpdate(paymentData, doc.data());
// 							return res.send('paypal update');
// 						} else {
// 							// DB에 결제 정보 업데이트 (동기화)
// 							db.collection('Order')
// 								.doc(merchant_uid)
// 								.update({
// 									...paymentData,
// 									updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 								})
// 								.then(() => {
// 									return res.send('ok');
// 								})
// 								.catch(err => {
// 									console.log('업데이트 오류');
// 									return res.status(500).send('업데이트 오류');
// 								});
// 						}
// 					}
// 				} else {
// 					/*
//             // 관리자콘솔에서 취소했을때
//             */
// 					const paymentData = await getPaymentData(); // 아임포트에서 결제정보 조회 (취소데이터 포함)
//
// 					// to-do 트랜잭션으로 처리
// 					// DB에 결제 정보 업데이트 (동기화)
// 					db.collection('Order')
// 						.doc(merchant_uid)
// 						.update({
// 							...paymentData,
// 							updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 						})
// 						.then(() => {
// 							return res.send('ok');
// 						})
// 						.catch(err => {
// 							console.log('취소 업데이트 오류');
// 							return res.status(500);
// 						});
//
// 					// 전시회 만료일 업데이트
// 					let exhibitionRef = db.collection('Exhibition').doc(doc.data()?.exhibitionId);
// 					return exhibitionRef
// 						.update({
// 							expiredAt: admin.firestore.FieldValue.serverTimestamp(),
// 						})
// 						.then(() => {
// 							console.log('Document successfully updated!');
// 						})
// 						.catch(error => {
// 							console.error('Error updating exhibitionDocument: ', error);
// 						});
// 				}
// 			} else {
// 				console.log('No such document!');
// 				return res.status(404).send('No such document!');
// 			}
// 		})
// 		.catch(error => {
// 			console.log('Error getting document:', error);
// 			return res.status(500).json(error);
// 		});
// });
// // 아임포트 동기화 테스트
// router.post('/iamportWebhookTest', async (req, res, next) => {
// 	const { imp_uid, merchant_uid, status } = req.body;
// 	const db = admin.firestore();
//
// 	const getPaymentData = async () => {
// 		/*
// 		 * 액세스 토큰(access token) 발급 받기
// 		 */
// 		const getToken = await axios({
// 			url: 'https://api.iamport.kr/users/getToken',
// 			method: 'post', // POST method
// 			headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
// 			data: {
// 				imp_key: '4686930638841492', // REST API 키
// 				imp_secret:
// 					'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
// 			},
// 		});
// 		const { access_token } = getToken.data.response; // 인증 토큰
//
// 		/*
// 		 * imp_uid로 아임포트 서버에서 결제 정보 조회
// 		 */
// 		const getPaymentDatafromIamPort = await axios({
// 			url: `https://api.iamport.kr/payments/${imp_uid}`,
// 			method: 'get', // GET method
// 			headers: { Authorization: access_token },
// 		});
//
// 		return getPaymentDatafromIamPort.data.response; // 조회한 결제 정보
// 	};
//
// 	let docRef = db.collection('Order').doc(merchant_uid);
// 	docRef
// 		.get()
// 		.then(async doc => {
// 			if (doc.exists) {
// 				if (status !== 'cancelled') {
// 					/*
//             // DB에 결제정보 잘 들어갔을때
//             */
// 					if (doc.data()?.imp_uid === imp_uid) {
// 						return res.send('ok');
// 					} else {
// 						/*
//               // DB에 결제정보 안 들어갔을때
//               */
// 						const paymentData = await getPaymentData(); // 아임포트에서 결제정보 조회
//
// 						if (paymentData.merchant_uid !== merchant_uid) {
// 							console.log('결제정보 불일치');
// 							return res.status(500).send('결제정보 불일치');
// 						} else if (
// 							paymentData.pg_provider === 'paypal' ||
// 							paymentData.pg_provider === 'paypal_v2'
// 						) {
// 							console.log('@@@@@@@paypal test@@@@@@@');
// 							payUpdate(paymentData, doc.data());
// 							return res.send('paypal update');
// 						}
//
// 						// DB에 결제 정보 업데이트 (동기화)
// 						db.collection('Order')
// 							.doc(merchant_uid)
// 							.update({
// 								...paymentData,
// 								updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 							})
// 							.then(doc => {
// 								console.log('@@@@@@@결제 업데이트 성공@@@@@@@');
// 								// 정기결제 시 다음 결제 예약
// 								if (paymentData.channel === 'api') {
// 									axios
// 										.post('https://us-central1-gd-virtual-staging.cloudfunctions.net/pay', {
// 											imp_uid: paymentData.imp_uid,
// 											merchant_uid: paymentData.merchant_uid,
// 										})
// 										.then(res => {
// 											console.log('$$$$res', res);
// 										});
// 								}
// 								return res.send('ok');
// 							})
// 							.catch(err => {
// 								console.log('업데이트 오류', err);
// 								return res.status(500).send('업데이트 오류');
// 							});
// 					}
// 				} else {
// 					/*
//             // 관리자콘솔에서 취소했을때
//             */
// 					const paymentData = await getPaymentData(); // 아임포트에서 결제정보 조회 (취소데이터 포함)
//
// 					// to-do 트랜잭션으로 처리
// 					// DB에 결제 정보 업데이트 (동기화)
// 					db.collection('Order')
// 						.doc(merchant_uid)
// 						.update({
// 							...paymentData,
// 							updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 						})
// 						.then(() => {
// 							return res.send('ok');
// 						})
// 						.catch(err => {
// 							console.log('취소 업데이트 오류');
// 							return res.status(500).send('취소 업데이트 오류');
// 						});
//
// 					// 전시회 만료일 업데이트
// 					let exhibitionRef = db.collection('Exhibition').doc(doc.data()?.exhibitionId);
// 					return exhibitionRef
// 						.update({
// 							expiredAt: admin.firestore.FieldValue.serverTimestamp(),
// 						})
// 						.then(() => {
// 							console.log('Document successfully updated!');
// 						})
// 						.catch(error => {
// 							console.error('Error updating exhibitionDocument: ', error);
// 						});
// 				}
// 			} else {
// 				console.log('No such document!');
// 				return res.status(404).send('No such document!');
// 			}
// 		})
// 		.catch(error => {
// 			console.log('Error getting document:', error);
// 			return res.status(500).json(error);
// 		});
// });
//
// // 페이팔 정기결제
// router.post('/paypalRt', async (req, res, next) => {
// 	try {
// 		const { imp_uid } = req.body; // req의 body에서 imp_uid, merchant_uid 추출
// 		/*
// 		 * 액세스 토큰(access token) 발급 받기
// 		 */
// 		const getToken = await axios({
// 			url: 'https://api.iamport.kr/users/getToken',
// 			method: 'post', // POST method
// 			headers: { 'Content-Type': 'application/json' }, // "Content-Type": "application/json"
// 			data: {
// 				imp_key: '4686930638841492', // REST API 키
// 				imp_secret:
// 					'YvS0sMRVsGyo2B4lqUNBnMPaFGbfWfUVKNWdzN81tHqwiuSJoFkMraW7Q8mMngI83ElDsuFWb5suzkdY', // REST API Secret
// 			},
// 		});
// 		const { access_token } = getToken.data.response; // 인증 토큰
//
// 		/*
// 		 * imp_uid로 아임포트 서버에서 결제 정보 조회
// 		 */
// 		const getPaymentData = await axios({
// 			url: `https://api.iamport.kr/payments/${imp_uid}`, // imp_uid 전달
// 			method: 'get', // GET method
// 			headers: { Authorization: access_token }, // 인증 토큰 Authorization header에 추가
// 		});
//
// 		const paymentData = getPaymentData.data.response; // 조회한 결제 정보
//
// 		/*
// 		 * DB에서 결제되어야 하는 금액 조회
// 		 */
// 		const db = admin.firestore();
// 		let docRef = db.collection('Order').doc(paymentData.merchant_uid);
// 		await docRef
// 			.get()
// 			.then(doc => {
// 				if (doc.exists) {
// 					db.collection('Order')
// 						.doc(paymentData.merchant_uid)
// 						.update({
// 							...paymentData,
// 							updatedAt: admin.firestore.FieldValue.serverTimestamp(),
// 						}) // DB에 결제 정보 저장
// 						.then(() => {
// 							// let amountToBePaid = doc.data()?.price; // 결제 되어야 하는 금액
// 							const { status } = paymentData;
// 							/*
// 							 * 결제 검증하기
// 							 */
// 							// status 값 검증
// 							switch (status) {
// 								case 'pending': // 승인 대기
// 									return res.send({
// 										status: 'pending',
// 										message: '정기 결제가 승인 대기 중입니다.',
// 									});
// 								case 'paid': // 결제 완료
// 									return res.send({
// 										status: 'success',
// 										message: '정기 결제 성공',
// 									});
// 								case 'failed': // 결제 실패
// 									return res.send({
// 										status: 'failed',
// 										message: '정기 결제 실패',
// 									});
// 								default:
// 									// 결제금액 불일치. 위/변조 된 결제
// 									throw { status: 'forgery', message: '위조된 결제시도' };
// 							}
// 						})
// 						.catch(e => {
// 							console.log('111111111111111', e);
// 							return res.status(500).json(e);
// 						});
// 				} else {
// 					// Order doc 없음
// 					throw { status: 'nosuchDoc', message: 'Order doc 없음' };
// 				}
// 			})
// 			.catch(e => {
// 				// DB에 결제 정보 저장 실패
// 				console.log('222222222222', e);
// 				return res.status(500).json({
// 					status: 'firebaseUpdateError',
// 					message: 'DB에 결제 정보 저장 실패',
// 					error: e,
// 				});
// 			});
// 	} catch (e) {
// 		console.log('33333333333', e);
// 		// return res.status(400).json(e);
// 		return next(e);
// 	}
// });
//
// export default router;
