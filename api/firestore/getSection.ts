import { db } from '@/lib/firebase';
import { getDocs, collection, doc, where, query, orderBy, updateDoc } from 'firebase/firestore';

export const getSection = async (projectId: string) => {
  try {
    const projectDesignDocRef = doc(db, 'ProjectDesign', projectId);
    const sectionCollectionRef = collection(projectDesignDocRef, 'Section');

    const sectionQuery = query(sectionCollectionRef, where('isDeleted', '==', false), orderBy('order', 'asc'));

    const sectionSnapshot = await getDocs(sectionQuery);

    return sectionSnapshot.docs.map((doc) => doc.data());
  } catch (e) {
    console.log('ProjectDesign 가져오기 오류: ', e);
    return null;
  }
};

// 섹션 삭제

export const deleteSection = async (projectId: string, sectionId: string) => {
  try {
    const projectDesignDocRef = doc(db, 'ProjectDesign', projectId);
    const sectionDocRef = doc(projectDesignDocRef, 'Section', sectionId);

    await updateDoc(sectionDocRef, {
      isDeleted: true,
    });
  } catch (e) {
    console.log('섹션 삭제 오류: ', e);
  }
};
