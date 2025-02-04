import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';
import { Metadata } from '@/type/Metadata';
import { META } from '@/constants/metadata';
import { KEY } from '@/constants/globalDesign';

export const getMetadataByProjectId = async (projectId: string): Promise<Metadata> => {
  let collectionName = 'ProjectDesign';
  if (projectId === KEY) collectionName = 'GlobalDesign';
  try {
    const query1 = query(collection(db, collectionName), where('id', '==', projectId));
    const snapshot = await getDocs(query1);

    if (!snapshot.empty) {
      const projectDesignDoc = snapshot.docs[0];
      const metadata = projectDesignDoc.data() as Metadata;

      let bannerUrl = '';

      // Section 하위 컬렉션에서 bannerUrl 가져오기
      const sectionCollectionRef = collection(doc(db, 'ProjectDesign', projectDesignDoc.id), 'Section');
      const sectionQuery = query(sectionCollectionRef, where('isDeleted', '==', false));
      const sectionSnapshot = await getDocs(sectionQuery);

      if (!sectionSnapshot.empty) {
        // 첫 번째 섹션의 bannerUrl 값을 사용
        const sectionData = sectionSnapshot.docs[0].data();
        //console.log("sectionData: ", sectionData);
        if (sectionData.desktop) {
          bannerUrl = sectionData.desktop.url || '';
        }
      }

      return {
        title: metadata.title || META.title,
        description: metadata.description || META.description,

        logoUrl: metadata.logoUrl || META.logoUrl,
        faviconUrl: metadata.faviconUrl || META.faviconUrl,
        ogUrl: metadata.ogUrl || META.ogUrl,
        bannerUrl: bannerUrl || '',

        footer: {
          company: metadata.footer?.company || '',
          copyright: metadata.footer?.copyright || '',
          company_en: metadata.footer?.company_en || '',
          copyright_en: metadata.footer?.copyright_en || '',

          blog: metadata.footer?.blog || '',
          instagram: metadata.footer?.instagram || '',
          facebook: metadata.footer?.facebook || '',
          homepage: metadata.footer?.homepage || '',
        },
        theme: {
          primary: metadata.theme.primary || '',
          secondary: metadata.theme.secondary || '',
        },
        channelData: {
          bannerData: {
            desktop: {
              url: metadata.channelData?.bannerData?.desktop?.url || '',
            },
            mobile: {
              url: metadata.channelData?.bannerData?.mobile?.url || '',
            },
          },
          thumbnail: metadata.channelData?.thumbnail || '',
          blog: metadata.channelData?.blog || '',
          instagram: metadata.channelData?.instagram || '',
          facebook: metadata.footer?.facebook || '',
          x: metadata.channelData?.x || '',
          homepage: metadata.channelData?.homepage || '',
          title: metadata.channelData?.title || '',
          description: metadata.channelData?.description || '',
          information: metadata.channelData?.information || '',
          shop: metadata.channelData?.shop || '',
        },
      };
    } else {
      return {} as Metadata;
    }
  } catch (e) {
    console.log('Get metadata Error: ', e);
    return {} as Metadata;
  }
};

const emptyData: Metadata = {
  title: '',
  description: '',

  logoUrl: '',
  faviconUrl: '',
  ogUrl: '',
  bannerUrl: '',

  footer: {
    company: '',
    copyright: '',
    company_en: '',
    copyright_en: '',

    blog: '',
    instagram: '',
    facebook: '',
    homepage: '',
  },
  theme: {
    primary: '',
    secondary: '',
  },
  channelData: {
    bannerData: {
      desktop: {
        url: '',
      },
      mobile: {
        url: '',
      },
    },
    thumbnail: '',
    blog: '',
    instagram: '',
    facebook: '',
    x: '',
    homepage: '',
    title: '',
    description: '',
    information: '',
    shop: '',
  },
};

export const getMetadataByProjectUrl = async (projectUrl: string): Promise<Metadata> => {
  try {
    const query1 = query(collection(db, 'Project'), where('projectUrl', '==', projectUrl));
    const snapshot = await getDocs(query1);

    if (snapshot.empty) {
      return emptyData;
    } else {
      const projectId = snapshot.docs.map((doc) => doc.id)[0];
      return await getMetadataByProjectId(projectId);
    }
  } catch (e) {
    console.log('Get metadata Error: ', e);
    return emptyData;
  }
};

export const getExhibitionMetadataByProjectUrl = async (projectUrl: string): Promise<any> => {
  try {
    const query1 = query(collection(db, 'Project'), where('projectUrl', '==', projectUrl));
    const snapshot = await getDocs(query1);

    if (!snapshot.empty) {
      const projectId = snapshot.docs.map((doc) => doc.id)[0];

      const query2 = query(collection(db, 'Exhibition'), where('projectId', '==', projectId));
      const exhibitionSnapshot = await getDocs(query2);

      if (!exhibitionSnapshot.empty) {
        const exhibitionMetadatas: any[] = [];
        exhibitionSnapshot.docs.forEach((doc) => {
          exhibitionMetadatas.push({
            title: doc.data().title,
          });
        });
        return exhibitionMetadatas;
      } else {
        return [];
      }
    } else {
      return [];
    }
  } catch (e) {
    console.log('Get Exhibition metadata Error : ', e);
    return [];
  }
};
