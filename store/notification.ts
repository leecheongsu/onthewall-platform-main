import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationData } from '@/type/Notification';

type State = {
  notifications: NotificationData[];
  projectId: string;
  uid: string;
  status: string;
};

interface Actions {
  fetchNotificationData: (uid: string) => void;
  markAsRead: (notificationId: string) => void;
}

export const useNotificationStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      notifications: [],
      projectId: '',
      uid: '',
      status: '',

      fetchNotificationData: (uid: string) => {
        // const collectionPath =
        //   status !== 'user' ? `User/${uid}/Notification` : `Project/${projectId}/User/${uid}/Notification`;

        try {
          const collectionRef = collection(db, `Notification`);
          const queryWithCondition = query(
            collectionRef,
            where('path', 'in', ['web', 'all']),
            where('isNotificationRead', '==', false),
            where('uid', '==', uid),
            orderBy('createdAt', 'desc')
          );

          const unsubscribe = onSnapshot(queryWithCondition, (snapshot) => {
            const dataList: any[] = [];
            snapshot.forEach((doc) => {
              const v = doc.data();
              dataList.push({
                id: doc.id,
                code: v.code,
                type: v.type,
                data: v.data,
                createdAt: v.createdAt,
              });
            });
            set((state) => ({
              notifications: dataList,
            }));
          });

          return () => unsubscribe();
        } catch (e) {
          console.error('Error Fetch Noti : ', e);
        }
      },

      markAsRead: async (notificationId: string) => {
        // const { uid } = get();
        // const collectionPath =
        //   status !== 'USER' ? `User/${uid}/Notification` : `Project/${projectId}/User/${uid}/Notification`;

        try {
          const docRef = doc(db, `Notification`, notificationId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            await updateDoc(docRef, {
              isNotificationRead: true,
            });
          }

          set((state) => ({
            notifications: state.notifications.filter((noti) => noti.id !== notificationId),
          }));
        } catch (e) {
          console.error('Error Noti As Read : ', e);
        }
      },
    }),
    {
      name: 'noti-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        projectId: state.projectId,
        uid: state.uid,
        status: state.status,
      }),
    }
  )
);
