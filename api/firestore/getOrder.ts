import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

// Order 실시간으로 가져오기
export function getOrderListRealtime(projectId: string, callback: (orders: any[]) => void): () => void {
  try {
    const q = query(collection(db, 'Order'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id });
      });
      callback(list); // 업데이트된 리스트를 콜백 함수로 전달
    });

    return unsubscribe; // 실시간 업데이트를 중지하려면 호출할 수 있는 unsubscribe 함수 반환
  } catch (e) {
    console.error('Get Order List Error: ', e);
    return () => {}; // 오류가 발생하면 빈 unsubscribe 함수 반환
  }
}

// Order 전부 가져오기
export async function getOrderList(projectId: string): Promise<any[] | null> {
  try {
    const q = query(collection(db, 'Order'), where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ ...doc.data(), id: doc.id });
    });
    return list;
  } catch (e) {
    console.error('Get Order List Error: ', e);
    return null;
  }
}

// Order 하나만 가져오기
export async function getOrderDoc(docId: string): Promise<any | null> {
  try {
    const docRef = doc(db, 'Order', docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { ...docSnap.data(), id: docSnap.id };
    } else {
      return null;
    }
  } catch (e) {
    console.error('Get Order Error: ', e);
    return null;
  }
}

// Project ID로 Order 가져오기(status: cancelled)
export async function getOrderByProjectId(projectId: string): Promise<any | null> {
  try {
    const q = query(
      collection(db, 'Order'),
      where('projectId', '==', projectId),
      where('status', '==', 'cancelled'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return { ...doc.data(), id: doc.id };
  } catch (e) {
    console.error('Get Order by project id Error: ', e);
    return null;
  }
}

// Project ID로 Order 가져오기(status: paid)
export async function getPaidOrderByProjectId(projectId: string): Promise<any | null> {
  try {
    const q = query(
      collection(db, 'Order'),
      where('projectId', '==', projectId),
      where('status', 'in', ['paid', 'custom']), // 'paid' 또는 'custom' 조건
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const doc = querySnapshot.docs[0];
    return { ...doc.data(), id: doc.id };
  } catch (e) {
    console.error('Get Order by project id Error: ', e);
    return null;
  }
}

// Project ID로 실시간 Order 가져오기(status: reserved)
export function getOrderByProjectIdRealtime(projectId: string, callback: (order: any) => void): () => void {
  try {
    const q = query(
      collection(db, 'Order'),
      where('projectId', '==', projectId),
      where('status', '==', 'reserved'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }
      const doc = querySnapshot.docs[0];
      callback({ ...doc.data(), id: doc.id });
    });

    return unsubscribe;
  } catch (e) {
    console.error('Get Order by project id Error: ', e);
    return () => {};
  }
}

// Order Update
export const updateOrder = async (id: string, data: any) => {
  try {
    const docRef = doc(db, 'Order', id);
    await updateDoc(docRef, {
      ...data,
    });
  } catch (e) {
    console.error('Update Order Error: ', e);
    return null;
  }
};

// Order Add
export const addOrder = async (data: any) => {
  try {
    await addDoc(collection(db, 'Order'), {
      ...data,
    }).then((docRef) => {
      updateDoc(docRef, {
        id: docRef.id,
      });
    });
  } catch (e) {
    console.error('Add Order Error: ', e);
    return null;
  }
};
