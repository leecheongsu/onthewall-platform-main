import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const SEO_REST_API = {
  getAllProjectData: async () => {
    try {
      const now = Timestamp.now();

      const query1 = query(collection(db, 'Project'), where('expiredAt', '>=', now));
      const snapshot = await getDocs(query1);
      const projectData: any[] = [];

      if (snapshot.empty) return [];

      snapshot.docs.forEach((doc) => {
        const v = doc.data();
        if (!v) return;
        if (!v.projectUrl || v.projectUrl.trim() === '') return;

        projectData.push(v);
      });
      return projectData;
    } catch (e) {
      console.error('Get All ProjectData Error : ', e);
      return [];
    }
  },
  getAllExhibitionIds: async () => {
    try {
      const query1 = query(collection(db, 'Exhibition'),
        where('isDeleted', '==', false),
        where('version', '==', 2),
        where('isHidden', '==', false),
        where('status', '==', 'published')
      );

      const snapshot = await getDocs(query1);
      const exhibitionIds: string[] = [];

      if (snapshot.empty) return [];

      snapshot.docs.forEach((doc) => {
        if (!doc.data()) return;
        exhibitionIds.push(doc.id);
      });
      return exhibitionIds;
    } catch (e) {
      console.error('Get All Exhibition Ids Error : ', e);
      return [];
    }
  },
};