import React, { useEffect, useState } from 'react';

// lib
import { useTranslation } from 'react-i18next';
import ShortUniqueId from 'short-unique-id';

// style
import styled from '@emotion/styled';

// mui
import Modal from '@/components/Modal';
import AddSectionCategory from './AddSectionCategory';

// components
import AddBannerModal from '@/components/manage/designMode/Modals/AddBannerModal';
import AddVideoModal from '@/components/manage/designMode/Modals/AddVideoModal';
import AddGroupExhibitionModal from '@/components/manage/designMode/Modals/AddGroupModal';

type Props = {
  order: number;
  data: any;
  setData: (data: any[]) => void;
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
        updatedAt: Date.now(),
        heigh: 60,
        id: new ShortUniqueId().randomUUID(6),
      };
      setData([...data, newData]);
    }
  }, [category]);

  return (
    <>
      <Position>
        <Container
          isActive={isActive || openCategory}
          emptyData={data.length === 0}
          onMouseEnter={() => (data.length !== 0 ? setIsActive(true) : '')}
          onMouseLeave={() => (data.length !== 0 ? setIsActive(false) : '')}
        >
          <Divider />
          <AddIcon onClick={onClickOpenHandler}>+</AddIcon>
          <Divider />
        </Container>
        <AddSectionCategory
          onClick={onClickCategoryHandler}
          open={openCategory}
          onClose={onCloseCategoryHandler}
          idx={idx}
        />
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
    </>
  );
}

export default AddSection;

const Container = styled.div<{ isActive: boolean; emptyData: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-around;
  height: ${({ isActive, emptyData }) => (isActive || emptyData ? '80px' : '20px')};
  transition: all 0.3s;
  opacity: ${({ isActive, emptyData }) => (isActive || emptyData ? '1' : '0')};
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
