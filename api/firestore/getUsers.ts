import { db } from '@/lib/firebase';
import { collectionGroup, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

// 유저정보 가져오기
export async function getUserInfo(uid: string) {
  try {
    const q = query(collectionGroup(db, 'User'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    let user;
    querySnapshot.forEach((doc) => {
      user = doc.data();
    });
    return user;
  } catch (e) {
    console.log('Get ExhibitionList Error : ', e);
  }
}

// updateUser
export async function updateCurrentUser(uid: string, status: string, data: any) {
  try {
    if (status === 'owner' || status === 'admin') {
      const docRef = doc(db, 'User', uid);
      await updateDoc(docRef, data);
    } else {
      // project user update
      const q = query(collectionGroup(db, 'User'), where('uid', '==', uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((_doc) => {
        const docRef = doc(db, 'User', _doc.id);
        updateDoc(docRef, data);
      });
    }
  } catch (e) {
    console.log('Update User Error : ', e);
  }
}
