import { CloudApiConfig, ModuleApiConfig } from '@/api/config';
import { auth, db } from '@/lib/firebase';
import { sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from '@firebase/auth';
import { collection, doc, getDoc, getDocs, limit, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { ApiResponse } from './api';

export const platformAccountApis = {
  async join(data: any) {
    return await CloudApiConfig({
      method: 'post',
      url: '/platform/account/join',
      data: data
    });
  },
  async joinAdmin(data: any) {
    return await CloudApiConfig({
      method: 'post',
      url: '/platform/account/join/admin',
      data: data
    });
  },
  async signIn(data: any) {
    const { email, password } = data;

    let userCredential;

    try {
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      console.error('Sign In with Email : ', e);
      throw e;
    }

    try {
      const userDocRef = doc(db, 'User', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      if (!userData) {
        throw {
          code: 'user/no-data',
          message: 'User data not found. Please sign up to create an account.'
        };
      }

      return new ApiResponse().success({ ...userDoc.data() });

    } catch (e) {
      console.error('Sign In : ', e);
      throw e;
    }
  },
  async signOut() {
    return await signOut(auth);
  },
  async findPw(data: any) {
    try {
      const usersCollectionRef = collection(db, 'User');
      const q = query(usersCollectionRef, where('email', '==', data.email), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw {
          code: 'user/no-data',
          message: 'The email account you entered does not exist.'
        };
      }

      const userDoc = querySnapshot.docs[0];

      const userData = userDoc.data();

      const SOCIAL_TYPE = ['kakao', 'google'];

      if (SOCIAL_TYPE.includes(userData.social)) {
        throw {
          code: 'user/no-data',
          message: 'Please find your password by registered platform'
        };
      } else {
        await sendPasswordResetEmail(auth, data.email);
        return true;
      }
    } catch (e) {
      console.error('Find Password : ', e);
      throw e;
    }
  },
  async validatePhone(countryCode: string, phone: string) {
    try {
      const usersCollectionRef = collection(db, 'User');
      const q = query(usersCollectionRef,
        where('phone', '==', phone),
        where('countryCode', '==', countryCode)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return false;
      }
      return true;
    } catch (e) {
      console.error('Validate Phone : ', e);
      return false;
    }
  },
  async sendVerificationCode(phone: string) {
    return await ModuleApiConfig({
      url: '/certifyPhone',
      method: 'post',
      data: {
        phoneNum: phone
      }
    });
  },
  async validateEmail(data: any) {
    return await CloudApiConfig({
      url: '/platform/account/valid-email',
      method: 'post',
      data: data
    });
  },
  async getUser(email: string) {
    try {
      const usersCollectionRef = collection(db, 'User');
      const q = query(usersCollectionRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw {
          code: 'user/no-data',
          message: 'User data not found. Please sign up to create an account.'
        };
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      return new ApiResponse().success(userData);
    } catch (e) {
      console.error('Get User Error : ', e);
      return new ApiResponse().failed('Error retrieving user data');
    }
  },
  async validateChannelName(channelName: string) {
    try {
      const q = query(collection(db, 'User'), where('channelName', '==', channelName));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (e) {
      console.error('Validate Channel Name : ', e);
      return false;
    }
  },
  async modifyUserName(uid: string, userName: string) {
    try {
      const userRef = doc(db, 'User', uid);
      const docSnapshot = await getDoc(userRef);

      if (!docSnapshot.exists()) {
        console.log('Not Exist : ', uid);
        return false;
      }
      const now = Timestamp.now();

      await updateDoc(userRef, {
        userName: userName,
        'survey.referrer': 'old_user_name_updated',
        updatedAt: now
      });
      return true;
    } catch (e) {
      console.error('Modify Old User Name : ', e);
      return false;
    }
  },
  async modifyChannelName(uid: string, projectId: string, channelName: string) {
    try {

      const userRef = doc(db, 'User', uid);
      const docSnapshot = await getDoc(userRef);

      const { projects, survey } = docSnapshot.data() as UserInfo;

      const isProjectExist = projects.some((v) => v.id === projectId);

      if (!docSnapshot.exists() || !isProjectExist) {
        console.log('Not Exist : ', uid);
        return false;
      }

      const now = Timestamp.now();

      const projectPromise = updateDoc(doc(db, 'Project', projectId), { channelName: channelName, updatedAt: now });

      const exhibitionQuerySnapshot = await getDocs(
        query(collection(db, 'Exhibition'), where('projectId', '==', projectId), where('uid', '==', uid))
      );

      const exhibitionPromises = exhibitionQuerySnapshot.docs.map((doc) =>
        updateDoc(doc.ref, { channelName: channelName, updatedAt: now })
      );

      await Promise.all([projectPromise, exhibitionPromises]);
      return true;
    } catch (e) {
      console.error('Modify Old User Info : ', e);
      return false;
    }
  }
};

export const platformManageApis = {
  async inviteAdmin(data: any) {
    return await CloudApiConfig({
      method: 'post',
      url: '/platform/manage/invite-admin',
      data: data
    });
  },
  // async resendUser(data: any) {
  //     return await CloudApiConfig({
  //         method: 'patch',
  //         url: '/platform/manage/resend-user',
  //         data: data,
  //     });
  // },
  // async cancelUser(data: any) {
  //     return await CloudApiConfig({
  //         method: 'patch',
  //         url: '/platform/manage/cancel-user',
  //         data: data,
  //     });
  // },
  async remove(data: any) {
    return await CloudApiConfig({
      method: 'patch',
      url: '/platform/manage/user/remove',
      data: data
    });
  },
  async editUserInfo(data: any) {
    return await CloudApiConfig({
      method: 'patch',
      url: '/platform/manage/user/set',
      data: data
    });
  },
  async getProjectUsers(projectId: string, status: string = 'admin') {
    return await CloudApiConfig({
      method: 'get',
      url: `/platform/manage/${projectId}/users?status=${status}`
    });
  },
  async getProjectByProjectUrl(projectUrl: string) {
    return await CloudApiConfig({
      method: 'get',
      url: `/platform/manage/getProjectByProjectUrl/${projectUrl}`
    });
  },
  async getProjectDataById(projectId: string) {
    return await CloudApiConfig({
      method: 'get',
      url: `/platform/manage/getProjectById/${projectId}`
    });
  },
  async getOrderByProjectId(projectId: string) {
    return await CloudApiConfig({
      method: 'get',
      url: `/platform/manage/getOrderByProjectId/${projectId}`
    });
  },
  async modifyExhibition(exhibitionId: string, value: boolean) {
    try {
      const exhibitionRef = doc(db, 'Exhibition', exhibitionId);
      const docSnapshot = await getDoc(exhibitionRef);

      if (!docSnapshot.exists()) {
        console.log('Document does not exist:', exhibitionId);
        return false;
      }

      await updateDoc(exhibitionRef, { isHidden: value });
      return true;
    } catch (e) {
      console.error('Error updating document:', e);
      return false;
    }
  }
};
