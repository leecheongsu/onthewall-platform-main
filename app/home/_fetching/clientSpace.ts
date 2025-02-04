import {
  collection,
  doc,
  getDocs,
  query,
  Timestamp,
  writeBatch,
  updateDoc,
  getDoc,
  where,
  orderBy,
  collectionGroup,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const moveClientSpace = async (clientId: string) => {
  const projectRef = query(collection(db, 'Project'), where('projectUrl', '==', clientId));
  const projectSnapshot = await getDocs(projectRef);
  if (projectSnapshot.empty) {
    console.log('No Project');
    return;
  }

  const projectId = projectSnapshot.docs[0].id;

  console.log('get project id', projectId);

  const spaceRef = collection(db, 'Client', clientId, 'Space');
  const spaceSnapshot = await getDocs(spaceRef);
  if (spaceSnapshot.empty) {
    console.log('No Space');
    return;
  }

  console.log('get spaces', spaceSnapshot.docs.length);

  spaceSnapshot.forEach(async (spaceDoc) => {
    setDoc(
      doc(db, 'Space', spaceDoc.id),
      {
        ...spaceDoc.data(),
        projectId: projectId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    ).then(() => {
      console.log('add doc successfully: ', spaceDoc.id);
    });
  });
};
