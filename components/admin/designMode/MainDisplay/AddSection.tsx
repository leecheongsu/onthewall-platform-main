import React, { useEffect } from 'react';

// data
import { getExhibitions } from '@/api/firestore/getExhibitions';
import { Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, where, getDoc, doc } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';
import ShortUniqueId from 'short-unique-id';

// style
import styled from '@emotion/styled';

// mui
import Modal from '@/components/Modal';
import AddSectionCategory from './AddSectionCategory';

// components
import AddBannerModal from '@/components/admin/designMode/Modals/AddBannerModal';
import AddVideoModal from '@/components/admin/designMode/Modals/AddVideoModal';
import AddGroupExhibitionModal from '@/components/admin/designMode/Modals/AddGroupModal';
import AddGroupChannelModal from '@/components/admin/designMode/Modals/AddChannelModal';

type Props = {
  order: number;
  data: any;
  setData: (data: any) => void;
  idx?: number;
};

function AddSection({ order, data, setData, idx }: Props) {
  const { i18n, t } = useTranslation();
  const [isActive, setIsActive] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [openCategory, setOpenCategory] = React.useState(false);
  const [category, setCategory] = React.useState('');

  const onClickOpenHandler = () => {
    setOpenCategory(true);
  };

  const onCancelHandler = () => {
    setOpen(false);
  };

  const onClickCategoryHandler = (type: string) => {
    setCategory(type);
    setOpenCategory(false);
    setOpen(true);
  };
  const onCloseCategoryHandler = () => {
    setOpenCategory(false);
    setIsActive(false);
  };

  const onClickSaveHandler = () => {
    console.log('save data', order, category);
    setOpen(false);
  };

  useEffect(() => {
    if (category === 'Blank') {
      const newData = {
        type: 'BLANK',
        order: order ?? data.order,
        isDeleted: false,
        updatedAt: Timestamp.now(),
        heigh: 60,
        id: new ShortUniqueId().randomUUID(6),
      };
      setData([...data, newData]);
      setCategory('');
    }
    // 그룹채널 기능이 생기면 사라질 예정 (원클릭 추가만 여기서 함)
    if (category === 'GroupChannel') {
      const fetchGroupChannels = async () => {
        const p1 = getDoc(doc(db, 'Project', 'YCx7IQtPJsz8q6gaCC0E'));
        const p2 = getDoc(doc(db, 'ProjectDesign', 'YCx7IQtPJsz8q6gaCC0E'));
        const p3 = getDoc(doc(db, 'Project', 'V5IstMz9GTHdhM1kvKEr'));
        const p4 = getDoc(doc(db, 'ProjectDesign', 'V5IstMz9GTHdhM1kvKEr'));

        const res = await Promise.all([p1, p2, p3, p4]);
        const channels = [
          { ...res[0].data(), ...res[1].data()!.channelData },
          { ...res[2].data(), ...res[3].data()!.channelData },
        ];

        const newData = {
          title: 'Group Channels',
          description: 'Group Channels',
          type: 'GROUP_CHANNEL',
          order: order ?? data.order,
          isDeleted: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          channels,
          id: new ShortUniqueId().randomUUID(6),
        };

        setData((prev: any) => [...prev, newData]);
        setCategory('');
      };

      fetchGroupChannels();
    }
    if (category === 'RecentExhibition') {
      const RecentExhibition = async () => {
        await getExhibitions().then((data: any) => {
          const exhibitionsData = data.map((item: any) => ({
            value: item.id,
            type: 'onthewall',
          }));
          const newData = {
            title: 'Recent Exhibitions',
            description: 'Recent Exhibitions',
            type: 'RECENT_EXHIBITION',
            order: order ?? data.order,
            isDeleted: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            exhibitions: exhibitionsData,
            layout: 'GalleryA',
            id: new ShortUniqueId().randomUUID(6),
          };
          setData((prev: any) => [...prev, newData]);
        });
        setCategory('');
      };
      RecentExhibition();
    }
    if (category === 'RecentChannel') {
      const RecentChannel = async () => {
        const projectsRef = collection(db, 'Project');
        const q = query(projectsRef, where('tier', 'in', ['personal', 'business']));

        try {
          const querySnapshot = await getDocs(q);
          const projectList = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter((project: any) => project.currentExhibitionCount >= 2 && project.likeCount >= 50);

          const channelDataPromises = projectList.map(async (project) => {
            const projectDesignRef = doc(db, 'ProjectDesign', project.id);
            const docSnapshot = await getDoc(projectDesignRef);

            if (docSnapshot.exists()) {
              const docData = docSnapshot.data();
              return {
                ...project,
                ...docData.channelData,
              };
            } else {
              console.error(`Document with id ${project.id} does not exist.`);
              return project;
            }
          });

          const updatedProjects = await Promise.all(channelDataPromises);

          const newData = {
            title: 'Recent Channels',
            description: 'Recent Channels',
            type: 'RECENT_CHANNEL',
            order: order ?? data.order,
            isDeleted: false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            channel: updatedProjects,
            id: new ShortUniqueId().randomUUID(6),
          };

          setData((prev: any) => [...prev, newData]);
        } catch (error) {
          console.error('Error fetching projects:', error);
        }

        setCategory('');
      };

      RecentChannel();
    }
    if (category === 'PopularMonthly' || category === 'PopularAnnual') {
      const isMonthly = category === 'PopularMonthly';
      const timeFrame = isMonthly ? 1 : 12;

      const dateThreshold = Timestamp.fromDate(new Date(new Date().setMonth(new Date().getMonth() - timeFrame)));
      const q1 = query(
        collection(db, 'Exhibition'),
        where('isDeleted', '==', false),
        where('version', '==', 2),
        where('projectTier', '!=', 'enterprise'),
        where('publishedAt', '>=', dateThreshold),
        where('views.totalView', '>=', 50),
        orderBy('views.totalView', 'desc')
      );

      const fetchPopularExhibitions = async () => {
        const snapshot = await getDocs(q1);
        const exhibitions = [] as any;
        snapshot.forEach((doc) => {
          exhibitions.push({ value: doc.id, type: 'onthewall' });
        });

        const newData = {
          title: 'Popular Exhibition of the ' + (isMonthly ? 'Month' : 'Year'),
          description: isMonthly
            ? 'Check out this month popular exhibitions that captured the hearts of visitors.'
            : 'The most popular exhibition that shined this year! Come see it now!',
          type: 'POPULAR_EXHIBITION',
          dueDate: isMonthly ? 'monthly' : 'annual',
          order: order ?? data.order,
          isDeleted: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          exhibitions,
          layout: isMonthly ? 'GalleryA' : 'GalleryB',
          id: new ShortUniqueId().randomUUID(6),
        };
        setData((prev: any) => [...prev, newData]);
        setCategory('');
      };

      fetchPopularExhibitions();
    }
  }, [category]);

  return (
    <>
      <Position>
        <Container
          isActive={isActive || openCategory}
          onMouseEnter={() => (data.length !== 0 ? setIsActive(true) : '')}
          onMouseLeave={() => (data.length !== 0 ? setIsActive(false) : '')}
        >
          <Divider />
          <AddIcon onClick={onClickOpenHandler}>+</AddIcon>
          <Divider />
        </Container>
        <AddSectionCategory onClick={onClickCategoryHandler} open={openCategory} onClose={onCloseCategoryHandler} />
      </Position>
      {category === 'Banner' && (
        <AddBannerModal open={open} onClose={onCancelHandler} data={data} setData={setData} order={idx} />
      )}
      {category === 'Video' && (
        <AddVideoModal open={open} onClose={onCancelHandler} data={data} setData={setData} order={idx} />
      )}
      {category === 'GroupExhibition' && (
        <AddGroupExhibitionModal open={open} onClose={onCancelHandler} data={data} setData={setData} order={idx} />
      )}
      {/* 언젠가 다시 살아날수도... */}
      {/* {category === 'GroupChannel' && (
        <AddGroupChannelModal open={open} onClose={onCancelHandler} data={data} setData={setData} order={idx} />
      )} */}
    </>
  );
}

export default AddSection;

const Container = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-around;
  height: ${({ isActive }) => (isActive ? '80px' : '20px')};
  transition: all 0.3s;
  opacity: ${({ isActive }) => (isActive ? '1' : '0')};
  position: relative;
`;
const AddIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  background-color: #eee;
  transition: all 0.3s;
  &:hover {
    background-color: #ddd;
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #8e8e8e;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  width: calc(50% - 100px);
`;

const Position = styled.div`
  position: relative;
`;
