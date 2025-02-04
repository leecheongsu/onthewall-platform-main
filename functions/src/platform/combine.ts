import { Router } from 'express';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { User } from './form/user';
import { COUNTRIES } from '../assets/countryCode';

const router = Router();

router.get('/duplicate', async (req, res, next) => {
  try {
    const db = admin.firestore();

    const userCollectionSnapshot = await db.collection('User').get();

    const batch = db.batch();

    userCollectionSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userDevRef = db.collection('UserDev').doc(doc.id);

      batch.set(userDevRef, userData);
    });

    await batch.commit();

    console.log('User 컬렉션이 UserDev 컬렉션으로 성공적으로 복제되었습니다.');
  } catch (error) {
    console.error('복제 중 오류 발생:', error);
  }
});

router.get('/joe', async (req, res, next) => {
  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    const allSnapshot = await db.collection('User').get();

    const kakaoUsers: User[] = [];
    const googleUsers: User[] = [];
    const emailUsers: User[] = [];
    const elseUsers: User[] = [];

    allSnapshot.forEach((docs) => {
      const v = docs.data();
      if (!v.uid) return;

      if (v.social === 'kakao') {
        const data: User = {
          uid: v.uid,
          social: 'kakao',
          email: v.email || '',
          userName: v.userName || '',
          countryCodeText: COUNTRIES.find((v) => v.phoneCode === v.countryCode)?.countryCode || 'KR',
          countryCode: v.countryCode || '82',
          phone: v.phone || '',
          avatar: '',
          information: '',
          survey: {
            referrer: 'old_user',
            refEtcText: '',
          },
          status: 'general',
          projects: [],
          history: {
            ip: '',
            useragent: '',
            country: '',
            date: null,
          },
          paymentStatus: {
            paid: true,
            billingKey: true,
          },
          alarmStatus: {
            email: v.agreeEmail || false,
            kakao: v.agreeKakao || false,
            marketing: v.agreeMarketing || false,
          },
          terms: {
            termC_1: true,
            termC_2: true,
          },
          createdAt: v.createdAt ?? now,
          updatedAt: now,
        };

        kakaoUsers.push(data);
      } else if (v.social === 'google') {
        const data: User = {
          uid: v.uid,
          social: v.social,
          email: v.email,
          userName: v.userName || '',
          countryCodeText: COUNTRIES.find((v) => v.phoneCode === v.countryCode)?.countryCode || 'KR',
          countryCode: v.countryCode || '82',
          phone: v.phone || '',
          avatar: '',
          information: '',
          survey: {
            referrer: 'old_user',
            refEtcText: '',
          },
          status: 'general',
          projects: [],
          history: {
            ip: '',
            useragent: '',
            country: '',
            date: null,
          },
          paymentStatus: {
            paid: true,
            billingKey: true,
          },
          alarmStatus: {
            email: v.agreeEmail || false,
            kakao: v.agreeKakao || false,
            marketing: v.agreeMarketing || false,
          },
          terms: {
            termC_1: true,
            termC_2: true,
          },
          createdAt: v.createdAt ?? now,
          updatedAt: now,
        };
        googleUsers.push(data);
      } else if (v.social === 'email') {
        const data: User = {
          uid: v.uid,
          social: 'email',
          email: v.email,
          userName: v.userName || '',
          countryCodeText: COUNTRIES.find((v) => v.phoneCode === v.countryCode)?.countryCode || 'KR',
          countryCode: v.countryCode || '82',
          phone: v.phone || '',
          avatar: '',
          information: '',
          survey: {
            referrer: 'old_user',
            refEtcText: 'test_old_user',
          },
          status: 'general',
          projects: v.projects || [],
          history: {
            ip: '',
            useragent: '',
            country: '',
            date: null,
          },
          paymentStatus: {
            paid: v.isPaid ?? false,
            billingKey: v.isBillingKey ?? false,
          },
          alarmStatus: {
            email: false,
            kakao: false,
            marketing: false,
          },
          terms: {
            termC_1: true,
            termC_2: true,
          },
          createdAt: v.createdAt ?? now,
          updatedAt: now,
        };
        emailUsers.push(data);
      } else {
        const data: User = {
          uid: v.uid,
          social: 'email',
          email: v.email,
          userName: v.userName || '',
          countryCodeText: COUNTRIES.find((v) => v.phoneCode === v.countryCode)?.countryCode || 'KR',
          countryCode: v.countryCode || '82',
          phone: v.phone || '',
          avatar: '',
          information: '',
          survey: {
            referrer: 'old_user',
            refEtcText: '',
          },
          status: 'general',
          projects: [],
          history: {
            ip: '',
            useragent: '',
            country: '',
            date: null,
          },
          paymentStatus: {
            paid: true,
            billingKey: true,
          },
          alarmStatus: {
            email: v.agreeEmail || false,
            kakao: v.agreeKakao || false,
            marketing: v.agreeMarketing || false,
          },
          terms: {
            termC_1: true,
            termC_2: true,
          },
          createdAt: v.createdAt ?? now,
          updatedAt: now,
        };
        elseUsers.push(data);
      }
    });

    const allCombinedUser: User[] = [...kakaoUsers, ...emailUsers, ...googleUsers, ...elseUsers];

    let batch = db.batch();

    // allCombinedUser.forEach((user) => {
    //   const projectRef = db.collection('Project').doc();
    //   const designRef = db.collection('ProjectDesign').doc();
    //   const sectionRef = designRef.collection('Section').doc();
    //
    //   batch.set(projectRef, {
    //     id: projectRef.id,
    //     title: '',
    //     projectUrl: user.uid,
    //     subscriptionModel: '',
    //     tier: '',
    //     exhibitionLimit: 100,
    //     assignedExhibitionCount: 0,
    //     currentExhibitionCount: 0,
    //     adminExhibitionCount: 0,
    //     expiredAt: null,
    //     createdAt: now,
    //     updatedAt: now,
    //   });
    //
    //   user.projects.push({
    //     id: projectRef.id,
    //     status: 'owner',
    //   });
    //
    //   batch.set(designRef, {
    //     id: projectRef.id,
    //     title: '',
    //     description: '',
    //     logoUrl: '',
    //     faviconUrl: '',
    //     ogUrl: '',
    //     // bannerUrl: '',
    //     footer: {
    //       company: '',
    //       copyright: '',
    //     },
    //     blog: '',
    //     instagram: '',
    //     facebook: '',
    //     homepage: '',
    //     theme: {
    //       primary: '',
    //       secondary: '',
    //     },
    //     createdAt: now,
    //     updatedAt: now,
    //   });
    //
    //   batch.set(sectionRef, {
    //     id: sectionRef.id,
    //     projectId: projectRef.id,
    //     order: 0,
    //     type: 'BANNER',
    //     desktop: {
    //       url: '',
    //       height: '',
    //     },
    //     hasMobile: false,
    //     mobile: {
    //       url: '',
    //       height: '',
    //     },
    //     hasLink: false,
    //     linkUrl: '',
    //     isDeleted: false,
    //     createdAt: now,
    //     updatedAt: now,
    //   });
    // });
    //

    // userCollectionSnapshot.forEach(doc => {
    //   const userData = doc.data();
    //   const userDevRef = db.collection('UserDev').doc(doc.id);
    //
    //   batch.set(userDevRef, userData);
    // });
    //
    const BATCH_SIZE = 500;
    let operationCounter = 0;

    for (const user of allCombinedUser) {
      const index = allCombinedUser.indexOf(user);
      const userRef = db.collection('User').doc(user.uid!);
      batch.set(userRef, user, { merge: true });

      operationCounter++;

      if (operationCounter === BATCH_SIZE || index === allCombinedUser.length - 1) {
        await batch.commit();
        operationCounter = 0;
        batch = db.batch();
      }
    }
  } catch (e) {
    console.error('Combine : ', e);
    return next(e);
  }
});

//TODO. Exhibition schema Update
router.get('/exhibitions', async (req, res, next) => {
  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    const allSnapshot = await db.collection('Exhibition').get();

    const allCombined: any[] = [];

    allSnapshot.forEach((docs) => {
      const v = docs.data();

      const data = {
        id: v.id,
        owner: v.owner,
        projectType: '',
        projectId: '',
        cloudData: {
          id: '',
          status: 'PUBLISH_APPROVED',
          publishedAt: now,
          updatedAt: now,
          rejection: '',
        },
        createdAt: v.createdAt,
        expiredAt: null,
        paidAt: now,
        isDeleted: false,
        compressedPosterImage: {
          path: '',
          url: '',
        },
        originalPosterImage: {
          path: '',
          url: '',
        },
        thumbnailPosterImage: {
          path: '',
          url: '',
        },
        space: null,
        title: v.title,
        author: v.author || v.owner,
        description: v.description || '',
        plan: 'free',
        isPrivate: false,
        defaultGlobalOptions: {
          BGMButton: false,
          chatButton: false,
          infoButton: false,
        },
        editOptions: {
          isFixedAngle: false,
        },
        effectFXAA: false,
        hasLikeButton: false,
        hasLinkButton: false,
        hasMenuButton: false,
        hasObjectChat: false,
        hasSize: false,
        hasTitle: false,
        hasView: false,
        isPlatform: false,
        isPreviewAllowed: false,
        like: 0,
        musicId: '',
        musicTitle: '',
        stagePlan: '',
        views: { totalView: 0, todayView: 0 },
        objectLikeNum: 0,
        todayVisitedIP: [],
        status: 'PUBLISH_APPROVED',
        publishedAt: null,
        updatedAt: null,
        rejection: '',
      };

      allCombined.push(data);
    });

    let batch = db.batch();

    const BATCH_SIZE = 500;
    let operationCounter = 0;

    for (const exhibition of allCombined) {
      const index = allCombined.indexOf(exhibition);
      const exhibitionRef = db.collection('Exhibition').doc(exhibition.id!);
      batch.set(exhibitionRef, exhibition, { merge: true });

      operationCounter++;

      if (operationCounter === BATCH_SIZE || index === allCombined.length - 1) {
        await batch.commit();
        operationCounter = 0;
        batch = db.batch();
      }
    }
  } catch (e) {
    console.error('Combine Exhibition : ', e);
    return next(e);
  }
});

//TODO. Client -> Project 데이터 복제 및 병합 처리
router.get('/projects', async (req, res, next) => {
  try {
    const db = admin.firestore();
    const now = Timestamp.now();

    const allSnapshot = await db.collection('Client').get();

    const combined: any[] = [];

    for (const doc of allSnapshot.docs) {
      const v = doc.data();
      const clientDocs = db.collection('Client').doc(v.id);

      const newProjectData = {
        id: v.id,
        title: v.title,
        projectUrl: '',
        tier: 'free',
        exhibitionLimit: 0,
        assignedExhibitionCount: 0,
        currentExhibitionCount: 0,
        expiredAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        config: {
          adminMaxCount: 3,
          isAutoApproved: false,
          initialAssignedCount: 1,
        },
      };

      combined.push(newProjectData);

      const collections = ['User', 'CommentLog', 'LikeLog', 'ViewLog', 'Space'];
      const promises = collections.map((col) => clientDocs.collection(col).get());

      const [userSnap, commentSnap, likeSnap, viewSnap, spaceSnap] = await Promise.all(promises);

      const snapshots = { userSnap, commentSnap, likeSnap, viewSnap, spaceSnap };

      for (const snapshot of Object.values(snapshots)) {
        if (!snapshot.empty) {
        }
      }
    }

    let batch = db.batch();

    const BATCH_SIZE = 500;
    let operationCounter = 0;

    for (const project of combined) {
      const index = combined.indexOf(project);
      const projectRef = db.collection('Project').doc(project.id!);
      batch.set(projectRef, project, { merge: true });

      operationCounter++;

      if (operationCounter === BATCH_SIZE || index === combined.length - 1) {
        await batch.commit();
        operationCounter = 0;
        batch = db.batch();
      }
    }
  } catch (e) {
    console.error('Combine Project : ', e);
    return next(e);
  }
});

export default router;
