import { MetadataRoute } from 'next';
import { SEO_REST_API } from '@/api/seo';

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const projectData = await SEO_REST_API.getAllProjectData();
  const ONTHEWALL_URL = process.env.NEXT_PUBLIC_ONTHEWALL_CLOUD_URL;

  const exhibitionIds = await SEO_REST_API.getAllExhibitionIds();
  const ART_ONTHEWALL_URL = process.env.NEXT_PUBLIC_ONTHEWALL_EXHIBITION_URL;

  const now = new Date();

  const notShowing = ['test73','TCk1D8lK','test09272','Fqc7LWQuJ28IRSFpYcll', 'test', 'dummy01', 'test30', 'testUrl', 'jhyn0']

  const projectSiteMap = projectData
    ? projectData
      .filter(v => ['business', 'enterprise'].includes(v.tier))
      .filter(v => !notShowing.includes(v.projectUrl))
      .map(v => ({
        url: `${ONTHEWALL_URL}/${v.projectUrl}/main`,
        lastModified: now
      }))
    : [];

  const channelSiteMap = projectData ? projectData.filter(v => ['business', 'personal'].includes(v.tier))
    .map(v => ({
      url: `${ONTHEWALL_URL}/channel/${v.projectUrl}`,
      lastModified: now
    })) : [];

  const exhibitionSiteMap = exhibitionIds ? exhibitionIds.map(id => ({
    url: `${ART_ONTHEWALL_URL}/${id}`,
    lastModified: now
  })) : [];

  return [
    {
      url: `${ONTHEWALL_URL}`,
      lastModified: now
    },
    {
      url: `${ONTHEWALL_URL}/account/sign-in`,
      lastModified: now
    },
    {
      url: `${ONTHEWALL_URL}/account/sign-up`,
      lastModified: now
    },
    {
      url: `${ONTHEWALL_URL}/main`,
      lastModified: now
    },
    ...projectSiteMap,
    ...exhibitionSiteMap,
    ...channelSiteMap,
  ];
};

export default sitemap;
