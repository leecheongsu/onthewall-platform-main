export interface Metadata {
  title: string;
  description: string;

  logoUrl: string;
  faviconUrl: string;
  ogUrl: string;
  bannerUrl?: string;

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
  id?: string;
  channelData?: {
    bannerData: {
      desktop: {
        url: string;
      };
      mobile: {
        url: string;
      };
    };
    thumbnail: string;
    blog: string;
    instagram: string;
    x: string;
    facebook: string;
    homepage: string;
    title: string;
    description: string;
    information: string;
    shop: string;
  };
}
