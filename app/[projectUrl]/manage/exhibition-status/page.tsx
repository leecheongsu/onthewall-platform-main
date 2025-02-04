'use client';

import { platformManageApis } from '@/api/platform';
import { moduleApis } from '@/api/module';
import { DashDateFormatter } from '@/utils/date';
import DataTable from '@/app/[projectUrl]/manage/exhibition-status/components/DataTable';
import NotFound from '@/pages/404';
import { useEffect, useState } from 'react';
import withAuth from '@/components/hoc/withAuth';
import Loading from '@/app/loading';
import { ACCESS_ALL_PROJECT, DENY_USER } from '@/constants/acess';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import InfoIcon from '@mui/icons-material/Info';

interface Props {
  params: {
    projectUrl: string;
  };
}

const fetchData = async (projectUrl: string) => {
  try {
    const res = await platformManageApis.getProjectByProjectUrl(projectUrl);
    const apiRes = res.data as ApiResponse;

    if (apiRes.meta.ok) {
      const projectId = apiRes.data.id;

      const [usersRes, exhibitionsRes] = await Promise.all([
        platformManageApis.getProjectUsers(projectId),
        moduleApis.getExhibitionsByProjectId(projectId, 'createdAt', 400),
      ]);

      const userApiRes = usersRes.data as ApiResponse;

      if (userApiRes.meta.ok) {
        const allUsers = Object.values(userApiRes.data) as UserInfo[];
        const userNames = allUsers.reduce((map: Record<string, string>, user) => {
          map[user.uid] = user.userName;
          return map;
        }, {});

        if (exhibitionsRes.status === 200) {
          const { totalCount, exhibitions: allExhibitions } = exhibitionsRes.data;
          return allExhibitions.map((v: Exhibition) => ({
            // id: v.id,
            // title: v.title,
            // status: v.status as ExhibitionStatus,
            // uid: v.uid,
            // isHidden: v.isHidden,
            userName: userNames[v.uid] || 'anonymous',
            ...v,
            createdAt: DashDateFormatter(v.createdAt),
            updatedAt: DashDateFormatter(v.updatedAt),
          }));
        }
      }
    }
  } catch (e) {
    console.error('Get Exhibition Table Data Error : ', e);
  }
};

function Page({ params: { projectUrl } }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hover, setHover] = useState(false);

  const fetchDataAsync = async () => {
    const result = await fetchData(projectUrl);
    setData(result);
    setIsLoading(false);
  };
  useEffect(() => {
    fetchDataAsync();
  }, [projectUrl]);

  if (data === null) {
    return <NotFound />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Container>
        <Header>
          <HeaderTitle
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            {t('Exhibition Status')}
            <InfoIcon
              sx={{ margin: '0 5px', width: '16px', color: '#6a6a6a', cursor: 'pointer' }}
              onMouseEnter={() => {
                setHover(true);
              }}
            />
            {hover ? (
              <HelperTxt>{t('You can manage exhibition information or status (disclosure, etc.)')}</HelperTxt>
            ) : null}
          </HeaderTitle>
        </Header>
        <DataTable data={data} fetchData={fetchDataAsync} />
      </Container>
    </>
  );
}

export default withAuth(Page, DENY_USER, ACCESS_ALL_PROJECT);
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
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
