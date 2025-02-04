import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CommonActions } from '@/store/index';
import { AxiosError } from 'axios';
import { Timestamp } from 'firebase/firestore';
import {platformManageApis} from "@/api/platform";

type State = {
	orderId: string;
	customerUid: string;
	impUid: string;
	isCompleted: boolean;
	fetchOrderDataStatus: 'wait' | 'loading' | 'done' | 'error';
};

interface Actions extends CommonActions {
	fetchOrderDataByProjectId: (projectId: string) => void;
}

export const useOrderStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			orderId: '',
			customerUid: '',
			impUid: '',
			isCompleted: false,
			fetchOrderDataStatus: 'wait',

			updateInfo: (type: string, value: any) => set(state => ({ [type]: value })),

			fetchOrderDataByProjectId: async (projectId: string) => {
				try {
					set({ fetchOrderDataStatus: 'loading' });
					const res = await platformManageApis.getOrderByProjectId(projectId);
					const apiRes = res.data as ApiResponse;
					if (apiRes.meta.ok) {
						const { merchant_uid, customer_uid, imp_uid, startAt } = apiRes.data;
						let isCompleted = false;
						let completeDate = new Date();
						if (startAt === null) {
							isCompleted = true;
						} else {
							completeDate = new Date(startAt._seconds * 1000 + startAt._nanoseconds / 1000000);
							isCompleted = completeDate < new Date();
						}
						set({
							orderId: merchant_uid,
							customerUid: customer_uid,
							impUid: imp_uid,
							isCompleted: isCompleted,
							fetchOrderDataStatus: 'done',
						});
					}
				} catch (e: AxiosError | any) {
					console.error('Fetch Order Data :', e);
					const apiRes = e.response.data as ApiResponse;
					if (!apiRes.meta.ok) {
						set({
							orderId: '',
							fetchOrderDataStatus: 'error',
						});
					}
				}
			},
		}),
		{
			name: 'order-storage',
			storage: createJSONStorage(() => sessionStorage),
			partialize: state => ({
				orderId: state.orderId,
				customerUid: state.customerUid,
				impUid: state.impUid,
				isCompleted: state.isCompleted,
			}),
		},
	),
);
