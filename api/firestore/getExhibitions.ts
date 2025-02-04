import { db } from '@/lib/firebase';
import { doc, getDoc, getDocs, collection, where, query, updateDoc, limit, startAfter } from 'firebase/firestore';

import axios from 'axios';

// onthewall 전시회 전부 가져오기
export async function getExhibitions() {
  try {
    const exhibitionsRef = collection(db, 'Exhibition');
    const q = query(
      exhibitionsRef,
      where('isDeleted', '==', false),
      where('version', '==', 2),
      where('views.totalView', '>=', 50),
      where('isHidden', '==', false),
      where('publishedAt', '!=', null)
    );

    const querySnapshot = await getDocs(q);
    let exhibitionData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    exhibitionData = exhibitionData.filter((exhibition: any) =>
      ['free', 'personal', 'business'].includes(exhibition.projectTier)
    );

    return exhibitionData;
  } catch (e) {
    console.error('Error fetching onthewall exhibitions:', e);
  }
}

// 프로젝트 아이디로 전시회 전부 가져오기
export async function getExhibitionListAll(projectId: string) {
  try {
    const query1 = query(
      collection(db, 'Exhibition'),
      where('isDeleted', '==', false),
      where('projectId', '==', projectId)
    );

    const snapshot = await getDocs(query1);

    const exhibitions: Array<Exhibition> = [];
    snapshot.forEach((doc) => {
      exhibitions.push({ ...doc.data(), id: doc.id } as Exhibition);
    });
    return exhibitions;
  } catch (e) {
    console.log('Get ExhibitionList Error : ', e);
  }
}

// 전시회 하나만 가져오기
export async function getExhibitionDoc(docId: string): Promise<Exhibition | null> {
  try {
    const docRef = doc(db, 'Exhibition', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id } as Exhibition;
    } else {
      return null;
    }
  } catch (e) {
    console.error('Get ExhibitionDocument Error: ', e);
    return null;
  }
}

// 선택한 전시회 삭제하기
export const deleteExhibition = async (id: string) => {
  try {
    const docRef = doc(db, 'Exhibition', id);
    await updateDoc(docRef, {
      isDeleted: true,
    });
  } catch (e) {
    console.error('Get ExhibitionDocument Error: ', e);
    return null;
  }
};

// 어드민일 때 모든 전시 가져오기 (그룹전시 추가용)
export async function getAdminExhibitionListAll() {
  try {
    const query1 = query(collection(db, 'Exhibition'), where('isDeleted', '==', false));

    const snapshot = await getDocs(query1);

    const res: any = [];
    snapshot.forEach((doc) => {
      res.push({ ...doc.data(), id: doc.id });
    });
    return res;
  } catch (e) {
    console.log('Get ExhibitionList Error : ', e);
  }
}

// 프로젝트 정보 업데이트
export async function updateExhibitionByProjectId(projectId: string, data: any) {
  try {
    const query1 = query(collection(db, 'Exhibition'), where('projectId', '==', projectId));
    const snapshot = await getDocs(query1);

    const updatePromises: Promise<void>[] = [];

    snapshot.forEach((doc) => {
      const updatePromise = updateDoc(doc.ref, data);
      updatePromises.push(updatePromise);
    });

    // 모든 업데이트가 완료될 때까지 기다림
    await Promise.all(updatePromises);

    console.log('All exhibitions updated successfully.');
  } catch (e) {
    console.log('Update Exhibition Error : ', e);
  }
}

// 프로젝트 정보 업데이트(uid)
export async function updateExhibitionByUid(uid: string, data: any) {
  try {
    const query1 = query(collection(db, 'Exhibition'), where('uid', '==', uid));
    const snapshot = await getDocs(query1);

    const updatePromises: Promise<void>[] = [];

    snapshot.forEach((doc) => {
      const updatePromise = updateDoc(doc.ref, data);
      updatePromises.push(updatePromise);
    });

    // 모든 업데이트가 완료될 때까지 기다림
    await Promise.all(updatePromises);

    console.log('All exhibitions updated successfully.');
  } catch (e) {
    console.log('Update Exhibition Error : ', e);
  }
}
