// 과거 exhibition 데이터 일괄 업데이트 로직

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
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const fetchAllExhibitions = async () => {
  const q = query(collection(db, 'Exhibition'));
  const querySnapshot = await getDocs(q);
  const beta: any[] = [];
  const ver1: any[] = [];
  const ver1_5: any[] = [];
  const ver2: any[] = [];

  const etc: any[] = [];

  const qC = query(collection(db, 'Client'));
  const clientSnapshot = await getDocs(qC);

  const clients: Client[] = [];
  clientSnapshot.forEach((doc) => clients.push(doc.data() as Client));

  const qP = query(collection(db, 'Project'));
  const projectSnapshot = await getDocs(qP);

  const projects: Project[] = [];
  projectSnapshot.forEach((doc) => projects.push(doc.data() as Project));

  console.log(querySnapshot.size / 200 + '번 실행 예정');

  querySnapshot.forEach((doc) => {
    const v = doc.data();

    const now = Timestamp.now();

    // version beta 처리
    // version beta는 isPlatform 이 null 임.
    // cloudData가 없음
    // clientId가 없음

    if (v.isPlatform == null || v.isPlatform === false) {
      beta.push({ ...v, version: 0, id: doc.id });
      // const data: Exhibition = {
      //   id: v.id,
      //   title: v.title,
      //   description: v.description,
      //   compressedPosterImage: v.compressedPosterImage,
      //   originalPosterImage: v.originalPosterImage,
      //   thumbnailPosterImage: v.thumbnailPosterImage,
      //   musicId: v.musicId,
      //   musicTitle: v.musicTitle,
      //   showcase: v.showcase,
      //   showcaseTitle: v.showcaseTitle,
      //   space: v.space,
      //   owner: v.owner,
      //   uid: v.owner, //uid 추가
      //   // projectId: v.projectId, TODO. projectId가 있는지 체크
      //   projectId: 'null',
      //   channelName: '',
      //   // cloudData:
      //   editOption: v.editOption,
      //   hasLikeButton: v.hasLikeButton,
      //   hasLinkButton: v.hasLinkButton,
      //   hasMenuButton: v.hasMenuButton,
      //   hasObjectChat: v.hasObjectChat,
      //   hasSize: v.hasSize,
      //   hasTitle: v.hasTitle,
      //   hasView: v.hasView,
      //   effectFXAA: v.effectFXAA,
      //   status: v.isEnded ? "closed" : (v.publishedAt != null ? "published" : "created"),
      //   version: 'beta',
      //   isHidden: false,
      //   isPrivate: v.isPrivate != null ? v.isPrivate : false,
      //   isDeleted: v.isDeleted,
      //   // isPlatform: false,
      //   loginIPAddress: '',
      //   loginToken: '',
      //   publishedAt: v.publishedAt != null ? v.publishedAt : null,
      //   createdAt: v.createdAt,
      //   updatedAt: now,
      //   like: v.like,
      //   commentCount: v.commentCount,
      //   objectLikeNum: v.objectLikeNum,
      //   views: v.views ?? { todayView: 0, totalView: 0 },
      //   expiredAt: null,
      //   projectExpiredAt: null
      // };
    }

      // version 1 처리
      // version 1은 isPlatform 이 true 면서
      // cloudData 가 없음
    // clientId가 없음
    else if (v.isPlatform && (v.cloudData == null || v.cloudData.clientId == null) && v.clienId == null) {
      if (!v.space) {
        console.log(1, doc.id);
      }
      const data = {
        id: doc.id,
        // title: v.title,
        // author: v.author || '',
        description: v.description || '',
        // compressedPosterImage: v.compressedPosterImage,
        // originalPosterImage: v.originalPosterImage,
        // thumbnailPosterImage: v.thumbnailPosterImage,
        // musicId: v.musicId,
        // musicTitle: v.musicTitle,
        // showcase: v.showcase,
        // showcaseTitle: v.showcaseTitle,
        // space: v.space,
        owner: v.owner || '',
        uid: v.owner || '', //uid 추가
        projectId: '', //previous 이전시 처리함
        channelName: '', //previous 이전시 처리함
        // cloudData:
        editOption: v.editOption || {
          isFixedAngle: true
        },
        // hasLikeButton: v.hasLikeButton,
        // hasLinkButton: v.hasLinkButton,
        // hasMenuButton: v.hasMenuButton,
        // hasObjectChat: v.hasObjectChat,
        // hasSize: v.hasSize,
        // hasTitle: v.hasTitle,
        // hasView: v.hasView,
        // effectFXAA: v.effectFXAA,
        status: v.isEnded ? 'closed' : v.publishedAt != null ? 'published' : 'created',
        version: 1.0,
        isHidden: false,
        isPrivate: v.isPrivate != null ? v.isPrivate : false,
        // isDeleted: v.isDeleted,
        isPlatform: true,
        loginIPAddress: v.loginIPAddress || '',
        loginToken: v.loginToken || '',
        publishedAt: v.publishedAt != null ? v.publishedAt : null,
        // createdAt: v.createdAt,
        // updatedAt: v.updatedAt,
        like: v.like || 0,
        commentCount: v.commentCount || 0,
        objectLikeNum: v.objectLikeNum || 0,
        views: v.views ?? { todayView: 0, totalView: 0 },
        expiredAt: v.expiredAt ?? null,
        projectExpiredAt: null
      };
      ver1.push(data);
    }

      // version 1.5는 isPlatform 이 true 이고
      // cloudData 가 있음
    // clientId가 없음
    else if (v.isPlatform && v.cloudData != null && v.clientId == null) {
      if (!v.space) {
        console.log(1.5, v);
      }
      const client = clients.find((client) => client.id === v.cloudData.clientId);
      const channelName = client?.title ? client.title : '';

      const data = {
        id: doc.id,
        // title: v.title,
        author: v.author || '',
        description: v.description || '',
        // compressedPosterImage: v.compressedPosterImage,
        // originalPosterImage: v.originalPosterImage,
        // thumbnailPosterImage: v.thumbnailPosterImage,
        // musicId: v.musicId,
        // musicTitle: v.musicTitle,
        // showcase: v.showcase,
        // showcaseTitle: v.showcaseTitle,
        // space: v.space,
        // owner: v.owner,
        uid: v.owner, //uid 추가
        projectId: v.cloudData.clientId,
        channelName: channelName,
        // cloudData:
        editOption: v.editOption || {
          isFixedAngle: true
        },
        // hasLikeButton: v.hasLikeButton,
        // hasLinkButton: v.hasLinkButton,
        // hasMenuButton: v.hasMenuButton,
        // hasObjectChat: v.hasObjectChat,
        // hasSize: v.hasSize,
        // hasTitle: v.hasTitle,
        // hasView: v.hasView,
        // effectFXAA: v.effectFXAA,
        status: v.isEnded ? 'closed' : v.publishedAt != null ? 'published' : 'created',
        version: 1.5,
        isHidden: v.cloudData.isHidden ?? false,
        isPrivate: v.isPrivate != null ? v.isPrivate : false,
        // isDeleted: v.isDeleted,
        isPlatform: true,
        loginIPAddress: v.loginIPAddress || '',
        loginToken: v.loginToken || '',
        publishedAt: v.publishedAt != null ? v.publishedAt : null,
        // createdAt: v.createdAt,
        // updatedAt: v.updatedAt,
        like: v.like || 0,
        commentCount: v.commentCount || 0,
        objectLikeNum: v.objectLikeNum || 0,
        views: v.views ?? { todayView: 0, totalView: 0 },
        expiredAt: v.expiredAt ?? null,
        projectExpiredAt: null
      };
      ver1_5.push(data);
    }

      // version 2 처리
      // version 2는 isPlatform 이 true 이고
      // cloudData 가 있음
    // clientId가 있음
    else if (v.isPlatform && v.cloudData != null && v.clientId != null) {
      if (!v.space) {
        console.log(2, doc.id);
      }
      const project = projects.find((project) => project.id === v.clientId);
      const channelName = project?.channelName ? project.channelName : '';

      const data = {
        id: doc.id,
        // title: v.title,
        author: v.author || '',
        description: v.description || '',
        // compressedPosterImage: v.compressedPosterImage,
        // originalPosterImage: v.originalPosterImage,
        // thumbnailPosterImage: v.thumbnailPosterImage,
        // musicId: v.musicId,
        // musicTitle: v.musicTitle,
        // showcase: v.showcase,
        // showcaseTitle: v.showcaseTitle,
        // space: v.space,
        // owner: v.owner,
        uid: v.owner, //uid 추가
        projectId: v.clientId,
        channelName: channelName,
        // cloudData:
        editOption: v.editOption || {
          isFixedAngle: true
        },
        // hasLikeButton: v.hasLikeButton,
        // hasLinkButton: v.hasLinkButton,
        // hasMenuButton: v.hasMenuButton,
        // hasObjectChat: v.hasObjectChat,
        // hasSize: v.hasSize,
        // hasTitle: v.hasTitle,
        // hasView: v.hasView,
        // effectFXAA: v.effectFXAA,
        status: v.isEnded ? 'closed' : v.publishedAt != null ? 'published' : 'created',
        version: 2.0,
        // isHidden: v.isHidden,
        isPrivate: v.isPrivate != null ? v.isPrivate : false,
        // isDeleted: v.isDeleted,
        isPlatform: true,
        loginIPAddress: v.loginIPAddress || '',
        loginToken: v.loginToken || '',
        publishedAt: v.publishedAt != null ? v.publishedAt : null,
        // createdAt: v.createdAt,
        updatedAt: now,
        like: v.like || 0,
        commentCount: v.commentCount || 0,
        objectLikeNum: v.objectLikeNum || 0,
        views: v.views ?? { todayView: 0, totalView: 0 },
        expiredAt: null,
        projectExpiredAt: null
      };
      ver2.push(data);
    } else {
      etc.push({ ...v, createdAt: v.createdAt?.toDate() ?? '' });
    }
  });

  const combined: any[] = [...beta, ...ver1, ...ver1_5, ...ver2];

  // console.log('snapshotsize', querySnapshot.size)
  // console.log('combined : ', combined.length)
  //
  // console.log(beta.length, ver1.length, ver1_5.length, ver2.length, etc.length)
  //
  // etc.forEach(v => {
  //   console.log(v)
  // })

  const BATCH_SIZE = 200;
  let operationCounter = 0;
  let batch = writeBatch(db);

  for (const [index, exhibition] of combined.entries()) {
    const docRef = doc(db, 'Exhibition', exhibition.id);

    batch.update(docRef, exhibition);

    operationCounter++;

    if (operationCounter === BATCH_SIZE || index === combined.length - 1) {
      console.log('200개 커밋');
      await batch.commit();
      console.count('200개 업데이트 성공)');
      operationCounter = 0;
      batch = writeBatch(db);
    }
  }
};

export const updateUid = async () => {
  const q = query(collection(db, 'Exhibition'));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    if (doc.data().owner && !doc.data().uid) {
      updateDoc(doc.ref, {
        uid: doc.data().owner
      });
      console.count('update');
    } else if (!doc.data().owner && doc.data().uid) {
      updateDoc(doc.ref, {
        owner: doc.data().uid
      });
      console.count('update');
    }
  });
};

export const updateExhibitions = async () => {
    try {
      const allSnapshot = await getDocs(collection(db, 'Exhibition'));

      const qC = query(collection(db, 'Client'));
      const clientSnapshot = await getDocs(qC);

      const clients: Client[] = [];
      clientSnapshot.forEach((doc) => clients.push(doc.data() as Client));

      console.log('데이터 가져오기');

      const BATCH_SIZE = 200;
      let operationCounter = 0;
      let batch = writeBatch(db);

      const arr = [];

      for (const doc of allSnapshot.docs) {
        const v = doc.data();
        let data: any = {};

        if (!v.version && v.version !== 0) {
          if (!v.cloudData) {
            data = {
              id: doc.id,
              author: v.owner || '',
              description: v.description || '',
              owner: v.owner || '',
              uid: v.owner || '', //uid 추가
              projectId: '', //previous 이전시 처리함
              channelName: '', //previous 이전시 처리함
              editOption: v.editOption || {
                isFixedAngle: true
              },
              status: v.isEnded ? 'closed' : v.publishedAt != null ? 'published' : 'created',
              version: 1.0,
              isHidden: false,
              isPrivate: v.isPrivate != null ? v.isPrivate : false,
              isPlatform: true,
              loginIPAddress: v.loginIPAddress || '',
              loginToken: v.loginToken || '',
              publishedAt: v.publishedAt != null ? v.publishedAt : null,
              like: v.like || 0,
              commentCount: v.commentCount || 0,
              objectLikeNum: v.objectLikeNum || 0,
              views: v.views ?? { todayView: 0, totalView: 0 },
              expiredAt: v.expiredAt ?? null,
              projectExpiredAt: null
            };
            console.count(`cloud x -> v1, ${doc.id}`);
            arr.push(doc.id);
          } else {
            const client = clients.find((client) => client.id === v.cloudData.clientId);
            const channelName = client?.title ? client.title : '';

            data = {
              id: doc.id,
              author: v.author || '',
              description: v.description || '',
              uid: v.owner, //uid 추가
              projectId: v.cloudData.clientId,
              channelName: channelName,
              editOption: v.editOption || {
                isFixedAngle: true
              },
              status: v.isEnded ? 'closed' : v.publishedAt != null ? 'published' : 'created',
              version: 2.0,
              isHidden: false,
              isPrivate: v.isPrivate != null ? v.isPrivate : false,
              isPlatform: true,
              loginIPAddress: v.loginIPAddress || '',
              loginToken: v.loginToken || '',
              publishedAt: v.publishedAt != null ? v.publishedAt : null,
              createdAt: v.createdAt,
              updatedAt: Timestamp.now(),
              like: v.like || 0,
              commentCount: v.commentCount || 0,
              objectLikeNum: v.objectLikeNum || 0,
              views: v.views ?? { todayView: 0, totalView: 0 },
              expiredAt: null,
              projectExpiredAt: null
            };
          }
          console.count(`cloud -> v2, ${doc.id}`);
          arr.push(doc.id);
        } else if (v.version === 1.5) {
          // v1.5 -> v2
          data = {
            ...v,
            id: doc.id,
            version: 2.0
          };
          arr.push(doc.id);
          console.count(`v1.5 -> v2, ${doc.id}`);
        } else {
          continue;
        }

        batch.set(doc.ref, data);
        operationCounter++;

        if (operationCounter === BATCH_SIZE) {

          await batch.commit();
          console.count('200개 업데이트 성공)');
          batch = writeBatch(db);
          operationCounter = 0;
        }
      }
    } catch (e) {
      console.error('Update Error : ', e);
    }
  };

export const setEx = async () => {
  try {
    const p1Ref = doc(db, 'Exhibition', 'W7dCjfvsfDS0I4h7O3ID'); // 현재 보이지 않는
    const p2Ref = doc(db, 'Exhibition', 'tNFX8WIvF3Ph0tbZKkvk'); // 보여지는

    const p1Snapshot = await getDoc(p1Ref);
    const p2Snapshot = await getDoc(p2Ref);

    if (p1Snapshot.exists() && p2Snapshot.exists()) {
      const p1Data = p1Snapshot.data();
      const p2Data = p2Snapshot.data()

      const data = (v1: any, v2: any) => {
        return {
          ...v2,
          id: v1.id,
          title: v1.title || v2.title,
          author: v1.author || v2.author || '',
          description: v1.description || v2.description || '',
          compressedPosterImage: v1.compressedPosterImage || v2.compressedPosterImage,
          originalPosterImage: v1.originalPosterImage || v2.originalPosterImage,
          thumbnailPosterImage: v1.thumbnailPosterImage || v2.thumbnailPosterImage,
          musicId: v1.musicId || v2.musicId,
          musicTitle: v1.musicTitle || v2.musicTitle,
          showcase: v1.showcase || v2.showcase,
          showcaseTitle: v1.showcaseTitle || v2.showcaseTitle,
          space: v1.space || v2.space,
          owner: v1.owner || v2.owner || '',
          uid: v1.owner || v2.owner || '',
          projectId: v1.projectId || v2.projectId || '',
          channelName: v1.channelName || v2.channelName || '',
          editOption: v1.editOption || v2.editOption || {
            isFixedAngle: true
          },
          hasLikeButton: v1.hasLikeButton ?? v2.hasLikeButton,
          hasLinkButton: v1.hasLinkButton ?? v2.hasLinkButton,
          hasMenuButton: v1.hasMenuButton ?? v2.hasMenuButton,
          hasObjectChat: v1.hasObjectChat ?? v2.hasObjectChat,
          hasSize: v1.hasSize ?? v2.hasSize,
          hasTitle: v1.hasTitle ?? v2.hasTitle,
          hasView: v1.hasView ?? v2.hasView,
          effectFXAA: v1.effectFXAA ?? v2.effectFXAA,
          status: 'published',
          version: 2.0,
          isHidden: false,
          isPrivate: v1.isPrivate ?? v2.isPrivate ?? false,
          isDeleted: v1.isDeleted ?? v2.isDeleted,
          isPlatform: true,
          loginIPAddress: v1.loginIPAddress || v2.loginIPAddress || '',
          loginToken: v1.loginToken || v2.loginToken || '',
          publishedAt: v1.publishedAt || v2.publishedAt || null,
          createdAt: v1.createdAt || v2.createdAt,
          updatedAt: v1.updatedAt || v2.updatedAt,
          like: v1.like || v2.like || 0,
          commentCount: v1.commentCount || v2.commentCount || 0,
          objectLikeNum: v1.objectLikeNum || v2.objectLikeNum || 0,
          views: v1.views || v2.views || { todayView: 0, totalView: 0 },
          expiredAt: v1.expiredAt ?? v2.expiredAt ?? null,
          projectExpiredAt: null
        };
      };

      const updateData = data(p1Data, p2Data)

      await updateDoc(p1Ref, updateData);
      console.log('p2 updated with p1 data:', p1Data);
    } else {
      console.log('p1 document does not exist');
    }
  } catch (e) {
    console.log('Error updating document:', e);
  }
}

export const setSpace = async () => {
  try {
    const exhibitionRef = doc(db, 'Exhibition', 'W7dCjfvsfDS0I4h7O3ID');
    const spaceRef = doc(db, 'Space', 'CIAWijATbfIkFXnuVXeF');

    const exSnapshot= await getDoc(exhibitionRef);
    const spaceSnapshot = await getDoc(spaceRef);

    if (exSnapshot.exists() && spaceSnapshot.exists()) {
      const exhibition = exSnapshot.data();
      const space = spaceSnapshot.data()

      const updatedExhibition = {
        ...exhibition,
        space: {
          ...space,
        },
      };

      await updateDoc(exhibitionRef, updatedExhibition);
      console.log('Done');
    } else {
      console.log('p1 document does not exist');
    }
  } catch (e) {
    console.log('Error updating document:', e);
  }
}
