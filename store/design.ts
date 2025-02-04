import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CommonActions } from '@/store/index';
import { DEFAULT_INFO, DEFAULT_THEME, DEFAULT_IMAGES, FOOTER_INFO } from '@/constants/defaultLayoutInfo';

import { getMetadataByProjectUrl } from '@/api/firestore/getMetadata';
import { getGlobalMetadata } from '@/api/firestore/global/getGlobalData';

type State = {};

interface Actions extends CommonActions {
  id: string;
  title: string;
  description: string;

  logoUrl: string;
  faviconUrl: string;
  ogUrl: string;

  footer: {
    company: string;
    copyright: string;
    company_en: string;
    copyright_en: string;
    blog: string;
    instagram: string;
    facebook: string;
    homepage: string;
  };
  theme: {
    primary: string;
    secondary: string;
  };
  isProject: boolean;
  fetchDesignDataByProjectUrl: (projectUrl: string) => void;
  setDefaultDesignData: () => void;
  setGlobalDesignData: (key: string) => void;
}

const DEFAULT_DATA = {
  id: '',
  title: DEFAULT_INFO.title,
  description: DEFAULT_INFO.description,
  logoUrl: DEFAULT_IMAGES.logoUrl,
  faviconUrl: DEFAULT_IMAGES.faviconUrl,
  ogUrl: DEFAULT_IMAGES.ogUrl,
  footer: {
    company: FOOTER_INFO.company,
    copyright: FOOTER_INFO.copyright,
    company_en: FOOTER_INFO.company_en,
    copyright_en: FOOTER_INFO.copyright_en,
    blog: FOOTER_INFO.blog,
    instagram: FOOTER_INFO.instagram,
    facebook: FOOTER_INFO.facebook,
    homepage: FOOTER_INFO.homepage,
  },
  theme: {
    primary: DEFAULT_THEME.primary,
    secondary: DEFAULT_THEME.secondary,
  },
};

export const useDesignStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      id: '',
      title: '',
      description: '',
      logoUrl: '',
      faviconUrl: '',
      ogUrl: '',
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
        primary: '#e4e4e4',
        secondary: '#e4e4e4',
      },
      isProject: false,
      updateInfo: (type: string, value: any) => set((state) => ({ [type]: value })),

      fetchDesignDataByProjectUrl: async (projectUrl: string) => {
        try {
          const { id, title, description, logoUrl, faviconUrl, ogUrl, footer, theme } = await getMetadataByProjectUrl(
            projectUrl
          );

          const newState = {} as any;

          // Conditionally update fields based on API response or use DEFAULT_DATA
          newState['id'] = id !== '' ? id : DEFAULT_DATA.id;
          newState['title'] = title !== '' ? title : DEFAULT_DATA.title;
          newState['description'] = description !== '' ? description : DEFAULT_DATA.description;
          newState['logoUrl'] = logoUrl !== '' ? logoUrl : DEFAULT_DATA.logoUrl;
          newState['faviconUrl'] = faviconUrl !== '' ? faviconUrl : DEFAULT_DATA.faviconUrl;
          newState['ogUrl'] = ogUrl !== '' ? ogUrl : DEFAULT_DATA.ogUrl;

          newState['footer'] = {
            company: footer.company !== '' ? footer.company : DEFAULT_DATA.footer.company,
            copyright: footer.copyright !== '' ? footer.copyright : DEFAULT_DATA.footer.copyright,
            company_en: footer.company_en !== '' ? footer.company_en : DEFAULT_DATA.footer.company_en,
            copyright_en: footer.copyright_en !== '' ? footer.copyright_en : DEFAULT_DATA.footer.copyright_en,
            blog: footer.blog !== '' ? footer.blog : DEFAULT_DATA.footer.blog,
            instagram: footer.instagram !== '' ? footer.instagram : DEFAULT_DATA.footer.instagram,
            facebook: footer.facebook !== '' ? footer.facebook : DEFAULT_DATA.footer.facebook,
            homepage: footer.homepage !== '' ? footer.homepage : DEFAULT_DATA.footer.homepage,
          };

          newState['theme'] = {
            primary: theme.primary !== '' ? theme.primary : DEFAULT_DATA.theme.primary,
            secondary: theme.secondary !== '' ? theme.secondary : DEFAULT_DATA.theme.secondary,
          };
          newState['isProject'] = true;
          set(newState);
        } catch (e) {
          console.error('Fetch Project Data :', e);
          set(DEFAULT_DATA);
        }
      },
      setDefaultDesignData: () => {
        set(DEFAULT_DATA);
      },
      setGlobalDesignData: async (key: string) => {
        try {
          const { id, title, description, logoUrl, faviconUrl, ogUrl, footer, theme } = await getGlobalMetadata(key);
          const newState = {} as any;

          // Conditionally update fields based on API response or use DEFAULT_DATA
          newState['id'] = id !== '' ? id : DEFAULT_DATA.id;
          newState['title'] = title !== '' ? title : DEFAULT_DATA.title;
          newState['description'] = description !== '' ? description : DEFAULT_DATA.description;
          newState['logoUrl'] = logoUrl !== '' ? logoUrl : DEFAULT_DATA.logoUrl;
          newState['faviconUrl'] = faviconUrl !== '' ? faviconUrl : DEFAULT_DATA.faviconUrl;
          newState['ogUrl'] = ogUrl !== '' ? ogUrl : DEFAULT_DATA.ogUrl;

          newState['footer'] = {
            company: footer.company !== '' ? footer.company : DEFAULT_DATA.footer.company,
            copyright: footer.copyright !== '' ? footer.copyright : DEFAULT_DATA.footer.copyright,
            company_en: footer.company_en !== '' ? footer.company_en : DEFAULT_DATA.footer.company_en,
            copyright_en: footer.copyright_en !== '' ? footer.copyright_en : DEFAULT_DATA.footer.copyright_en,
            blog: footer.blog !== '' ? footer.blog : DEFAULT_DATA.footer.blog,
            instagram: footer.instagram !== '' ? footer.instagram : DEFAULT_DATA.footer.instagram,
            facebook: footer.facebook !== '' ? footer.facebook : DEFAULT_DATA.footer.facebook,
            homepage: footer.homepage !== '' ? footer.homepage : DEFAULT_DATA.footer.homepage,
          };

          newState['theme'] = {
            primary: theme.primary !== '' ? theme.primary : DEFAULT_DATA.theme.primary,
            secondary: theme.secondary !== '' ? theme.secondary : DEFAULT_DATA.theme.secondary,
          };

          set(newState);
        } catch (e) {
          console.error('Set Global Design Data :', e);
        }
      },
    }),
    {
      name: 'project-design-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({}),
    }
  )
);
