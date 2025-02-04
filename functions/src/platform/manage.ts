import { Router } from 'express';
import * as admin from 'firebase-admin';
import { ApiResponse } from '../common/form/api';
import { sendTemplate } from '../utils/template';
import { User } from './form/user';

const router = Router();

// 유처 초대 API
// 초대는 이메일로만 가능

router.post('/invite-admin', async (req, res, next) => {
  try {
    const { projectId, projectUrl, receivers } = req.body;

    if (!projectId || !projectUrl || receivers.length === 0) {
      return res.status(400).send(new ApiResponse().denied('Request Error.'));
    }

    const db = admin.firestore();

    const projectSnapshot = await db.collection('Project')
      .doc(projectId)
      .get();

    const { config: projectConfig, title: projectTitle } = projectSnapshot.data()!;

    const existingEmails: string[] = [];

    for (const email of receivers as string[]) {
      const userRef = db.collection('User');

      const userSnapshot = await userRef
        .where('email', '==', email)
        .limit(1).get();

      if (!userSnapshot.empty) { // 데이터 업데이트 처리
        for (const userData of userSnapshot.docs) {
          const v = userData.data();
          const projects = v.projects || [];

          const isExist = projects.some((project: any) => project.id === projectId);
          if (isExist) {
            existingEmails.push(email);
          } else {
            projects.push({ id: projectId, status: 'admin' });
            await userRef.doc(v.uid).update({ projects: projects });
          }
        }
      } else { // 데이터를 추가
        const userDocRef = userRef.doc();

        const inviteAdminUser = User.inviteStatusUser(
          userDocRef.id,
          projectId,
          email,
          'admin',
          projectConfig.initialAssignedCount || 0
        );

        await userDocRef.set({ ...inviteAdminUser });
      }
    }

    console.log('exist : ', existingEmails);

    const filteredReceivers: string[] = receivers.filter((email: string) => !existingEmails.includes(email));

    console.log('filter : ', filteredReceivers);

    const sendPromises = filteredReceivers.map(async email => {
      const signPath = '/account/sign-up';
      await sendTemplate(email, projectUrl, projectTitle, 'user', signPath);
    });

    await Promise.all(sendPromises);

    return res.status(200).send(new ApiResponse().success({ failedEmails: existingEmails })
    );
  } catch (e) {
    console.error('Invite Admin : ', e);
    return next(e);
  }
});

router.post('/invite-user', async (req, res, next) => {
  try {
    const { projectId, projectUrl, receivers } = req.body;

    const db = admin.firestore();
    const projectSnapshot = await db.collection('Project')
      .doc(projectId)
      .get();

    const { config: projectConfig, title: projectTitle } = projectSnapshot.data()!;

    const existingEmails: string[] = [];

    for (const email of receivers as string[]) {
      const userRef = db.collection('Project').doc(projectId)
        .collection('User');

      const userSnapshot = await userRef
        .where('email', '==', email)
        .limit(1).get();

      if (!userSnapshot.empty) { // 이미 있는경우 제거
        existingEmails.push(email);
      } else { // 데이터를 추가
        const userDocRef = userRef.doc();

        const inviteAdminUser = User.inviteStatusUser(
          userDocRef.id,
          projectId,
          email,
          'user',
          projectConfig.initialAssignedCount || 0
        );

        await userDocRef.set({ ...inviteAdminUser });
      }
    }

    console.log('exist projectUser : ', existingEmails);

    const filteredReceivers: string[] = receivers.filter((email: string) => !existingEmails.includes(email));

    console.log('filter projectUser : ', filteredReceivers);

    const sendPromises = filteredReceivers.map(async email => {
      const signPath = `/${projectUrl}/account/sign-up`;
      await sendTemplate(email, projectUrl, projectTitle, 'user', signPath);
    });

    await Promise.all(sendPromises);

    return res.status(200).send(new ApiResponse().success({ failedEmails: existingEmails })
    );
  } catch (e) {
    console.error('Invite User : ', e);
    return next(e);
  }
});

// router.patch('/resend-user', async (req, res, next) => {
//   try {
//     const { projectId, receiver } = req.body;

//     if (!projectId || !receiver) {
//       return res.status(400).send(new ApiResponse().failed('projectId and receiver are required'));
//     }

//     const db = admin.firestore();
//     const snapshot = await db
//       .collection('Project')
//       .doc(projectId)
//       .collection('User')
//       .where('email', '==', receiver)
//       .get();

//     if (snapshot.empty) {
//       return res.status(400).send(new ApiResponse().failed('Receiver does not exist'));
//     }

//     const newExpiryTime = new Date();
//     newExpiryTime.setMinutes(newExpiryTime.getMinutes() + 10);

//     const updatePromises = snapshot.docs.map((doc) => doc.ref.update({ expiredAt: newExpiryTime }));

//     await Promise.all(updatePromises);

//     const projectSnapshot = await db.collection('Project').doc(projectId).get();
//     const projectTitle = projectSnapshot.data()!.title;

//     await sendTemplate(receiver, projectId, projectTitle, 'user');

//     return res.status(200).send(new ApiResponse().success({}));
//   } catch (e) {
//     console.error('Resend : ', e);
//     return next(e);
//   }
// });

router.patch('/user/remove', async (req, res, next) => {
  try {
    const { uid, projectId, status } = req.body;
    const db = admin.firestore();

    if (status === 'user') {
      const projectUserSnapshot = await db
        .collection('Project')
        .doc(projectId)
        .collection('User')
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (projectUserSnapshot.empty) {
        return res.status(400).send(new ApiResponse().denied());
      }

      const projectUserDoc = projectUserSnapshot.docs[0];
      await projectUserDoc.ref.delete();
    } else if (status === 'admin') {
      const userSnapshot = await db.collection('User')
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        return res.status(400).send(new ApiResponse().denied());
      }

      const userDocRef = userSnapshot.docs[0].ref;
      const userDoc = await userDocRef.get();

      const userData = userDoc.data();
      const projects = userData!!.projects || [];
      const updatedProjects = projects.filter((project: any) => project.id !== projectId);

      await userDocRef.update({ projects: updatedProjects });
    }
    return res.status(200).send(new ApiResponse().success({}));
  } catch (e) {
    console.error('Error removing user: ', e);
    return next(e);
  }
});

router.patch('/user/set', async (req, res, next) => {
  try {
    const { uid, projectId, field, value } = req.body;

    const db = admin.firestore();
    const userRef = db.collection('Project').doc(projectId).collection('User').doc(uid);

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).send(new ApiResponse().failed('User not found'));
    }

    const updatedData = { ...userDoc.data(), [field]: value };
    await userRef.set(updatedData);

    return res.status(200).send(new ApiResponse().success({}));
  } catch (e) {
    console.error('Exhibition Count : ', e);
    return next(e);
  }
});

router.patch('/cancel-user', async (req, res, next) => {
  try {
    const { projectId, uid } = req.body;

    if (!projectId || !uid) {
      return res.status(400).send(new ApiResponse().failed('projectId and uid are required'));
    }

    const db = admin.firestore();
    const userDocRef = db.collection('Project').doc(projectId).collection('User').doc(uid);

    await userDocRef.delete();

    return res.status(200).send(new ApiResponse().success({}));
  } catch (e) {
    console.error('Cancel : ', e);
    return next(e);
  }
});

router.get('/:projectId/users', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status } = req.query;

    const db = admin.firestore();
    const users: User[] = [];
    const adminRef = db.collection('User').where('projects', 'array-contains', { id: projectId, status: 'admin' });
    const userRef = db.collection('Project').doc(projectId).collection('User');

    if (status === 'admin') {
      const snapshot = await adminRef.get();
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          users.push(doc.data() as User);
        });
      }
    } else if (status === 'user') {
      const snapshot = await userRef.get();
      if (!snapshot.empty) {
        snapshot.docs.forEach((doc) => {
          users.push(doc.data() as User);
        });
      }
    } else if (status === 'allUser') {
      await Promise.all([userRef.get(), adminRef.get()]).then((values) => {
        values.forEach((snapshot) => {
          if (!snapshot.empty) {
            snapshot.docs.forEach((doc) => {
              users.push(doc.data() as User);
            });
          }
        });
      });
    }
    return res.status(200).send(new ApiResponse().success(users));
  } catch (e) {
    console.error('Get Project Users : ', e);
    return next(e);
  }
});

router.get('/getProjectByProjectUrl/:projectUrl', async (req, res, next) => {
  try {
    const { projectUrl } = req.params;

    const db = admin.firestore();
    const snapshot = await db.collection('Project').where('projectUrl', '==', projectUrl).limit(1).get();

    if (snapshot.empty) {
      return res.status(400).send(new ApiResponse().failed('Not Exists'));
    }

    return res.status(200).send(new ApiResponse().success({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id }));
  } catch (e) {
    console.error('Get Project Data : ', e);
    return next(e);
  }
});

router.get('/getProjectById/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const db = admin.firestore();
    const snapshot = await db.collection('Project').doc(projectId).get();

    if (!snapshot.exists) {
      return res.status(400).send(new ApiResponse().failed('Not Exists'));
    }

    return res.status(200).send(new ApiResponse().success(snapshot.data()));
  } catch (e) {
    console.error('Get Project Data : ', e);
    return next(e);
  }
});

router.get('/getOrderByProjectId/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const db = admin.firestore();
    const snapshot = await db
      .collection('Order')
      .where('projectId', '==', projectId)
      .where('status', '==', 'reserved')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(400).send(new ApiResponse().failed('Not Exists'));
    }

    return res.status(200).send(new ApiResponse().success(snapshot.docs[0].data()));
  } catch (e) {
    console.error('Get Order by project id : ', e);
    return next(e);
  }
});

export default router;
