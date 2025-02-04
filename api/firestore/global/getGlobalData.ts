import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { Metadata } from '@/type/Metadata';
import { META } from '@/constants/metadata';
import { FOOTER_INFO } from '@/constants/defaultLayoutInfo';

export const getGlobalMetadata = async (key: string): Promise<Metadata> => {
  try {
    const projectDesignDoc = await getDoc(doc(db, 'GlobalDesign', key));

    const metadata = projectDesignDoc.data() as Metadata;

    return {
      title: metadata.title || META.description,
      description: metadata.description || META.title,

      logoUrl: metadata.logoUrl || META.logoUrl,
      faviconUrl: metadata.faviconUrl || META.faviconUrl,
      ogUrl: metadata.ogUrl || META.ogUrl,

      footer: {
        company: metadata.footer?.company || FOOTER_INFO.company,
        copyright: metadata.footer?.copyright || FOOTER_INFO.copyright,
        company_en: metadata.footer?.company_en || FOOTER_INFO.company_en,
        copyright_en: metadata.footer?.copyright_en || FOOTER_INFO.copyright_en,

        blog: metadata.footer?.blog || '',
        instagram: metadata.footer?.instagram || '',
        facebook: metadata.footer?.facebook || '',
        homepage: metadata.footer?.homepage || '',
      },
      theme: {
        primary: metadata.theme.primary || '',
        secondary: metadata.theme.secondary || '',
      },
      id: metadata.id,
    };
  } catch (e) {
    console.log('Get metadata Error: ', e);
    return {} as Metadata;
  }
};
export const getGlobalSection = async (key: string) => {
  try {
    const sectionDocs = await getDocs(query(collection(db, 'GlobalDesign', key, 'Section')));

    const sections = sectionDocs.docs.map((doc) => doc.data());

    return sections;
  } catch (e) {
    console.log('Get section Error: ', e);
    return [];
  }
};
