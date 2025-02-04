import { Router } from 'express';
import * as admin from 'firebase-admin';
import { ApiResponse } from '../common/form/api';
import { User } from './form/user';
import { sendTemplateForJoin } from '../utils/template';
import { Timestamp } from 'firebase-admin/firestore';

const router = Router();

router.post('/join/admin', async (req, res, next) => {
  try {
    const { email, password, channelName } = req.body;

    const auth = admin.auth();
    const db = admin.firestore();

    const userPromise = db.collection('User').where('channelName', '==', channelName).get();
    const projectPromise = db.collection('Project').where('channelName', '==', channelName).get();
    const [userSnapshot, projectSnapshot] = await Promise.all([userPromise, projectPromise]);

    if (!userSnapshot.empty || !projectSnapshot.empty) {
      return res.status(404).send(new ApiResponse().failed('Already Use ChannelName'));
    }

    // 회원가입
    const userRecord = await auth.createUser({
      email: email,
      password: password,
    });

    const adminSnapshot = await db.collection('User').where('email', '==', email).limit(1).get();

    if (adminSnapshot.empty) {
      throw new Error('User not found after creation');
    }

    const adminData = adminSnapshot.docs[0].data();
    const userId = userRecord.uid;

    // User
    const { userName, terms, countryCodeText, phone, marketing } = req.body;
    const user = User.createAdmin(
      userId,
      userName,
      email,
      'email',
      terms,
      marketing,
      countryCodeText,
      phone,
      adminData.survey.referrer,
      adminData.survey.refEtcText,
      channelName,
      adminData.projects,
      adminData.assignedCount
    );

    // Project
    const project = {
      ownerId: userId,
      title: '',
      projectUrl: '',
      subscriptionModel: '',
      tier: '',
      exhibitionLimit: 0,
      assignedExhibitionCount: 0,
      currentExhibitionCount: 0,
      adminExhibitionCount: 0,
      commentCount: 0,
      viewCount: 0,
      likeCount: 0,
      status: 'activated',
      expiredAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      channelName: channelName,
      config: {
        adminMaxCount: 3,
        isAutoApproved: false,
        initialAssignedCount: 3,
      },
    };

    const projectRef = await db.collection('Project').add(project);
    await projectRef.update({ id: projectRef.id });

    // ProjectDesign
    const projectDesign = {
      id: projectRef.id,
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
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
          },
          mobile: {
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
          },
        },
        thumbnail:
          'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
        description: '',
        information: '',
        x: '',
        instagram: '',
        shop: '',
        homepage: '',
        blog: '',
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const projectDesignPromise = db.collection('ProjectDesign').doc(projectRef.id).set(projectDesign);

    // Section
    const sections = [
      {
        projectId: projectRef.id,
        order: 0,
        type: 'BLANK',
        desktop: {
          url: '',
          height: '',
        },

        hasMobile: false,
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        projectId: projectRef.id,
        order: 1,
        type: 'BANNER',
        desktop: {
          url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
          height: '',
        },
        hasMobile: false,
        mobile: {
          url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
          height: '',
        },
        hasLink: false,
        linkUrl: '',
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        projectId: projectRef.id,
        order: 2,
        type: 'BLANK',
        desktop: {
          url: '',
          height: '',
        },
        hasMobile: false,
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    const sectionPromises = sections.map(async (section) => {
      const docRef = db.collection('ProjectDesign').doc(projectRef.id).collection('Section').doc();
      const id = docRef.id;
      await docRef.set({ ...section, id });
      return id;
    });

    const inviteDataDeletePromise = db.collection('User').doc(adminData.uid).delete();

    const userUpdate = db
      .collection('User')
      .doc(userId)
      .set({ ...user });

    await Promise.all([projectDesignPromise, ...sectionPromises, inviteDataDeletePromise, userUpdate]);

    await sendTemplateForJoin(user.userName, email);

    return res.status(200).send(new ApiResponse().success({ ...user }));
  } catch (e) {
    console.error('Join Admin : ', e);
    return next(e);
  }
});

router.post('/join', async (req, res, next) => {
  try {
    const { email, password, channelName, social } = req.body;

    const auth = admin.auth();
    const db = admin.firestore();

    try {
      // 이메일 중복 체크 (kakao 등에서 현재 기준 확인 안될 수 있어서 코드 수정)
      // const exist = await auth.getUserByEmail(email);
      const docs = await db.collection('User').where('email', '==', email).get();
      if (docs.size > 0) {
        return res.status(400).send(new ApiResponse().failed('Email already in use'));
      }
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') {
        throw e;
      }
    }

    // channel name 중복 체크
    const userPromise = db.collection('User').where('channelName', '==', channelName).get();
    const projectPromise = db.collection('Project').where('channelName', '==', channelName).get();
    const [userSnapshot, projectSnapshot] = await Promise.all([userPromise, projectPromise]);

    if (!userSnapshot.empty || !projectSnapshot.empty) {
      return res.status(404).send(new ApiResponse().failed('Already Use ChannelName'));
    }

    // 회원가입
    let userRecord;

    if (social === 'google') {
      // 구글 인경우 Authentication 할때 데이터가 Insert됨.
      userRecord = await auth.getUserByEmail(email);
    } else {
      userRecord = await auth.createUser({
        email: email,
        password: password,
      });
    }

    const project = {
      ownerId: userRecord.uid,
      title: '',
      projectUrl: '',
      subscriptionModel: '',
      tier: '',
      exhibitionLimit: 0,
      assignedExhibitionCount: 0,
      currentExhibitionCount: 0,
      adminExhibitionCount: 0,
      commentCount: 0,
      viewCount: 0,
      likeCount: 0,
      status: 'activated',
      expiredAt: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      channelName: channelName,
      config: {
        adminMaxCount: 3,
        isAutoApproved: false,
        initialAssignedCount: 3,
      },
    };

    const projectRef = await db.collection('Project').add(project);

    await projectRef.update({ id: projectRef.id });

    const projects = [
      {
        id: projectRef.id,
        status: 'owner' as any,
      },
    ];

    const { userName, terms, countryCodeText, phone, referrer, refEtcText, marketing } = req.body;
    const user = User.createUser(
      userRecord.uid,
      userName,
      email,
      social,
      terms,
      marketing,
      countryCodeText,
      phone,
      referrer,
      refEtcText,
      channelName,
      projects
    );

    const projectDesign = {
      id: projectRef.id,
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
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
          },
          mobile: {
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
          },
        },
        thumbnail:
          'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
        description: '',
        information: '',
        x: '',
        instagram: '',
        shop: '',
        homepage: '',
        blog: '',
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const projectDesignPromise = db.collection('ProjectDesign').doc(projectRef.id).set(projectDesign);

    //section
    const sections = [
      {
        projectId: projectRef.id,
        order: 0,
        type: 'BLANK',
        desktop: {
          url: '',
          height: '',
        },

        hasMobile: false,
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        projectId: projectRef.id,
        order: 1,
        type: 'BANNER',
        desktop: {
          url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
          height: '',
        },
        hasMobile: false,
        mobile: {
          url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
          height: '',
        },
        hasLink: false,
        linkUrl: '',
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        projectId: projectRef.id,
        order: 2,
        type: 'BLANK',
        desktop: {
          url: '',
          height: '',
        },
        hasMobile: false,
        isDeleted: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    const sectionPromises = sections.map(async (section) => {
      const docRef = db.collection('ProjectDesign').doc(projectRef.id).collection('Section').doc();
      const id = docRef.id;
      await docRef.set({ ...section, id });
      return id;
    });

    const userInsert = db
      .collection('User')
      .doc(userRecord.uid)
      .set({ ...user });

    await Promise.all([projectDesignPromise, ...sectionPromises, userInsert]);
    await sendTemplateForJoin(user.userName, email);
    return res.status(200).send(new ApiResponse().success({ ...user }));
  } catch (e) {
    console.error('Join : ', e);
    return next(e);
  }
});

router.post('/find-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    const db = admin.firestore();

    // owner가 여기서 찾는 경우
    const snap = await db.collection('User').where('email', '==', email).limit(1).get();
    let social;
    snap.forEach((doc) => {
      social = doc.data().social;
    });
    if (social === 'kakao' || social === 'google') {
      return res.status(400).send(new ApiResponse().denied(`Registered by ${social}`));
    } else {
      const auth = admin.auth();
      return await auth.generatePasswordResetLink(email);
    }
  } catch (e) {
    console.error('Find Password : ', e);
    return next(e);
  }
});

router.post('/valid-email', async (req, res, next) => {
  try {
    const { email } = req.body;

    const db = admin.firestore();
    const snapshot = await db.collection('User').where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.status(400).send(new ApiResponse().denied('Already Used'));
    }

    return res.status(200).send(new ApiResponse().success({}));
  } catch (e) {
    console.error('Valid Email : ', e);
    return next(e);
  }
});

export default router;
