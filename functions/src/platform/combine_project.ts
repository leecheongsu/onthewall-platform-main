import { Router } from 'express';
import * as admin from 'firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

const router = Router();
// @ts-ignore: next-line
type ClientType = {
  id: string; // id가 projectUrl
  title: string; // -> channelName
  name: string; // -> 삭제

  // count
  commentCount: number;
  exhibitionCount: number;
  likeCount: number;

  //삭제 -> sectiondesign으로 옮김.
  //초기에 empty section과 함께 추가해줌.
  banner: Array<{
    id: string;
    createdAt: Timestamp;
    imageUrl: string;
    order: number;
    url: string;
  }>;
  // project design 하위 section으로 이전해야함.

  email: string; // 삭제
  // projectDesign으로
  faviconUrl: string; // projectDesign으로
  footerInfo: string; // projectDesign으로
  logo: string; // projectDesign으로

  // 버그가 있는듯 마이너스는 여기 쌓이는 것 같음.
  like: number;

  maxCount: number; // -> exhibitionLimit

  tel: string; // 삭제
  // tier: 'enterprise' | 'business';

  tier: 'enterprise' | 'business' | 'personal' | 'free'; // 소문자로 수정

  createdAt: Timestamp;
  type: 'ONTHEWALL_CLOUD' | 'CLOUD' | 'ONE_USER';
  // 원유저는 현재 client에서 유지함.
  // 나머지만 복사해서 project로 이동함.
};

type ProjectType = {
  id?: string; // o
  channelName: string; // title
  // title: string;

  projectUrl: string; // id
  tier: 'enterprise' | 'business' | 'personal' | 'free'; // o
  status: 'processing' | 'expired' | 'activated';
  subscriptionModel: 'annual' | 'monthly' | 'custom';
  exhibitionLimit: number; // maxCount
  assignedExhibitionCount: number; // 계산해서 넣어야함.
  currentExhibitionCount: number; // 계산해서 넣어야함.
  adminExhibitionCount: number; // 계산해서 넣어야함.
  expiredAt: Timestamp; // 없음.
  createdAt: Timestamp; // createdAt
  updatedAt: Timestamp; // now로 넣음.

  // 기록
  likeCount: number; // 계산 혹은 이전
  commentCount: number; // 계산 혹은 이전
  viewCount: number; // 계산 혹은 이전
  type: 'ONTHEWALL_CLOUD';

  config: {
    adminMaxCount: number; // -> pay시 들어가야함. 3개로 고정.
    isAutoApproved: boolean; // false
    initialAssignCount: number; // 1
  };
};
// @ts-ignore: next-line
const projectDesign = {
  id: '',
  title: '',
  description: '',
  logoUrl: '',
  faviconUrl: '',
  ogUrl: '',
  footer: {
    company: '',
    copyright: '',
  },
  blog: '',
  instagram: '',
  facebook: '',
  homepage: '',
  theme: {
    primary: '',
    secondary: '',
  },
  channelData: {
    bannerData: {
      desktop: {
        url: '',
      },
      mobile: {
        url: '',
      },
    },
    thumbnail:
      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
    description: '',
    information: '',
    facebook: '',
    x: '',
    instagram: '',
    shop: '',
    homepage: '',
    blog: '',
  },
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

type ProjectDesignType = {
  id?: string;
  title: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  ogUrl: string;
  footer: {
    company: string;
    copyright: string;
  };
  blog: string;
  instagram: string;
  facebook: string;
  homepage: string;
  theme: {
    primary: string;
    secondary: string;
  };
  channelData: {
    bannerData: {
      desktop: {
        url: string;
      };
      mobile: {
        url: string;
      };
    };
    thumbnail: string;
    description: string;
    information: string;
    x: string;
    instagram: string;
    facebook: string;
    shop: string;
    homepage: string;
    blog: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

// @ts-ignore: next-line

const emptySection = (projectId: string, order: number) => ({
  projectId: projectId,
  type: 'BLANK',
  order: order,
  height: 30,
  isDeleted: false,
  updatedAt: Timestamp.now(),
  createdAt: Timestamp.now(),
});
const bannerSection = (projectId: string, url: string, order: number) => ({
  projectId: projectId,
  order: order,
  type: 'BANNER',
  desktop: {
    url:
      url ??
      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
    height: '',
  },
  hasMobile: false,
  mobile: {
    url: '',
    height: '',
  },
  hasLink: false,
  linkUrl: '',
  isDeleted: false,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});

router.get('/combine_project', async (req, res, next) => {
  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    const allSnapshot = await db.collection('Client').get();
    const allProjects = await db.collection('Project').get();

    const allClientsData: Array<ClientType> = allSnapshot.docs.map((doc) => {
      return { id: doc.id, ...(doc.data() as any) };
    });

    const allProjectsData: Array<ProjectType> = allProjects.docs.map((doc) => {
      return { ...(doc.data() as any), id: doc.id };
    });

    const convertProject = async (originalProject: ClientType) => {
      const {
        maxCount,
        tier,
        title,
        createdAt,
        // commentCount,
        id,
      } = originalProject;

      const users = await db.collection('User').where('projectId', '==', id).get();
      let assignedExhibitionCount = 0;
      let currentExhibitionCount = 0;
      let adminExhibitionCount = 0;
      users.forEach((user) => {
        if (user.exists) {
          const userData = user.data();
          if (userData.cloudData?.[id]) {
            currentExhibitionCount += userData.cloudData[id].currentExhibitionCount;
            if (userData.cloudData[id].isAdmin) {
              adminExhibitionCount += userData.cloudData[id].createExhibitionCount;
            } else {
              assignedExhibitionCount += userData.cloudData[id].createExhibitionLimit;
            }
          }
        }
      });

      const exhibitions = await db.collection('Exhibition').where('projectId', '==', id).get();

      let likeCount = 0;
      let commentCount = 0;
      let viewCount = 0;

      exhibitions.forEach((exhibition) => {
        if (exhibition.exists) {
          const exhibitionData = exhibition.data();
          likeCount += exhibitionData.like;
          commentCount += exhibitionData.commentCount;
          viewCount += exhibitionData.views?.totalView ?? 0;
        }
      });

      const newProject: ProjectType = {
        // id,
        channelName: title ?? '',
        projectUrl: id,
        tier: (new String(tier).toLowerCase() as any) ?? 'free',
        status: 'activated',
        subscriptionModel: 'annual',
        exhibitionLimit: maxCount ?? 20,
        assignedExhibitionCount: assignedExhibitionCount ?? 0,
        currentExhibitionCount: currentExhibitionCount ?? 0,
        adminExhibitionCount: adminExhibitionCount ?? 0,
        expiredAt: Timestamp.fromDate(new Date('2025-10-31')),
        createdAt: createdAt ?? now,
        updatedAt: now,
        likeCount: likeCount ?? 0,
        commentCount: commentCount ?? 0,
        viewCount: viewCount ?? 0,
        type: 'ONTHEWALL_CLOUD',
        config: {
          adminMaxCount: 3, // -> pay시 들어가야함. 3개로 고정.
          isAutoApproved: false, // false
          initialAssignCount: 1, // 1
        },
      };
      return { users, newProject };
    };

    const convertProjectDesign = (originalProject: ClientType) => {
      const { title, createdAt, logo, faviconUrl, footerInfo, banner } = originalProject;
      const projectDesign: ProjectDesignType = {
        title: '',
        description: '',
        logoUrl: logo,
        faviconUrl: faviconUrl,
        ogUrl: '',

        footer: {
          company: footerInfo,
          copyright: `Copyright © ${title} all rights reserved.`,
        },
        blog: '',
        instagram: '',
        facebook: '',
        homepage: '',
        theme: {
          primary: '',
          secondary: '',
        },
        channelData: {
          bannerData: {
            desktop: {
              url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
            },
            mobile: {
              url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%[…]?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
            },
          },
          thumbnail:
            logo ||
            'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
          description: '',
          information: '',
          x: '',
          instagram: '',
          facebook: '',
          shop: '',
          homepage: '',
          blog: '',
        },

        createdAt: createdAt ?? now,
        updatedAt: now,
      };
      return projectDesign;
    };
    let batch = db.batch();

    const BATCH_SIZE = 200;
    let operationCounter = 0;

    for (const [index, project] of allClientsData.entries()) {
      if (project.type === 'ONTHEWALL_CLOUD' || project.type === 'ONE_USER') continue;

      const { users, newProject } = await convertProject(project);
      const projectRef = db.collection('Project').doc();
      batch.set(projectRef, newProject);

      operationCounter++;

      if (operationCounter === BATCH_SIZE || index === allProjectsData.length - 1) {
        await batch.commit();

        // 아이디 업데이트
        db.collection('Project').doc(projectRef.id).update({
          id: projectRef.id,
        });

        // projectDesign 추가
        const projectDesign = convertProjectDesign(project);
        await db
          .collection('ProjectDesign')
          .doc(projectRef.id)
          .set({ ...projectDesign, id: projectRef.id });

        // user에 프로젝츠 업데이트
        for (const user of users.docs) {
          const v = user.data();

          if (v.cloudData[project.id]?.isAdmin) {
            user.ref.update({
              projects: FieldValue.arrayUnion({
                id: projectRef.id,
                status: 'admin',
              }),
            });
          } else {
            user.ref.update({
              projects: FieldValue.arrayUnion({
                id: projectRef.id,
                status: 'user',
              }),
            });
            // project에 일반 유저 업데이트
            db.collection('Project')
              .doc(projectRef.id)
              .collection('User')
              .doc(user.id)
              .set({
                ...v,
                id: user.id,
                projects: [
                  {
                    id: projectRef.id,
                    status: 'user',
                  },
                ],
                password: '',
                status: 'general',
                oldUser: true,
                isMoved: true,
              });
          }
          // 섹션 추가
          const empty1 = emptySection(projectRef.id, 0);
          const banner = bannerSection(projectRef.id, project.banner[0].url, 1);
          const empty2 = emptySection(projectRef.id, 2);
          db.collection('ProjectDesign').doc(projectRef.id).collection('Section').doc().set(empty1);
          db.collection('ProjectDesign').doc(projectRef.id).collection('Section').doc().set(banner);
          db.collection('ProjectDesign').doc(projectRef.id).collection('Section').doc().set(empty2);
        }

        operationCounter = 0;
        batch = db.batch();
      }
    }
  } catch (e) {
    console.error('Combine : ', e);
    return next(e);
  }
});

// 기존 프로젝트 업데이트
// router.get('/combine_project', async (req, res, next) => {
//   try {
//     const db = admin.firestore();
//     const now = Timestamp.now();

//     // const allSnapshot = await db.collection('Client').get();
//     const allProjects = await db.collection('Project').get();

//     // const allClientsData: Array<ClientType> = allSnapshot.docs.map((doc) => {
//     //   return { id: doc.id, ...doc.data() as any };
//     // });

//     const allProjectsData: Array<ProjectType> = allProjects.docs.map((doc) => {
//       return { ...(doc.data() as any), id: doc.id };
//     });

//     const convertProject = (originalProject: any) => {
//       const {
//         adminExhibitionCount,
//         assignedExhibitionCount,
//         channelName,
//         commentCount,
//         createdAt,
//         currentExhibitionCount,
//         exhibitionLimit,
//         expiredAt,
//         likeCount,
//         projectUrl,
//         status,
//         subscriptionModel,
//         tier,
//         viewCount,
//         title,
//         id,
//       } = originalProject;

//       const newProject: ProjectType = {
//         id,
//         channelName: channelName ?? title ?? '',
//         projectUrl: projectUrl ?? id,
//         tier: new String(tier).toLowerCase() as any,
//         status: status ?? 'activated',
//         subscriptionModel: subscriptionModel ?? 'monthly',
//         exhibitionLimit: exhibitionLimit ?? 2,
//         assignedExhibitionCount: assignedExhibitionCount ?? 0,
//         currentExhibitionCount: currentExhibitionCount ?? 0,
//         adminExhibitionCount: adminExhibitionCount ?? 0,
//         expiredAt: expiredAt ?? Timestamp.fromDate(new Date('2025-10-31')),
//         createdAt: createdAt ?? now,
//         updatedAt: now,
//         likeCount: likeCount ?? 0,
//         commentCount: commentCount ?? 0,
//         viewCount: viewCount ?? 0,
//         type: 'ONTHEWALL_CLOUD',
//         config: {
//           adminMaxCount: 3, // -> pay시 들어가야함. 3개로 고정.
//           isAutoApproved: false, // false
//           initialAssignCount: 1, // 1
//         },
//       };
//       return newProject;
//     };

//     let batch = db.batch();

//     const BATCH_SIZE = 500;
//     let operationCounter = 0;

//     // for (const project of combined) {
//     //   const index = combined.indexOf(project);
//     //   const projectRef = db.collection('Project').doc(project.id!);
//     //   batch.set(projectRef, project, { merge: true });

//     //   operationCounter++;

//     //   if (operationCounter === BATCH_SIZE || index === combined.length - 1) {
//     //     await batch.commit();
//     //     operationCounter = 0;
//     //     batch = db.batch();
//     //   }
//     // }

//     allProjectsData.forEach(async (project, index) => {
//       const newProject = convertProject(project);
//       const projectRef = db.collection('Project').doc(project.id!);
//       batch.set(projectRef, newProject);

//       operationCounter++;

//       if (operationCounter === BATCH_SIZE || index === allProjectsData.length - 1) {
//         await batch.commit();
//         operationCounter = 0;
//         batch = db.batch();
//       }
//     });
//   } catch (e) {
//     console.error('Combine : ', e);
//     return next(e);
//   }
// });

export default router;
