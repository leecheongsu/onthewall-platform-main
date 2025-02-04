import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';
import { moduleApis } from '@/api/module';

type ModuleResponseForm = {
	totalCount: number;
	exhibitions: Exhibition[];
};

type State = {
	allExhibitions: ModuleResponseForm;
	pendings: ModuleResponseForm;
	rejecteds: ModuleResponseForm;
};

interface Actions {
	fetchExhibitions: (projectId: string) => void;
	fetchPendingExhibitions: (projectId: string) => void;
	fetchRejectedExhibitions: (projectId: string) => void;
}

export const useExhibitionStore = create<State & Actions>()(
	persist(
		(set, get) => ({
			allExhibitions: {
				totalCount: 0,
				exhibitions: [],
			},
			pendings: {
				totalCount: 0,
				exhibitions: [],
			},
			rejecteds: {
				totalCount: 0,
				exhibitions: [],
			},

			fetchExhibitions: async (projectId: string) => {
				try {
					const res = await moduleApis.getExhibitionsByProjectId(projectId);
					if (res.status === 200) {
						set({ allExhibitions: res.data });
					}
				} catch (e) {
					console.error('Fetch Exhibitions : ', e);
				}
			},

			fetchPendingExhibitions: async (projectId: string) => {
				try {
					const res = await moduleApis.getPendingExhibitionsByProjectId(projectId);

					if (res.status === 200) {
						set({ pendings: res.data });
					}
				} catch (e) {
					console.error('Fetch Pendings : ', e);
				}
			},

			fetchRejectedExhibitions: async (projectId: string) => {
				try {
					const res = await moduleApis.getRejectedExhibitionsByProjectId(projectId);
					if (res.status === 200) {
						set({ rejecteds: res.data });
					}
				} catch (e) {
					console.error('Fetch Pendings : ', e);
				}
			},
		}),
		{
			name: 'exhibition-storage',
			storage: createJSONStorage(() => sessionStorage),
			partialize: state => ({}),
		},
	),
);
