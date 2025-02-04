import { db } from '@/lib/firebase';
import { getDocs, collection, where, query, doc, getDoc, increment, updateDoc, onSnapshot } from 'firebase/firestore';

export async function Project(projectId: string): Promise<Project | null> {
  try {
    const _doc = await getDoc(doc(db, 'Project', projectId));
    return { ..._doc.data(), id: _doc.id } as Project;
  } catch (e) {
    console.log('Get projects Error : ', e);
    return null;
  }
}

// Project ID로 실시간 Project 가져오기
export function getProjectRealtime(projectId: string, callback: (order: any) => void): () => void {
  try {
    const q = query(collection(db, 'Project'), where('id', '==', projectId));

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
    console.error('Get Project by project id Error: ', e);
    return () => {};
  }
}

export async function getProjectUrls(): Promise<any[] | null> {
  try {
    console.log('d');
    const query1 = query(collection(db, 'Project'));
    const snapshot = await getDocs(query1);
    const projectUrls: any[] = [];

    if (!snapshot.empty) {
      snapshot.docs.forEach((doc) => {
        if (!doc.data()) return;
        projectUrls.push(doc.data().channelName);
      });
      return projectUrls;
    } else {
      return null;
    }
  } catch (e) {
    console.log('Get project urls Error : ', e);
    return null;
  }
}

export async function getExhibitionIds() {
  try {
    console.log('c');
    const query1 = query(collection(db, 'Exhibition'));

    const snapshot = await getDocs(query1);
    const exhibitionIds: string[] = [];

    if (!snapshot.empty) {
      snapshot.docs.forEach((doc) => {
        if (!doc.data()) return;
        exhibitionIds.push(doc.id);
      });
      return exhibitionIds;
    } else {
      return null;
    }
  } catch (e) {
    console.error('Get Exhibition ids Error : ', e);
    return null;
  }
}

export async function getProjectUrl(docId: string): Promise<string> {
  try {
    const docRef = doc(db, 'Project', docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().projectUrl;
    } else {
      return '';
    }
  } catch (e) {
    console.log('Get project urls Error : ', e);
    return '';
  }
}

export async function getExhibitionUsageInfo(projectId: string) {
  const query = doc(db, 'Project', projectId);
  const docSnap = await getDoc(query);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      pageViewCount: data.pageViewCount ?? 0,
      likeCount: data.likeCount ?? 0,
      viewCount: data.viewCount ?? 0,
      assignedExhibitionCount: data.assignedExhibitionCount ?? 0,
      currentExhibitionCount: data.currentExhibitionCount ?? 0,
      exhibitionLimit: data.exhibitionLimit ?? 0,
      adminExhibitionCount: data.adminExhibitionCount ?? 0,
      tier: data.tier,
      config: data.config ?? {
        adminMaxCount: 0,
        isAutoApproved: false,
        initialAssignedCount: 3,
      },
      expiredAt: data.expiredAt,
    };
  } else {
    console.log('No such document!');
    return {
      pageViewCount: 0,
      likeCount: 0,
      viewCount: 0,
      assignedExhibitionCount: 0,
      currentExhibitionCount: 0,
      exhibitionLimit: 0,
      adminExhibitionCount: 0,
      tier: 'free',
      config: {
        adminMaxCount: 0,
        isAutoApproved: false,
        initialAssignedCount: 3,
      },
    };
  }
}

export async function updateExhibitionCount(projectId: string, tier: string) {
  const query = doc(db, 'Project', projectId);
  if (tier === 'user') {
    updateDoc(query, {
      currentExhibitionCount: increment(1),
    });
  } else {
    updateDoc(query, {
      adminExhibitionCount: increment(1),
      currentExhibitionCount: increment(1),
    });
  }
}

export async function subtractExhibitionCount(projectId: string, tier: string) {
  const query = doc(db, 'Project', projectId);
  if (tier === 'user') {
    updateDoc(query, {
      currentExhibitionCount: increment(-1),
    });
  } else {
    updateDoc(query, {
      adminExhibitionCount: increment(-1),
      currentExhibitionCount: increment(-1),
    });
  }
}

export async function updateProjectData(projectId: string, data: any) {
  try {
    const projectDocRef = doc(db, 'Project', projectId);
    updateDoc(projectDocRef, {
      ...data,
    });
    const exhibitionDocs = query(collection(db, 'Exhibition'), where('projectId', '==', projectId));
    const exhibitionSnapshot = await getDocs(exhibitionDocs);
    const promises: Promise<any>[] = [];
    exhibitionSnapshot.forEach((doc) => {
      const p = updateDoc(doc.ref, {
        projectTier: data.tier ?? doc.data().projectTier,
        projectExpiredAt: data.expiredAt ?? doc.data().projectExpiredAt,
        // 혹시 몰라서 추가함.
        plan: 'business',
        version: 2,
      });
      promises.push(p);
    });
    await Promise.all(promises);
  } catch (e) {
    console.error('Update Project Error: ', e);
    return null;
  }
}
