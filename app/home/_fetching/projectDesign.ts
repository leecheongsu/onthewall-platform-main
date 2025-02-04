import { collection, doc, getDocs, setDoc, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const insertAllProjectDesign = async () => {
  try {
    const projectSnapshot = await getDocs(collection(db, 'Project'))

    const projectDesignSnapshot = await getDocs(collection(db, 'ProjectDesign'));
    console.log('데이터 가져오기', projectDesignSnapshot.docs.length);

    let obj: any = {};
    projectDesignSnapshot.forEach(doc=>{
      obj[doc.id] = { ...doc.data(),  }
    })

    const now = Timestamp.now();

    const checkFields = (id: string, channelName: string) => {
      return {
        id: id,
        title: channelName,
        description: `${channelName} 입니다`,
        logoUrl: '',
        faviconUrl: '',
        ogUrl: '',
        footer: {
          company: '',
          copyright: ''
        },
        blog: '',
        instagram: '',
        facebook: '',
        homepage: '',
        shop: '',
        x: '',
        theme: {
          primary: '',
          secondary: ''
        },
        channelData: {
          bannerUrl: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
          thumbnail: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
          information: ''
        },
        createdAt: now,
        updatedAt: now
      };
    };

    let operationCounter = 0;

    for (const projectDoc of projectSnapshot.docs) {
      if(!obj[projectDoc.id]?.id){
        setDoc(doc(db, 'ProjectDesign', projectDoc.id), checkFields(projectDoc.id, projectDoc.data().channelName), {merge: true})

        operationCounter++;

        if (operationCounter === 200) {
          console.count('200개 업데이트 성공)');
          operationCounter = 0;
        }
      }
    }

    console.log('데이터가 업데이트되었습니다.');
  } catch (e) {
    console.error('Batch User Error : ', e);
  }
};
