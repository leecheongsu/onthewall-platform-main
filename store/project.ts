import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CommonActions } from '@/store/index';
import { platformManageApis } from '@/api/platform';
import { devtools } from 'zustand/middleware';

type FetchProjectDataStatus = 'wait' | 'loading' | 'done' | 'error';
type PlanProcessingStatus = 'processing' | 'expired' | 'activated';
type ProjectPlanStatus = 'free' | 'enterprise' | 'business' | 'personal';

type State = {
  projectId: string;
  projectUrl: string;
  channelName: string;
  subscriptionModel: string;
  exhibitionLimit: number;
  expiredAt: Date | null;
  fetchProjectDataStatus: FetchProjectDataStatus;

  userData: UserInfo[];
  adminData: UserInfo[];
  allUserData: UserInfo[];
  isExpired: boolean;
  status: PlanProcessingStatus;
  currentExhibitionCount: number;
  tier: ProjectPlanStatus;
  config: ProjectConfiguration;
};

interface Actions extends CommonActions {
  fetchProjectDataByUrl: (projectUrl: string) => void;
  fetchProjectDataById: (projectId: string) => void;
  fetchProjectUserData: (projectId: string, type: 'user' | 'admin' | 'allUser') => void;
  resetProjectData: () => void;
}

const initConfig: ProjectConfiguration = {
  adminMaxCount: 0,
  isAutoApproved: false,
  initialAssignedCount: 3,
};

export const useProjectStore = create<State & Actions>()(
  devtools(
    persist(
      (set, get) => ({
        projectId: '',
        projectUrl: '',
        channelName: '',
        subscriptionModel: '',
        exhibitionLimit: 0,
        expiredAt: null,
        fetchProjectDataStatus: 'wait' as FetchProjectDataStatus,
        userData: [],
        adminData: [],
        allUserData: [],
        isExpired: false,
        status: 'processing' as PlanProcessingStatus,
        currentExhibitionCount: 0,
        tier: 'free' as ProjectPlanStatus,
        config: initConfig,

        updateInfo: (type: string, value: any) => set((state) => ({ [type]: value })),

        fetchProjectDataByUrl: async (projectUrl: string) => {
          try {
            set({ fetchProjectDataStatus: 'loading' });
            const res = await platformManageApis.getProjectByProjectUrl(projectUrl);
            const apiRes = res.data as ApiResponse;
            if (apiRes.meta.ok) {
              const {
                id,
                projectUrl,
                channelName,
                subscriptionModel,
                exhibitionLimit,
                expiredAt,
                status,
                currentExhibitionCount,
                tier,
                config,
              } = apiRes.data;
              let isExpired = false;
              let expiryDate = new Date();
              if (expiredAt === null) {
                isExpired = false;
              } else {
                expiryDate = new Date(expiredAt._seconds * 1000 + expiredAt._nanoseconds / 1000000);
                isExpired = expiryDate < new Date();
              }

              set({
                projectId: id,
                projectUrl: projectUrl,
                channelName: channelName ?? '',
                subscriptionModel: subscriptionModel,
                exhibitionLimit: exhibitionLimit,
                expiredAt: expiryDate,
                isExpired: isExpired,
                fetchProjectDataStatus: 'done',
                status: status,
                currentExhibitionCount: currentExhibitionCount,
                tier: tier,
                config: config ?? initConfig,
              });
            } else {
              set({ fetchProjectDataStatus: 'error' });
            }
          } catch (e) {
            console.error('Fetch Project Data :', e);
            set({ fetchProjectDataStatus: 'error' });
            // set({ fetchProjectDataStatus: 'error' });
          }
        },

        fetchProjectDataById: async (projectId: string) => {
          try {
            set({ fetchProjectDataStatus: 'loading' });
            const res = await platformManageApis.getProjectDataById(projectId);
            const apiRes = res.data as ApiResponse;
            if (apiRes.meta.ok) {
              const {
                id,
                projectUrl,
                channelName,
                subscriptionModel,
                exhibitionLimit,
                expiredAt,
                status,
                currentExhibitionCount,
                tier,
                config,
              } = apiRes.data;
              let isExpired = false;
              let expiryDate = new Date();
              if (expiredAt === null) {
                isExpired = false;
              } else {
                expiryDate = new Date(expiredAt._seconds * 1000 + expiredAt._nanoseconds / 1000000);
                isExpired = expiryDate < new Date();
              }
              set({
                projectId: id,
                projectUrl: projectUrl,
                channelName: channelName,
                subscriptionModel: subscriptionModel,
                exhibitionLimit: exhibitionLimit,
                expiredAt: expiryDate,
                isExpired: isExpired,
                fetchProjectDataStatus: 'done',
                status: status,
                currentExhibitionCount: currentExhibitionCount,
                tier,
                config: config ?? initConfig,
              });
              return apiRes.data;
            }
          } catch (e) {
            console.error('Fetch Project Data :', e);
          }
        },

        fetchProjectUserData: async (projectId: string, status: 'user' | 'admin' | 'allUser') => {
          try {
            const res = await platformManageApis.getProjectUsers(projectId, status);
            const apiRes = res.data as ApiResponse;
            if (apiRes.meta.ok) {
              const values = Object.values(apiRes.data) as UserInfo[];
              set({ [`${status}Data`]: values });
            }
          } catch (e) {
            console.error('Fetch Project User Data : ', e);
          }
        },
        resetProjectData: () =>
          set({
            projectId: '',
            projectUrl: '',
            channelName: '',
            subscriptionModel: '',
            exhibitionLimit: 0,
            expiredAt: null,
            isExpired: false,
            fetchProjectDataStatus: 'wait',
            status: 'processing',
            userData: [],
            adminData: [],
            allUserData: [],
            currentExhibitionCount: 0,
            tier: 'free',
            config: initConfig,
          }),
      }),
      {
        name: 'project-storage',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          projectId: state.projectId,
          projectUrl: state.projectUrl,
          channelName: state.channelName,
          subscriptionModel: state.subscriptionModel,
          exhibitionLimit: state.exhibitionLimit,
          expiredAt: state.expiredAt,
          isExpired: state.isExpired,
          status: state.status,
          currentExhibitionCount: state.currentExhibitionCount,
          tier: state.tier,
          config: state.config,
        }),
      }
    ),
    { name: 'ProjectStore' } // devtools 이름 지정
  )
);
