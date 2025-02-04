import { collection, doc, getDocs, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const insertSections = async () => {
  try {
    const projectDesignSnapshot = await getDocs(collection(db, 'ProjectDesign'));
    console.log('데이터 가져오기', projectDesignSnapshot.docs.length);

    let obj: any = {};

    const now = Timestamp.now();

    const checkFields = (id: string) => {
      return [
        {
          projectId: id,
          order: 0,
          type: 'BLANK',
          desktop: {
            url: '',
            height: ''
          },

          hasMobile: false,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          projectId: id,
          order: 1,
          type: 'BANNER',
          desktop: {
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
            height: ''
          },
          hasMobile: false,
          mobile: {
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%[…]?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
            height: ''
          },
          hasLink: false,
          linkUrl: '',
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        },
        {
          projectId: id,
          order: 2,
          type: 'BLANK',
          desktop: {
            url: '',
            height: ''
          },
          hasMobile: false,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        }
      ];
    }

    let operationCounter = 0;

    for (const designDoc of projectDesignSnapshot.docs) {
      const projectId = designDoc.id;
      const sectionRef = collection(db, 'ProjectDesign', projectId, 'Section');

      const sectionsSnapshot = await getDocs(sectionRef);

      if (sectionsSnapshot.empty) {
        const sectionsData = checkFields(projectId);

        for (const section of sectionsData) {
          const sectionDocRef = doc(sectionRef);
          await setDoc(sectionDocRef, section)

          operationCounter++;

          if(operationCounter === 200) {
            console.count('200개 업데이트 성공)');
            operationCounter = 0;
          }
        }
      }
    }

    console.log('데이터가 업데이트되었습니다.');
  } catch (e) {
    console.error('Batch Error : ', e);
  }
};
