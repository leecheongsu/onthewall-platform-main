import React, { useEffect, useState } from 'react';

// data
import { getExhibitions } from '@/api/firestore/getExhibitions';

// store
import { useMobileViewStore } from '@/store/mobile';

// lib
import InfiniteScroll from 'react-infinite-scroll-component';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTranslation } from 'react-i18next';

// styles
import styled from '@emotion/styled';

// mui
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';

// components
import { EmptyItem } from '@/components/EmptyItem';
import GalleryA from '@/components/GroupExhibition/GalleryType/GalleryA';

interface Props {}

const Total = ({}: Props) => {
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const title = t('Recent Exhibition');
  const description = t('Come see trendy works in the ongoing');

  const [exhibitions, setExhibitions] = useState([]);

  const [isLoading, setLoading] = useState<boolean>(true);
  const [selectedSort, setSelectedSort] = useState<string>('latest');

  const onChangeSort = (e: SelectChangeEvent) => {
    setSelectedSort(e.target.value);
  };

  const sortExhibitions = () => {
    let sortedData: any = [];
    switch (selectedSort) {
      case 'latest':
        sortedData = exhibitions?.slice().sort((a: any, b: any) => b.createdAt - a.createdAt);
        break;
      case 'alphabetical':
        sortedData = exhibitions?.slice().sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
      case 'like':
        sortedData = exhibitions?.slice().sort((a: any, b: any) => b.like - a.like);
        break;
      case 'view':
        sortedData = exhibitions?.slice().sort((a: any, b: any) => b.views.totalView - a.views.totalView);
        break;
      default:
        sortedData = exhibitions?.slice().sort((a: any, b: any) => b.createdAt - a.createdAt);
        break;
    }
    setExhibitions(sortedData);
  };

  useEffect(() => {
    const fetchData = async () => {
      await getExhibitions().then((data: any) => {
        data.sort((a: any, b: any) => {
          return b.createdAt - a.createdAt;
        });
        setExhibitions(data);
      });
    };
    fetchData();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (exhibitions) sortExhibitions();
  }, [selectedSort]);

  return (
    <>
      <Box mobileView={mobileView}>
        <div>
          <CardTitle mobileView={mobileView}>{title}</CardTitle>
          <CardDesc mobileView={mobileView}>{description}</CardDesc>
        </div>
        <FormControl variant="outlined" size="small" sx={{ width: '140px' }}>
          <InputLabel id="select">Sort</InputLabel>
          <Select
            labelId="select"
            value={selectedSort}
            label="sort"
            autoWidth
            onChange={onChangeSort}
            MenuProps={{ disableScrollLock: true }}
          >
            <MenuItem value="latest">{t('Latest')}</MenuItem>
            <MenuItem value="like">{t('Like')}</MenuItem>
            <MenuItem value="view">{t('View')}</MenuItem>
            <MenuItem value="alphabetical">{t('Alphabetical')}</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {!isLoading && exhibitions?.length === 0 ? (
        <div style={{ padding: '20px' }}>
          <EmptyItem />
        </div>
      ) : (
        <GalleryA exhibitions={exhibitions} hasMore={false} />
      )}
    </>
  );
};

export default Total;

const Box = styled.div<{ mobileView?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-direction: ${(props) => (props.mobileView ? 'column' : 'row')};
  align-items: ${(props) => (props.mobileView ? 'flex-start' : 'flex-end')};
  & .MuiFormControl-root {
    width: ${(props) => (props.mobileView ? '100%' : '140px')};
    margin-top: ${(props) => (props.mobileView ? '10px' : '0')};
  }
  @media (max-width: 500px) {
    width: 100%;
    margin-top: 10px;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    & .MuiFormControl-root {
      width: 100%;
    }
  }
`;

const CardTitle = styled.div<{ mobileView?: boolean }>`
  line-height: 1;
  letter-spacing: -1px;
  font-weight: 700;
  color: #363636;
  font-size: ${(props) => (props.mobileView ? '1.25rem' : '1.5rem')};
  margin-bottom: 10px;
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CardDesc = styled.div<{ mobileView?: boolean }>`
  color: #94a3b8;
  font-size: ${(props) => (props.mobileView ? '0.85rem' : '1rem')};
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;
