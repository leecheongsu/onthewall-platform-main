'use client';

import { platformManageApis } from '@/api/platform';
import { DashDateFormatter } from '@/utils/date';
import DataTable from '@/app/[projectUrl]/manage/administrators/components/DataTable';
import React, { useEffect, useState } from 'react';
import Loading from '@/app/loading';
import withAuth from '@/components/hoc/withAuth';
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
      const { id: projectId } = apiRes.data;

      const userRes = await platformManageApis.getProjectUsers(projectId);
      const userApiRes = userRes.data as ApiResponse;

      const admins = Object.values(userApiRes.data) as UserInfo[];

      return admins.map((v) => ({
        uid: v.uid,
        userName: v.userName,
        phone: v.phone || '-',
        email: v.email,
        registrationPath: v.social,
        createdAt: DashDateFormatter(v.createdAt),
      }));
    }
  } catch (e) {
    console.error('Fetch members Data Error : ', e);
  }
};

function Page({ params: { projectUrl } }: Props) {
  const { t } = useTranslation();

  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReload, setIsReload] = useState(false);
  const [hover, setHover] = useState(false);

  const fetchDataAsync = async () => {
    const result = await fetchData(projectUrl);
    setData(result);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDataAsync();
  }, [projectUrl]);

  useEffect(() => {
    if (isReload) {
      fetchDataAsync().then(() => {
        setIsReload(false);
      });
    }
  }, [isReload]);

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
            {t('Administrators')}
            <InfoIcon
              sx={{ margin: '0 5px', width: '16px', color: '#6a6a6a', cursor: 'pointer' }}
              onMouseEnter={() => {
                setHover(true);
              }}
            />
            {hover ? <HelperTxt>{t('You can invite administrators and check their status, etc.')}</HelperTxt> : null}
          </HeaderTitle>
        </Header>
        <DataTable data={data} onReload={() => setIsReload(true)} />
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
