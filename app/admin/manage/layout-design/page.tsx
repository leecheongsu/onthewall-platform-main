'use client';
import React, { useEffect } from 'react';
import MainDisplay from '@/components/admin/designMode/MainDisplay';
import OrderController from '@/components/manage/designMode/OrderController';
import { Button } from '@mui/material';
import styled from '@emotion/styled';
import HomeEditModal from '@/components/manage/designMode/Modals/HomeEditModeModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
  updateDoc,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { getGlobalMetadata, getGlobalSection } from '@/api/firestore/global/getGlobalData';
import { KEY } from '@/constants/globalDesign';
import { Switch, SwitchProps } from '@mui/material';
import { styled as muiStyled } from '@mui/material/styles';
import { FormControlLabel, FormGroup } from '@mui/material';
import { useMobileViewStore } from '@/store/mobile';

type Props = {};

function page({}: Props) {
  const { i18n, t } = useTranslation();
  const { mobileView, setMobileView } = useMobileViewStore();

  const [openHomeEditModal, setOpenHomeEditModal] = React.useState(false);
  const [globalData, setGlobalData] = useState<any>(null);
  const [globalDesign, setGlobalDesign] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const openHomeEditModalHandler = () => {
    setOpenHomeEditModal(true);
  };

  const fetchData = async () => {
    try {
      const data = await getGlobalSection(KEY);
      const global = await getGlobalMetadata(KEY);
      if (data) fetchData2();
      if (global) setGlobalData(global);
    } catch (error) {
      console.error('Error fetching section: ', error);
    }
  };

  const fetchData2 = async () => {
    const onthewallDocRef = doc(collection(db, 'GlobalDesign'), KEY);
    const sectionCollectionRef = collection(onthewallDocRef, 'Section');

    const q1 = query(sectionCollectionRef, where('isDeleted', '==', false));
    const snapshot = await getDocs(q1);
    const sections = snapshot.docs.map((doc) => doc.data());

    const updatedSections = await Promise.all(
      sections.map(async (section) => {
        if (section.exhibitions && Array.isArray(section.exhibitions)) {
          const exhibitionsData = await Promise.all(
            section.exhibitions.map(async (exhibition: any) => {
              if (exhibition.type === 'onthewall') {
                const exhibitionDocRef = doc(db, 'Exhibition', exhibition.value);
                const exhibitionDoc = await getDoc(exhibitionDocRef);

                if (exhibitionDoc.exists()) {
                  return {
                    ...exhibitionDoc.data(),
                    type: exhibition.type,
                    value: exhibition.value,
                  };
                }
              }
              return {
                type: exhibition.type,
                imageUrl: exhibition.imageUrl,
                title: exhibition.title,
                url: exhibition.url,
              };
            })
          );

          return {
            ...section,
            exhibitions: exhibitionsData.filter((exhibition) => exhibition !== null),
          };
        }
        return section;
      })
    );

    setGlobalDesign(updatedSections);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    //console.log('🔥Current List🔥', globalDesign);
  }, [globalDesign]);

  useEffect(() => {
    if (isSaving) {
      saveData();
    }
  }, [isSaving]);

  const handleMobileButton = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMobileView();
  };

  // 타입별로 데이터 만들기
  const createData = (section: any) => {
    // 기본 필드

    let data: any = {
      id: section.id,
      type: section.type,
      order: section.order,
      isDeleted: section.isDeleted,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    };

    switch (section.type) {
      case 'BANNER':
        data = {
          ...data,
          desktop: {
            url: section.desktop.url || '',
            height: section.desktop.height || '',
          },
          hasLink: section.hasLink ?? false,
          hasMobile: section.hasMobile ?? false,
          linkUrl: section.linkUrl || '',
          mobile: {
            url: section.mobile.url || '',
            height: section.mobile.height || '',
          },
          type: 'BANNER',
          clickActionType: section.clickActionType || '',
          downloadUrl: section.downloadUrl || '',
        };
        break;

      case 'VIDEO':
        data = {
          ...data,
          videoUrl: section.videoUrl || '',
          type: 'VIDEO',
        };
        break;
      case 'BLANK':
        data = {
          ...data,
          height: section?.height || 60,
          type: 'BLANK',
        };
        break;

      case 'GROUP_EXHIBITION':
        data = {
          ...data,
          description: section.description || '',
          exhibitions:
            section.exhibitions.map((item: any) => {
              if (item.type === 'link') {
                return {
                  imageUrl: item.imageUrl || '',
                  title: item.title || '',
                  type: item.type,
                  url: item.url || '',
                };
              } else {
                return {
                  value: item.value,
                  type: item.type,
                };
              }
            }) || [],
          layout: section.layout || '',
          title: section.title || '',
          type: 'GROUP_EXHIBITION',
        };
        break;

      case 'RECENT_EXHIBITION':
        data = {
          ...data,
          description: section.description || '',
          layout: section.layout || '',
          title: section.title || '',
          type: 'RECENT_EXHIBITION',
        };
        break;

      case 'RECENT_CHANNEL':
        data = {
          ...data,
          description: section?.description || '',
          layout: section?.layout || '',
          title: section?.title || '',
          type: 'RECENT_CHANNEL',
        };
        break;

      case 'GROUP_CHANNEL':
        data = {
          ...data,
          title: section.title || '',
          description: section.description || '',
          layout: section.layout || '',
          type: 'GROUP_CHANNEL',
        };
        break;

      case 'POPULAR_EXHIBITION':
        data = {
          ...data,
          description: section?.description || '',
          layout: section?.layout || '',
          title: section?.title || '',
          type: 'POPULAR_EXHIBITION',
          dueDate: section?.dueDate || '',
        };
        break;

      default:
        console.error(`Unknown type: ${section.type}`);
        break;
    }

    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        data[key] = null;
      }
    });

    return data;
  };

  const onClickSave = async () => {
    try {
      setIsSaving(true); // 저장 작업 시작
    } catch (error) {
      console.error('Error initiating save: ', error);
    }
  };

  const saveData = async () => {
    try {
      const sectionsRef = collection(db, 'GlobalDesign', KEY, 'Section');
      const specialExhibitionsRef = collection(db, 'SpecialExhibitionList');

      const newSectionIds: { [key: string]: string } = {};

      for (const section of globalDesign) {
        let data = createData(section);
        const docRef = doc(db, 'GlobalDesign', KEY, 'Section', section.id);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, { ...data });

          if (section.type === 'GROUP_EXHIBITION') {
            const specialDocRef = doc(specialExhibitionsRef, section.id);
            await updateDoc(specialDocRef, { ...data });
          }
        } else {
          const newDocRef = await addDoc(sectionsRef, data);
          const newId = newDocRef.id;
          await setDoc(newDocRef, { ...data, id: newId });
          newSectionIds[section.id] = newId;

          if (section.type === 'GROUP_EXHIBITION') {
            const specialDocRef = doc(specialExhibitionsRef, newId);
            await setDoc(specialDocRef, { ...data, id: newId });
          }
        }
      }

      setGlobalDesign((prev) =>
        prev.map((section) => (newSectionIds[section.id] ? { ...section, id: newSectionIds[section.id] } : section))
      );

      setIsSaving(false); // 저장 작업 완료
      alert(t('Saved successfully.'));
    } catch (error) {
      console.error('Error writing document: ', error);
    }
  };

  return (
    <>
      <Container>
        <Header>
          <HeaderTitle>{t('Layout & Design')}</HeaderTitle>
          <Buttons>
            <FormGroup>
              <FormControlLabel
                control={<IOSSwitch sx={{ m: 1 }} checked={mobileView} onChange={handleMobileButton} />}
                label={t('Mobile View')}
              />
            </FormGroup>
            <Button variant="outlined" onClick={openHomeEditModalHandler}>
              {t('Site Settings')}
            </Button>
            <Button variant="contained" onClick={onClickSave}>
              {t('Save')}
            </Button>
          </Buttons>
        </Header>
        <MainDisplay data={globalDesign.filter((data) => !data.isDeleted)} setData={setGlobalDesign} />
        <OrderController data={globalDesign.filter((data) => !data.isDeleted)} setData={setGlobalDesign} />
      </Container>
      {openHomeEditModal && (
        <HomeEditModal
          open={openHomeEditModal}
          onClose={() => {
            setOpenHomeEditModal(false);
          }}
          globalData={globalData}
          setGlobalData={setGlobalData}
        />
      )}
    </>
  );
}

export default page;

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
  width: 1200px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: -1px;
`;
const Buttons = styled.div`
  display: flex;
  gap: 10px;
`;

const IOSSwitch = muiStyled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#1565c0' : '#1565c0',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#1565c0',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));
