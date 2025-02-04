'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from '@emotion/styled';

// store
import { useProjectStore } from '@/store/project';

// firebase
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, getDoc, orderBy } from 'firebase/firestore';

// mui
import Button from '@mui/material/Button';

// components
import ChannelHeader from '@/components/channel/ChannelHeader';
import ChannelBanner from '@/components/channel/ChannelBanner';
import EmptySpace from '@/common/EmptySpace';
import Tabs from '@/components/channel/Tabs';
import ExhibitionList from '@/components/channel/ExhibitionList';
import Information from '@/components/channel/Information';
import ChannelSettingModal from '@/components/channel/ChannelSettingModal';

// icons
import SettingsIcon from '@mui/icons-material/Settings';
import Banner from '@/components/Banner';
import InfoIcon from '@mui/icons-material/Info';

type Props = {};

function ChannelSetting({}: Props) {
  const { projectId, projectUrl } = useProjectStore((state) => ({
    projectId: state.projectId,
    projectUrl: state.projectUrl,
  }));
  const { t } = useTranslation();
  const [channelSetting, setChannelSetting] = useState(false);
  const [hover, setHover] = useState(false);

  const [tab, setTab] = useState(0);
  const [data, setData] = React.useState({
    bannerData: { desktop: { url: '' }, mobile: { url: '' } },
    description: '',
    blog: '',
    facebook: '',
    homepage: '',
    information: '',
    instagram: '',
    shop: '',
    thumbnail:
      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
    title: '',
    x: '',
    id: '',
    exhibitions: [],
  });

  useEffect(() => {
    const p1 = getDoc(doc(db, 'Project', projectId));
    const p2 = getDoc(doc(db, 'ProjectDesign', projectId));
    const q1 = query(
      collection(db, 'Exhibition'),
      where('projectId', '==', projectId),
      where('status', '==', 'published'),
      where('isHidden', '==', false),
      where('isDeleted', '==', false),
      orderBy('publishedAt', 'desc')
    );
    const p3 = getDocs(q1);

    Promise.all([p1, p2, p3]).then(([snap1, snap2, snap3]) => {
      if (snap1.exists() && snap2.exists()) {
        const projData = snap1.data();
        const data = snap2.data()?.channelData;
        setData((prev) => ({
          ...prev,
          id: projectId,
          projectUrl: projectUrl,
          viewCount: projData.viewCount,
          likeCount: projData.likeCount,
          commentCount: projData.commentCount,
          bannerData: {
            desktop: {
              url:
                data.bannerData?.desktop?.url ??
                'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-1.png?alt=media&token=0d6534ee-b7e5-4603-b02e-3677845e5744',
            },
            mobile: {
              url:
                data.bannerData?.mobile?.url ??
                'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243',
            },
          },
          description: data.description ?? '',
          blog: data.blog ?? '',
          facebook: data.facebook ?? '',
          homepage: data.homepage ?? '',
          information: data.information ?? '',
          instagram: data.instagram ?? '',
          shop: data.shop ?? '',
          thumbnail:
            data.thumbnail ||
            'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/assets%2FdummyImage%2FMale_Avatar.jpg?alt=media&token=3da72a35-69f4-4f05-a46c-0dbef2623311',
          title: data.title ?? 'Untitled',
          x: data.x ?? '',
        }));
      }

      if (snap3.size > 0) {
        const exhibitions = [] as any;
        snap3.forEach((doc) => {
          exhibitions.push({ value: doc.id, type: 'onthewall' });
        });
        setData((prev) => ({ ...prev, exhibitions }));
      } else {
        setData((prev) => ({ ...prev, exhibitions: [] }));
      }
    });
  }, []);

  return (
    <Container>
      <Header>
        <HeaderTitle
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          {t('Channel Setting')}{' '}
          <InfoIcon
            sx={{ margin: '0 5px', width: '16px', color: '#6a6a6a', cursor: 'pointer' }}
            onMouseEnter={() => {
              setHover(true);
            }}
          />
          {hover ? (
            <HelperTxt>
              {t(
                'It is a concept of a mini-site where all the exhibitions published by users are gathered and where the exhibitions are managed and made public.'
              )}
            </HelperTxt>
          ) : null}
        </HeaderTitle>

        <Buttons>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setChannelSetting(true);
            }}
          >
            <SettingsIcon sx={{ marginRight: '5px' }} />
            {t('Setting')}
          </Button>
        </Buttons>
      </Header>
      <Contents>
        <EmptySpace height={50} />
        <Banner bannerData={data.bannerData} />
        <EmptySpace height={40} />
        <ChannelHeader data={data} />
        <EmptySpace height={50} />
        <Tabs value={tab} setValue={setTab} />
        {tab === 0 ? <ExhibitionList data={data} /> : <Information data={data} />}
      </Contents>
      {channelSetting && (
        <ChannelSettingModal
          open={channelSetting}
          onClose={() => {
            setChannelSetting(false);
          }}
          data={data}
          setData={setData}
        />
      )}
    </Container>
  );
}

export default ChannelSetting;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
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
const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;

const Contents = styled.div`
  width: 100%;
  padding: 0 15px;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
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
