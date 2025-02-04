import { auth, db } from '@/lib/firebase';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { updateOrder } from './firestore/getOrder';
import { useProjectStore } from '@/store/project';

export const adminApis = {
  async modifyProject(projectId: string, data: any) {
    const { i18n, t } = useTranslation();
    const { fetchProjectDataById } = useProjectStore((state) => state);
    try {
      const projectRef = doc(db, 'Project', projectId);

      const projectSnapshot = await getDoc(projectRef);
      if (!projectSnapshot.exists()) {
        console.error('Project does not exist.');
        return false;
      }

      await updateDoc(projectRef, data);

      // 예약된 Order 있을 시 취소
      const orderQuery = query(
        collection(db, 'Order'),
        where('projectId', '==', projectId),
        where('status', '==', 'reserved'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const orderSnapshot = await getDocs(orderQuery);
      if (!orderSnapshot.empty) {
        const orderDoc = orderSnapshot.docs[0];
        const projectDoc = projectSnapshot.data();

        // cancel subscription
        await axios
          .post('https://us-central1-gd-virtual-staging.cloudfunctions.net/payScheduleCancel', {
            customer_uid: projectDoc.ownerId,
            merchant_uid: orderDoc.id,
          })
          .then(async (res) => {
            if (res.data.status !== 'success') {
              alert(t('Failed to cancel subscription.\n') + res.data.message);
            } else {
              alert(t('Subscription cancelled successfully.'));
              fetchProjectDataById(projectId);
            }
          })
          .catch((err) => {
            console.log(err);
            if (err.response.data.status === 'cancelFail' || !err.response.data.message) {
              updateOrder(orderDoc.id, { status: 'paid' });
              alert(t('Failed to cancel subscription.\n') + err.response.data.message);
            } else {
              alert(t('Failed to cancel subscription.\n') + err);
            }
            fetchProjectDataById(projectId);
          });
      } else {
        console.log(t('There is no reserved order to cancel.'));
      }

      const exhibitionRef = collection(db, 'Exhibition');
      const eq = query(exhibitionRef, where('projectId', '==', projectId));
      const exhibitionSnapshot = await getDocs(eq);

      if (!exhibitionSnapshot.empty) {
        const updateData = {
          tier: data.tier as ProjectTier,
          expiredAt: data.expiredAt,
        };

        exhibitionSnapshot.forEach(async (exhibitionDoc) => {
          const exhibitionDocRef = doc(db, 'Exhibition', exhibitionDoc.id); // 각 전시 문서 참조
          await updateDoc(exhibitionDocRef, updateData);
        });
      }
      return true;
    } catch (e) {
      console.error('Modify Project Error : ', e);
      return false;
    }
  },
};
