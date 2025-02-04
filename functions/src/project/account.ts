import { Router } from 'express';
import * as admin from 'firebase-admin';
import { ApiResponse } from '../common/form/api';
import { sendTemplateForFindPw, sendTemplateForJoin } from '../utils/template';
import { User } from '../platform/form/user';
import { sha512 } from '../utils/hash';
import { Timestamp } from 'firebase-admin/firestore';

const ShortUniqueId = require('short-unique-id');

const router = Router();

router.post('/:projectId/join', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email, password } = req.body;

    const db = admin.firestore();

    const projectSnapshot = await db.collection('Project').doc(projectId).get();

    if (!projectSnapshot.exists) {
      return res.status(400).send(new ApiResponse().failed('Project does not exists.'));
    }

    const projectConfig = projectSnapshot.data()!.config;

    const query = db.collection('Project').doc(projectId).collection('User');

    const { userName, social, terms, countryCodeText, phone } = req.body;

    const project = {
      id: projectId,
      status: 'user'
    };

    const projectUser = User.createProjectUser(
      userName,
      email,
      social,
      countryCodeText,
      phone,
      terms,
      project as any,
      password,
      projectConfig.initialAssignedCount
    );
    projectUser.password = sha512(password);

    const now = Timestamp.now();
    const docRef = await query.add({
      ...projectUser,
      createdAt: now,
      updatedAt: now
    });
    await docRef.update({ uid: docRef.id });

    await sendTemplateForJoin(projectUser.userName, email);

    const user = {
      uid: docRef.id,
      email: req.body.email
    };

    return res.status(200).send(new ApiResponse().success({ ...user }));
  } catch (e) {
    console.error('Join :', e);
    return next(e);
  }
});

router.patch('/:projectId/renew-notification', async (req, res, next) => {
  try {
    const { uid, status, type, value } = req.body;
    const { projectId } = req.params;

    console.log(req.body, projectId);

    const db = admin.firestore();

    const userRef =
      status === 'owner'
        ? db.collection('User').doc(uid)
        : db.collection('Project').doc(projectId).collection('User').doc(uid);

    if (type === 'marketing') {
      await userRef.update({
        'alarmStatus.marketing': value
      });
    } else if (type === 'email') {
      await userRef.update({
        'alarmStatus.email': value
      });
    } else if (type === 'kakao') {
      await userRef.update({
        'alarmStatus.kakao': value
      });
    } else {
      return res.status(400).send(new ApiResponse().failed('Not Exist Type'));
    }
    return res.status(200).send(new ApiResponse().success({}));
  } catch (e) {
    console.error('Renew Notification : ', e);
    return next(e);
  }
});

//프로젝트 - 일반유저 비밀번호 찾기
router.post('/:projectId/find-password', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    const db = admin.firestore();
    const snapshot = await db
      .collection('Project')
      .doc(projectId)
      .collection('User')
      .where('email', '==', email)
      .limit(1)
      .get();

    if(snapshot.empty) {
      return res.status(200).send(new ApiResponse().denied('The email account you entered does not exist.'))
    }

    const newRandomPwd = new ShortUniqueId().randomUUID(8);

    const { id: userId, email: userEmail, name: userName } = snapshot.docs[0].data();
    const userRef = db.collection('Project').doc(projectId).collection('User').doc(userId);

    await userRef.update({
      password: sha512(newRandomPwd)
    });

    await sendTemplateForFindPw(userName, userEmail, newRandomPwd);
    return res.status(200).send(new ApiResponse().success({}));
  } catch (e) {
    console.error('Find Password : ', e);
    return next(e);
  }
});

// 비밀번호 갱신
router.patch('/:projectId/renew-password', async (req, res, next) => {
  try {
    const { uid, password: newPassword } = req.body;
    const { projectId } = req.params;
    const db = admin.firestore();
    const userDoc = await db.collection('User').doc(uid).get();
    if (userDoc.exists) {
      // 일반 user
      const social = userDoc.data()!.social;
      if (social === 'kakao' || social === 'google') {
        return res.status(400).send(new ApiResponse().denied(`Registered by ${social}`));
      } else {
        const auth = admin.auth();
        await auth.updateUser(uid, {
          password: newPassword
        });
        return res.status(200).send(new ApiResponse().success({}));
      }
    } else {
      // Project user
      const projectUserSnap = await db.collection('Project').doc(projectId).collection('User').doc(uid).get();
      if (projectUserSnap.exists) {
        await projectUserSnap.ref.update({
          password: sha512(newPassword)
        });
      } else {
        return res.status(400).send(new ApiResponse().failed('User not found'));
      }

      return res.status(200).send(new ApiResponse().success({}));
    }
  } catch (e) {
    console.error('Renew Password : ', e);
    return next(e);
  }
});

router.post('/:projectId/valid-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    const { projectId } = req.params;

    const db = admin.firestore();
    const snapshot = await db.collection('Project')
      .doc(projectId)
      .collection('User')
      .where('email', '==', email)
      .get();

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
