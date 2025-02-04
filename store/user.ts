import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CommonActions } from '@/store/index';
import { createJSONStorage, persist } from 'zustand/middleware';
import { moduleApis } from '@/api/module';
import { platformAccountApis, platformManageApis } from '@/api/platform';
import kakaoApis from '@/api/kakao';

export interface UserProjectList {
  id: string;
  status: 'owner' | 'admin' | 'user';
  data?: any;
}

type State = {
  isLogin: boolean;

  uid: string;
  userName: string;
  social: Social;
  email: string;
  countryCodeText: string;
  phone: string;
  paymentStatus: {
    paid: boolean;
    billingKey: boolean;
  };

  avatar: string;
  information: string;
  status: UserStatus;

  projects: UserProjectList[];
  projectsMap: Record<string, UserProjectList>;
  ownProjectIds: string[];
  alarmStatus: {
    email: boolean;
    kakao: boolean;
    marketing: boolean;
  };

  isProjectUser: boolean;
  hasPreviousExhibition: boolean;
};

interface Actions extends CommonActions {
  login: (userData: UserInfo, isProjectUser?: boolean) => void;
  logOut: () => void;
  updateObjInfo: (type: string, value: any) => void;
  updatePaymentStatus: (type: string, value: boolean) => void;
  updateProjectMap: (projectId: string) => void;
}

export const useUserStore = create<State & Actions>()(
  devtools(
    // devtools를 여기에 추가
    persist(
      (set, get) => ({
        isLogin: false,
        uid: '',
        userName: '',
        social: 'none' as Social,
        email: '',
        countryCodeText: '',
        phone: '',
        paymentStatus: {
          paid: false,
          billingKey: false
        },
        avatar: '',
        information: '',
        status: 'none' as UserStatus,
        projects: [],
        ownProjectIds: [],
        alarmStatus: {
          email: false,
          kakao: false,
          marketing: false
        },
        isProjectUser: false,
        projectsMap: {},
        hasPreviousExhibition: false,

        updateInfo: (type: string, value: any) => set((state) => ({ [type]: value })),

        updateObjInfo: (type: string, value: any) => {
          const keys = type.split('.');
          const stateKey = keys[0] as keyof State;

          set((state) => ({
            [stateKey]: {
              ...(state[stateKey] as Record<string, any>),
              [keys[1]]: value
            }
          }));
        },

        updatePaymentStatus: (type: string, value: boolean) => {
          set((state) => ({
            paymentStatus: {
              ...state.paymentStatus,
              [type]: value
            }
          }));
        },

        updateProjectMap: async (projectId: string) => {
          const projectsMap: Record<string, UserProjectList> = {};
          try {
            const { projects } = get();
            const userProjectList = projects.find(v => v.id === projectId)!!;

            const res = await platformManageApis.getProjectDataById(projectId);
            if (res.status === 200) {
              projectsMap[projectId] = {
                ...userProjectList,
                data: res.data.data
              };
              console.log('projectsMap : ', projectsMap);
              set({ projectsMap: projectsMap})
            }
          } catch (e) {
            console.error('getProjectDataById Error : ', e);
          }
        },

        login: async (userData: UserInfo, isProjectUser: boolean = false) => {
          const {
            uid,
            userName,
            email,
            countryCodeText,
            social,
            phone,
            avatar,
            information,
            alarmStatus,
            paymentStatus,
            status,
            projects
          } = userData;

          if (
            !uid ||
            !userName ||
            !email ||
            !social ||
            !alarmStatus ||
            !paymentStatus ||
            !status ||
            !projects
          ) {
            alert('Login Error. Please try again.');
            return;
          }

          let hasPreviousExhibition = false;
          if (!isProjectUser) {
            try {
              const res = await moduleApis.getExhibitionsByUserId(uid);
              if (res.status === 200) {
                console.log('res : ', res);
                hasPreviousExhibition = res.data.exhibitions.some((v: Exhibition) => v.version === 1.0);
              }
            } catch (e) {
              console.error('has Previous Error : ', e);
            }
          }

          const ownProjectIds = projects.map((v) => v.id);
          const projectsMap: Record<string, UserProjectList> = {};

          const projectPromise = projects.map(async (v) => {
            try {
              if (!v.id) {
                return;
              }
              const res = await platformManageApis.getProjectDataById(v.id);
              if (res.status === 200) {
                projectsMap[v.id] = {
                  ...v,
                  data: res.data.data
                };
                console.log('projectsMap : ', projectsMap);
              }
            } catch (e) {
              console.error('getProjectDataById Error : ', e);
            }
          });

          await Promise.all(projectPromise);

          set((state) => ({
            uid: uid,
            userName: userName,
            social: social,
            email: email,
            countryCodeText: countryCodeText,
            phone: phone,
            status: status as UserStatus,
            isLogin: true,
            paymentStatus: paymentStatus,
            avatar: avatar,
            information: information,
            alarmStatus: alarmStatus,
            projects: projects ?? [],
            ownProjectIds,
            isProjectUser: isProjectUser,
            projectsMap,
            hasPreviousExhibition: hasPreviousExhibition
          }));
        },
        logOut: async () => {
          const { social } = get();

          if (social !== 'email') {
            if (social === 'google') {
              await platformAccountApis.signOut();
            } else if (social === 'kakao') {
              kakaoApis.signOut();
            }
          }

          set({
            isLogin: false,
            uid: '',
            userName: '',
            social: 'none',
            email: '',
            countryCodeText: '',
            phone: '',
            paymentStatus: {
              paid: false,
              billingKey: false
            },
            avatar: '',
            information: '',
            status: 'none',
            projects: [],
            ownProjectIds: [],
            isProjectUser: false,
            projectsMap: {},
            alarmStatus: {
              email: false,
              kakao: false,
              marketing: false
            },
            hasPreviousExhibition: false
          });
        }
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => sessionStorage),
        partialize: (state) => ({
          isLogin: state.isLogin,
          uid: state.uid,
          userName: state.userName,
          social: state.social,
          email: state.email,
          countryCodeText: state.countryCodeText,
          phone: state.phone,
          paymentStatus: state.paymentStatus,
          avatar: state.avatar,
          information: state.information,
          status: state.status,
          projects: state.projects,
          ownProjectIds: state.ownProjectIds,
          alarmStatus: state.alarmStatus,
          isProjectUser: state.isProjectUser,
          projectsMap: state.projectsMap,
          hasPreviousExhibition: state.hasPreviousExhibition
        })
      }
    ),
    { name: 'UserStore' } // devtools 이름 지정
  )
);
