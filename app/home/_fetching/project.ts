import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  setDoc,
  deleteDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ClientType = {
  id: string;
  title: string;
  commentCount: number;
  exhibitionCount: number;
  likeCount: number;
  banner: Array<{
    id: string;
    createdAt: Date;
    imageUrl: string;
    order: number;
    url: string;
  }>;
  like: number;
  maxCount: number;
  tier: 'enterprise' | 'business' | 'personal' | 'free';
  createdAt: Date;
  type: 'ONTHEWALL_CLOUD' | 'CLOUD' | 'ONE_USER';
  logo: string;
  faviconUrl: string;
  footerInfo: string;
};

type ProjectType = {
  id?: string;
  channelName: string;
  projectUrl: string;
  tier: 'enterprise' | 'business' | 'personal' | 'free';
  status: 'processing' | 'expired' | 'activated';
  subscriptionModel: 'annual' | 'monthly' | 'custom';
  exhibitionLimit: number;
  assignedExhibitionCount: number;
  currentExhibitionCount: number;
  adminExhibitionCount: number;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  type: 'ONTHEWALL_CLOUD';
  config: {
    adminMaxCount: number;
    isAutoApproved: boolean;
    initialAssignCount: number;
  };
};

export const convertProject = async (
  originalProject: ClientType
): Promise<{ users: any[]; newProject: ProjectType }> => {
  const { maxCount, tier, title, createdAt, id } = originalProject;

  const usersSnapshot = await getDocs(
    query(collection(db, 'User'), where(`cloudData.${id}.approved`, '==', 'approve'))
  );
  let assignedExhibitionCount = 0;
  let currentExhibitionCount = 0;
  let adminExhibitionCount = 0;

  usersSnapshot.forEach((userDoc) => {
    const userData = userDoc.data();
    if (userData.cloudData?.[id]) {
      currentExhibitionCount += userData.cloudData[id].currentExhibitionCount;
      if (userData.cloudData[id].isAdmin) {
        adminExhibitionCount += userData.cloudData[id].createExhibitionCount;
      } else {
        assignedExhibitionCount += userData.cloudData[id].createExhibitionLimit;
      }
    }
  });

  const exhibitionsSnapshot = await getDocs(query(collection(db, 'Exhibition'), where('projectId', '==', id)));

  let likeCount = 0;
  let commentCount = 0;
  let viewCount = 0;

  exhibitionsSnapshot.forEach((exhibitionDoc) => {
    const exhibitionData = exhibitionDoc.data();
    likeCount += exhibitionData.like || 0;
    commentCount += exhibitionData.commentCount || 0;
    viewCount += exhibitionData.views?.totalView || 0;
  });

  const newProject: ProjectType = {
    channelName: title ?? '',
    projectUrl: id,
    tier: tier.toLowerCase() as any,
    status: 'activated',
    subscriptionModel: 'annual',
    exhibitionLimit: maxCount ?? 20,
    assignedExhibitionCount,
    currentExhibitionCount,
    adminExhibitionCount,
    expiredAt: new Date('2025-10-31'),
    createdAt: createdAt ?? new Date(),
    updatedAt: new Date(),
    likeCount,
    commentCount,
    viewCount,
    type: 'ONTHEWALL_CLOUD',
    config: {
      adminMaxCount: 3,
      isAutoApproved: false,
      initialAssignCount: 1,
    },
  };

  return { users: usersSnapshot.docs, newProject };
};

export const convertProjectDesign = (originalProject: ClientType) => {
  const { title, createdAt, logo, faviconUrl, footerInfo, banner } = originalProject;

  const projectDesign = {
    description: '',
    logoUrl:
      logo ??
      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/paintings%2Fonthewall-logo_FtEzFi3WPV_original.png?alt=media&token=82e23c8a-232d-42fa-b174-5d87f83969b4',
    faviconUrl: faviconUrl ?? '',
    ogUrl: '',
    footer: {
      company: footerInfo ?? '',
      copyright: `Copyright © ${title ?? ''} all rights reserved.`,
    },
    blog: '',
    instagram: '',
    facebook: '',
    homepage: '',
    theme: {
      primary: '',
      secondary: '',
    },
    channelData: {
      bannerData: {
        desktop: {
          url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
        },
        mobile: {
          url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%[…]?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
        },
      },
      thumbnail:
        logo ||
        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
      description: '',
      information: '',
      facebook: '',
      x: '',
      instagram: '',
      shop: '',
      homepage: '',
      blog: '',
    },
    createdAt: createdAt ?? new Date(),
    updatedAt: new Date(),
  };

  return projectDesign;
};

export const emptySection = (projectId: string, order: number) => ({
  projectId,
  type: 'BLANK',
  order,
  height: 30,
  isDeleted: false,
  updatedAt: new Date(),
  createdAt: new Date(),
});

export const bannerSection = (projectId: string, url: string, order: number) => ({
  projectId,
  order,
  type: 'BANNER',
  desktop: {
    url: `https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744`,
    height: '',
  },
  hasMobile: false,
  mobile: {
    url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%[…]?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
    height: '',
  },
  hasLink: false,
  linkUrl: '',
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const combineProjects = async (processedProjects: string[]) => {
  const allClientsSnapshot = await getDocs(collection(db, 'Client'));

  const allClientsData: ClientType[] = allClientsSnapshot.docs.map((doc) => {
    return { ...(doc.data() as ClientType), id: doc.id };
  });

  let operationCounter = 0;
  const BATCH_SIZE = 200;

  for (const project of allClientsData) {
    if (project.type === 'ONTHEWALL_CLOUD' || project.type === 'ONE_USER') continue;
    if (processedProjects.includes(project.id)) continue;

    processedProjects.push(project.id);
    const { users, newProject } = await convertProject(project);
    const projectRef = doc(collection(db, 'Project'));
    await setDoc(projectRef, newProject);

    // 아이디 업데이트
    await updateDoc(projectRef, { id: projectRef.id });

    // projectDesign 추가
    const projectDesign = convertProjectDesign(project);
    await setDoc(doc(db, 'ProjectDesign', projectRef.id), { ...projectDesign, id: projectRef.id });

    // user에 프로젝츠 업데이트
    for (const userDoc of users) {
      const userData = userDoc.data();
      const userRef = userDoc.ref;

      if (userData.cloudData[project.id]?.isAdmin) {
        await updateDoc(userRef, {
          projects: arrayUnion({ id: projectRef.id, status: 'admin' }),
        });
      } else {
        await updateDoc(userRef, {
          projects: arrayUnion({ id: projectRef.id, status: 'user' }),
        });
        await setDoc(doc(db, 'Project', projectRef.id, 'User', userDoc.id), {
          ...userData,
          id: userDoc.id,
          projects: [{ id: projectRef.id, status: 'user' }],
          password: '',
          status: 'general',
          oldUser: true,
          isMoved: true,
        });
      }
    }

    // 섹션 추가
    const empty1 = emptySection(projectRef.id, 0);
    const banner = bannerSection(projectRef.id, project?.banner?.[0]?.url, 1);
    const empty2 = emptySection(projectRef.id, 2);

    await addDoc(collection(db, 'ProjectDesign', projectRef.id, 'Section'), banner);
    await addDoc(collection(db, 'ProjectDesign', projectRef.id, 'Section'), empty1);
    await addDoc(collection(db, 'ProjectDesign', projectRef.id, 'Section'), empty2);

    console.log('🚀 ~ file: layout.tsx ~ line 228 ~ combineProjects ~ projectRef.id', projectRef.id, operationCounter);
    operationCounter++;

    if (operationCounter === BATCH_SIZE) {
      operationCounter = 0;
    }
  }
};

export const removeProjects = async () => {
  const allProjectsSnapshot = await getDocs(collection(db, 'Client'));

  const allProjectsData: ClientType[] = allProjectsSnapshot.docs.map((doc) => {
    return { ...(doc.data() as ClientType), id: doc.id };
  });

  for (const project of allProjectsData) {
    if (project.type === 'ONTHEWALL_CLOUD' || project.type === 'ONE_USER') continue;

    const projectRef = query(collection(db, 'Project'), where('projectUrl', '==', project.id));
    const projectDoc = await getDocs(projectRef);
    projectDoc.forEach(async (_doc) => {
      deleteDoc(_doc.ref);
      deleteDoc(doc(db, 'ProjectDesign', _doc.id));
      deleteDoc(doc(db, 'ProjectDesign', _doc.id, 'Section', 'banner'));
      deleteDoc(doc(db, 'ProjectDesign', _doc.id, 'Section', 'empty1'));
      deleteDoc(doc(db, 'ProjectDesign', _doc.id, 'Section', 'empty2'));
    });
  }
};

export const setBFAA = async () => {
  try {
    const clientRef = query(collection(db, 'Client'), where('id', '==', 'BFAA'));
    const clientSnapshot = await getDocs(clientRef);

    if (clientSnapshot.empty) {
      console.log('No client found with id "bfaa"');
      return;
    }

    const clientData: any[] = clientSnapshot.docs.map((doc) => {
      return { ...doc.data(), id: doc.id };
    });

    const now = Timestamp.now();

    const convertData = (data: any) => {
      return {
        adminExhibitionCount: 0,
        assignedExhibitionCount: 0,
        channelName: 'Busan Fine Arts Association',
        commentCount: 0,
        config: {
          adminMaxCount: 100,
          initialAssignCount: 0,
          isAutoApproved: false,
        },
        createdAt: now,
        currentExhibitionCount: 0,
        exhibitionLimit: 20,
        expiredAt: null,
        id: '',
        likeCount: 0,
        ownerId: '',
        projectUrl: 'BFAA',
        status: 'activated',
        subscriptionModel: 'annual',
        temp: 1,
        tier: 'business',
        title: 'Busan Fine Arts Association',
        updatedAt: now,
        viewCount: 0,
      };
    };

    const projectData = convertData(clientData);

    const projectRef = doc(collection(db, 'Project'));

    await setDoc(projectRef, { ...projectData, id: projectRef.id });

    const projectDesign = {
      description: '',
      logoUrl:
        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/paintings%2Fonthewall-logo_FtEzFi3WPV_original.png?alt=media&token=82e23c8a-232d-42fa-b174-5d87f83969b4',
      faviconUrl: '',
      ogUrl: '',
      footer: {
        company: '',
        copyright: `Copyright © all rights reserved.`,
      },
      blog: '',
      instagram: '',
      facebook: '',
      homepage: '',
      theme: {
        primary: '',
        secondary: '',
      },
      channelData: {
        bannerData: {
          desktop: {
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
          },
          mobile: {
            url: 'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%[…]?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
          },
        },
        thumbnail:
          'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
        description: '',
        information: '',
        x: '',
        instagram: '',
        facebook: '',
        shop: '',
        homepage: '',
        blog: '',
      },
      createdAt: now,
      updatedAt: new Date(),
    };

    await setDoc(doc(db, 'ProjectDesign', projectRef.id), { ...projectDesign, id: projectRef.id });

    console.log('projectId : ', projectRef.id);

    const bannerDefault =
      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744';

    const empty1 = emptySection(projectRef.id, 0);
    const banner = bannerSection(projectRef.id, bannerDefault, 1);
    const empty2 = emptySection(projectRef.id, 2);

    await addDoc(collection(db, 'ProjectDesign', projectRef.id, 'Section'), banner);
    await addDoc(collection(db, 'ProjectDesign', projectRef.id, 'Section'), empty1);
    await addDoc(collection(db, 'ProjectDesign', projectRef.id, 'Section'), empty2);

    console.log('success');
  } catch (e) {
    console.log('BFAA : ', e);
  }
};
