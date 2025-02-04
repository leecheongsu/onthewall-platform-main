'use client';
import React, { useEffect, useState } from 'react';

// data
import { Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';

// mui + styled
import styled from '@emotion/styled';
import { Button } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MySpace from './components/MySpace';

// components
import NewSpace from './components/NewSpace';

const defaultImage = `https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243`;

type Props = {};

const page = (props: Props) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [imageData, setImageData] = useState({
    originalImage: { path: '', url: defaultImage },
    thumbnailImage: { path: '', url: defaultImage },
    compressedImage: { path: '', url: defaultImage },
  });

  const [newSpace, setNewSpace] = useState({
    title: '',
    description: '',
    matterportId: '',
    projectUrl: '',
    area: 0,
    maxNumOfPaingting: 0,
    order: 0,
    isDeleted: false,
    isPublic: true,
    thumbnailImg: {
      path: defaultImage,
      url: defaultImage,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const [mySpace, setMySpace] = useState({
    projectUrl: '',
    matterportId: '',
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const a11yProps = (index: any) => {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  };

  const handleSave = async () => {
    if (value === 0) {
      const spaceRef = collection(db, 'Space');
      await addDoc(spaceRef, newSpace);
      alert(t('New Space has been added.'));
    } else {
      const spaceRef = collection(db, 'Space');
      const projectRef = collection(db, 'Project');

      const q = query(projectRef, where('projectUrl', '==', mySpace.projectUrl));
      const projectSnapshot = await getDocs(q);

      if (!projectSnapshot.empty) {
        const projectDoc = projectSnapshot.docs[0];
        const projectId = projectDoc.id;

        const q2 = query(spaceRef, where('matterportId', '==', mySpace.matterportId));
        const spaceSnapshot = await getDocs(q2);

        if (!spaceSnapshot.empty) {
          const spaceDoc = spaceSnapshot.docs[0];
          const spaceId = spaceDoc.id;

          const spaceDocRef = doc(db, 'Space', spaceId);
          await updateDoc(spaceDocRef, {
            projectId: projectId,
          });

          alert(t('My Space has been updated with the project ID.'));
        } else {
          alert(t('No space found with the given Matterport ID.'));
        }
      } else {
        alert(t('No project found with the given project URL.'));
      }
    }
  };

  useEffect(() => {
    setNewSpace({
      ...newSpace,
      thumbnailImg: {
        path: imageData.thumbnailImage.path,
        url: imageData.thumbnailImage.url,
      },
    });
  }, [imageData]);

  return (
    <>
      <Container>
        <Header>
          <Title>{t('Add Space')}</Title>
          <Buttons>
            <Tabs value={value} onChange={handleChange}>
              <Tab label={t('New Space')} {...a11yProps(0)} />
              <Tab label={t('My Space')} {...a11yProps(1)} />
            </Tabs>
            <SaveButton variant="contained" onClick={handleSave}>
              {t('Save')}
            </SaveButton>
          </Buttons>
        </Header>
        <TabContent>
          {value === 0 ? (
            <NewSpace
              initialValues={newSpace}
              setInitialValues={setNewSpace}
              imageData={imageData}
              setImageData={setImageData}
              isLoading={isLoading}
              setLoading={setLoading}
            />
          ) : (
            <MySpace initialValues={mySpace} setInitialValues={setMySpace} />
          )}
        </TabContent>
      </Container>
    </>
  );
};

export default page;

const Container = styled.div`
  max-width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  z-index: 1;
  padding: 0 23px;
  padding-top: 23px;
  background-color: #f1f4f9;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
`;

const Title = styled.h1`
  font-size: 25px;
  font-weight: 600;
  line-height: 32px;
  margin-bottom: 14px;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & .MuiTabs-flexContainer {
    gap: 32px;
    & .MuiButtonBase-root {
      padding: 0;
      text-transform: capitalize;
      font-size: 15px;
      line-height: 24px;
      color: #000;
    }
    & .MuiButtonBase-root.Mui-selected {
      color: #115de6;
    }
    & .MuiTabs-indicator {
      background-color: #115de6;
    }
  }
`;

const TabContent = styled.div`
  padding: 12px;
  & .tabpanel {
    min-width: 640px;
    max-width: 900px;
    padding: 12px;
  }
`;

const SaveButton = styled(Button)`
  background-color: #115de6;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  line-height: 36px;
  font-weight: 500;
  border-radius: 18px;
  :hover {
    background-color: #0a4abf;
  }
`;
