import { CloudApiConfig } from './config';

export const paymentApis = {
	async pay(data: any) {
		return await CloudApiConfig({
			method: 'post',
			url: '/payment/pay',
			data: data,
		});
	},
	async payAutoCancel(data: any) {
		return await CloudApiConfig({
			method: 'post',
			url: '/payment/pay/cancel',
			data: data,
		});
	},
};
