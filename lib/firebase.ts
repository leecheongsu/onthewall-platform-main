import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';
import 'firebase/storage';
import 'firebase/analytics';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, StorageReference } from 'firebase/storage';
import { firebaseConfig } from '@/config';
import { getAuth } from '@firebase/auth';

const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp, 'gs://gd-virtual-staging.appspot.com');

export const auth = getAuth(firebaseApp);

export type { StorageReference };

export {
  storageRef, // storage의 ref 메서드를 storageRef로 명시적으로 export 합니다.
  uploadBytes,
  getDownloadURL,
};

export default firebaseApp;
