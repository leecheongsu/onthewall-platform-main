import { CloudApiConfig } from '@/api/config';
import { auth, db } from '@/lib/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from '@firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { ApiResponse } from './api';
import { matchHashes, sha512 } from '@/utils/hash';

export const projectAccountApis = {
  async join(projectId: string, data: any) {
    return await CloudApiConfig({
      method: 'post',
      url: `/project/account/${projectId}/join`,
      data: data
    });
  },
  adminSignIn: async function(projectId: string, data: any) {
    try {
      const { email, password } = data;

      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (e: any) {
        throw e;
      }

      if (userCredential) {
        const userDocRef = doc(db, 'User', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          return new ApiResponse().failed('User not found');
        }
        return new ApiResponse().success({ ...userDoc.data(), isProjectUSer: false });
      } else {
        return new ApiResponse().failed('User not found')
      }
    } catch (e) {
      console.error('Project Admin Sign In : ', e);
      throw e;
    }
  },
  signIn: async function(projectId: string, data: any): Promise<any> {
    try {
      const { email, password } = data;

      const q = query(collection(doc(db, 'Project', projectId), 'User'), where('email', '==', email), limit(1));

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return new ApiResponse().failed('User not found');
      }

      const projectUser = snapshot.docs[0].data();
      const encryptedInputPwd = sha512(password);

      /**
       * NOTE. ProjectUser 최초 로그인 하는 경우 패스워드 필드 업데이트
       */
      if (!projectUser.password) {
        const userDocRef = snapshot.docs[0].ref;
        await updateDoc(userDocRef, { password: encryptedInputPwd });
        projectUser.password = encryptedInputPwd;
      }

      if (!matchHashes(encryptedInputPwd, projectUser.password)) {
        return new ApiResponse().denied('Password Incorrect');
      }

      return new ApiResponse().success({ ...projectUser, isProjectUser: true });
    } catch (e: any) {
      console.error('Project Sign In : ', e);
      throw e;
    }
  },
  async findPw(projectId: string, data: any) {
    return await CloudApiConfig({
      method: 'post',
      url: `/project/account/${projectId}/find-password`,
      data: data
    });
  },
  async renewPasswordForUser(data: any) {
    const { email } = data;
    return await sendPasswordResetEmail(auth, email);
  },
  async renewPassword(projectId: string, data: any) {
    return await CloudApiConfig({
      method: 'patch',
      url: `/project/account/${projectId}/renew-password`,
      data: data
    });
  },
  async renewNotification(projectId: string, data: any) {
    return await CloudApiConfig({
      method: 'patch',
      url: `/project/account/${projectId}/renew-notification`,
      data: data
    });
  },
  async validateEmail(projectId: string, data: any) {
    return await CloudApiConfig({
      method: 'post',
      url: `/project/account/${projectId}/valid-email`,
      data: data
    });
  },
  async validatePhone(projectId: string, countryCode: string, phone: string) {
    try {
      const usersCollectionRef = collection(db, 'Project', projectId, 'User');
      const q = query(usersCollectionRef,
        where('phone', '==', phone),
        where('countryCode', '==', countryCode),
        limit(1));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return false;
      }
      return true;
    } catch (e) {
      console.error('Validate Phone : ', e);
      return false;
    }
  }
};

export const ProjectManageApis = {
  async modifyProjectConfig(projectId: string, data: any) {
    return await CloudApiConfig({
      method: 'patch',
      url: `/project/manage/${projectId}/config/modify`,
      data: data
    });
  }
};
