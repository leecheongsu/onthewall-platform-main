'use client';

import styled from '@emotion/styled';
import { useProjectStore } from '@/store/project';
import { useEffect, useState } from 'react';

import DashboardCard from '@/components/manage/Overview/DashboardCard';
import VisitorStatistics from '@/components/manage/Overview/VisitorStatistics';
import PopularExhibitions from '@/components/manage/Overview/PopularExhibitions';
import NewComments from '@/components/manage/Overview/NewComments';
import { getExhibitionUsageInfo } from '@/api/firestore/getProject';
import { useTranslation } from 'react-i18next';
import withAuth from '@/components/hoc/withAuth';
import { ACCESS_ALL_PROJECT, ACCESS_ALL_USER } from '@/constants/acess';
import PlanInfo from '@/components/manage/PlanInfo';
import { useUserStore } from '@/store/user';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguageStore } from '@/store/language';
import InfoIcon from '@mui/icons-material/Info';
import ChannelNameUpdateModal from '@/components/admin/Manage/modal/ChannelNameUpdate';
/**
 * Note. Dashboard
 */

const DUMMY_DASHBOARD = [
  {
    header: 'Active exhibitions',
    help: '',
    type: 'fraction',
    value: [0, 0],
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/onthewall-cloud.appspot.com/o/assets%2Fimage%2Fdashboard1.png?alt=media&token=680f9cb4-8979-4372-a122-353130517a8b',
    // description: '8.5% Up from yesterday',
    increase: true,
  },
  {
    header: 'Space Used',
    help: '',
    type: 'number',
    value: [0],
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/onthewall-cloud.appspot.com/o/assets%2Fimage%2Fdashboard2.png?alt=media&token=a0db567c-7f97-4c57-b15f-116109b8950e',
    // description: '1.3% Up from yesterday',
    increase: true,
  },
  {
    header: 'Space Left',
    help: '',
    type: 'number',
    value: [0],
    imageSrc:
      'https://firebasestorage.googleapis.com/v0/b/onthewall-cloud.appspot.com/o/assets%2Fimage%2Fdashboard3.png?alt=media&token=9189d2e8-5689-4c8c-8c97-58b6cd5f1c00',
    // description: '4.3 Down from yesterday',
    increase: false,
  },
];

function Page() {
  const { i18n, t } = useTranslation();
  const { language } = useLanguageStore();
  const { projectId, updateInfo } = useProjectStore();
  const { status, projectsMap } = useUserStore();
  const [data, setData] = useState(DUMMY_DASHBOARD);
  const [hover, setHover] = useState(false);
  const [planData, setPlanData] = useState({
    tier: '',
    currentExhibitionCount: 0,
    exhibitionLimit: 0,
    assignedExhibitionCount: 0,
    adminExhibitionCount: 0,
    expiredAt: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getExhibitionUsageInfo(projectId);

      setPlanData({
        tier: data.tier,
        currentExhibitionCount: data.currentExhibitionCount,
        exhibitionLimit: data.exhibitionLimit,
        assignedExhibitionCount: data.assignedExhibitionCount,
        adminExhibitionCount: data.adminExhibitionCount,
        expiredAt: data.expiredAt,
      });

      const today = new Date().toISOString().slice(0, 10);
      const pageViewDoc = await getDoc(doc(db, 'Project', projectId, 'PageViewLog', `PageViewLog-${today}`));
      const viewDoc = await getDoc(doc(db, 'Project', projectId, 'ViewLog', `ViewLog-${today}`));
      const likeDoc = await getDoc(doc(db, 'Project', projectId, 'LikeLog', `LikeLog-${today}`));

      updateInfo('config', data.config);
      setData((props) => {
        return [
          {
            header: t('Channel Views'),
            help: t('홈페이지에 방문한 방문자 수를 나타냅니다. \n오늘 방문자 / 전체 방문자'),
            type: 'fraction',
            value: [pageViewDoc.data()?.count ?? 0, data.pageViewCount],
            // value: [pageViewDoc.data()?.count ?? 0, data.pageViewCount],
            imageSrc:
              'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2Ficon%2FGroup%201000001052.png?alt=media&token=6050e11f-bb56-48a1-8485-d5bc013d0372',
            // description: '8.5% Up from yesterday',
            increase: true,
          },
          {
            header: t('Exhibition Views'),
            help: t('전시회에 방문한 방문자 수를 나타냅니다. 오늘 방문자 / 전체 방문자'),
            type: 'fraction',
            value: [viewDoc.data()?.count ?? 0, data.viewCount],
            // value: [data.currentExhibitionCount, data.viewCount],
            imageSrc:
              'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2Ficon%2FGroup%201000001050.png?alt=media&token=1afde37a-3002-4960-bacb-cef12aa383f9',
            // description: '8.5% Up from yesterday',
            increase: true,
          },
          {
            header: t('Exhibition Likes'),
            help: t('전시회에 좋아요를 누른 방문자 수를 나타냅니다. 오늘 좋아요 / 전체 좋아요'),
            type: 'fraction',
            value: [likeDoc.data()?.count ?? 0, data.likeCount],
            // value: [data.currentExhibitionCount, data.likeCount],
            imageSrc:
              'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2Ficon%2FGroup%201000001051.png?alt=media&token=f1c2aa00-a860-4bbe-af84-1de5d4d4fb93',
            // description: '8.5% Up from yesterday',
            increase: true,
          },
          {
            header: t('Active exhibitions'),
            help: t('모든 생성된 전시회 수의 합을 나타냅니다.'),
            type: 'fraction',
            value: [data.currentExhibitionCount, data.exhibitionLimit],
            imageSrc:
              'https://firebasestorage.googleapis.com/v0/b/onthewall-cloud.appspot.com/o/assets%2Fimage%2Fdashboard1-2.png?alt=media&token=bc3f966a-e567-4090-8fbe-333a0630ba18',
            // description: '8.5% Up from yesterday',
            increase: true,
          },
          {
            header: t('Space Used'),
            help: t('유저에게 할당된 공간과 관리자가 생성한 전시 공간의 합을 나타냅니다.'),
            type: 'number',
            value: [data.assignedExhibitionCount + data.adminExhibitionCount],
            imageSrc:
              'https://firebasestorage.googleapis.com/v0/b/onthewall-cloud.appspot.com/o/assets%2Fimage%2Fdashboard2.png?alt=media&token=a0db567c-7f97-4c57-b15f-116109b8950e',
            // description: '1.3% Up from yesterday',
            increase: true,
          },
          {
            header: t('Space Left'),
            help: t('생성 또는 할당 가능한 남은 공간을 나타냅니다.'),
            type: 'number',
            value: [data.exhibitionLimit - data.assignedExhibitionCount - data.adminExhibitionCount],
            imageSrc:
              'https://firebasestorage.googleapis.com/v0/b/onthewall-cloud.appspot.com/o/assets%2Fimage%2Fdashboard3-2.png?alt=media&token=17c94068-f89b-4cc2-bdd9-bcc7c0148e86',
            // description: '4.3 Down from yesterday',
            increase: false,
          },
        ];
      });
    };
    fetchData();
  }, [projectId, language]);

  return (
    <Container>
      <Header>
        <HeaderTitle
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          {t('Overview')}
          <InfoIcon
            sx={{ margin: '0 5px', width: '16px', color: '#6a6a6a', cursor: 'pointer' }}
            onMouseEnter={() => {
              setHover(true);
            }}
          />
          {hover ? (
            <HelperTxt>
              {t(
                'You can check overall information about the site, including the number of exhibitions, views, likes, and comments.'
              )}
            </HelperTxt>
          ) : null}
        </HeaderTitle>
      </Header>
      {projectsMap[projectId]?.status === 'owner' && <PlanInfo planData={planData} />}
      <CardBox>
        {data.map((item, index) => (
          <DashboardCard
            key={index}
            header={item.header}
            type={item.type as 'number' | 'fraction'}
            value={item.value}
            imageSrc={item.imageSrc}
            // // description={item.description}
            increase={item.increase}
            help={item.help}
          />
        ))}
      </CardBox>
      <VisitorStatistics />
      <BottomBox>
        <PopularExhibitions />
        <NewComments />
      </BottomBox>
      <ChannelNameUpdateModal />
    </Container>
  );
}

export default withAuth(Page, ACCESS_ALL_USER, ACCESS_ALL_PROJECT);
const Container = styled.div`
  width: 100%;
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;
`;

const CardBox = styled.div`
  width: 100%;
  max-width: 1200px;
  height: auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  /* padding-top: 10px; */
  margin-bottom: 20px;

  // mobile
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const BottomBox = styled.div`
  width: 100%;
  max-width: 1200px;
  height: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding-top: 10px;
  margin-bottom: 20px;
  // mobile
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: flex-start;
  width: fit-content;
`;

const HelperTxt = styled.span`
  position: absolute;
  top: 5px;
  left: calc(100% - 10px);
  font-size: 14px;
  color: #fff;
  line-height: 1.5;
  padding: 10px;
  margin: 0;
  display: block;
  min-width: 300px;
  border-radius: 3px;
  background-color: rgba(0, 0, 0, 0.3);
  word-break: keep-all;
  word-wrap: break-word;
`;
