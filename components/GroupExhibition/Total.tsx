import React, { useEffect, useState } from 'react';

// data
import { moduleApis } from '@/api/module';

// store
import { useMobileViewStore } from '@/store/mobile';
import { useProjectStore } from '@/store/project';

//lib
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useTranslation } from 'react-i18next';

// styles
import styled from '@emotion/styled';

// comp
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import GalleryA from './GalleryType/GalleryA';
import { EmptyItem } from '../EmptyItem';

interface Props {}

const Total = ({}: Props) => {
  const { t } = useTranslation();
  const { mobileView } = useMobileViewStore();
  const { projectId, channelName } = useProjectStore((state) => state);

  const [isLoading, setLoading] = useState<boolean>(true);
  const [selectedSort, setSelectedSort] = useState<string>('latest');

  const [data, setData] = useState<{
    title: string;
    description: string;
    exhibitions: any[];
    layout?: string;
  }>({
    title: t('Exhibition List'),
    description: t('You can see the {{channelName}} exhibition', { channelName }),
    exhibitions: [],
    layout: 'GalleryA',
  });

  const onChangeSort = (e: SelectChangeEvent) => {
    setSelectedSort(e.target.value);
  };

  const sortExhibitions = () => {
    let sortedData: any = [];
    switch (selectedSort) {
      case 'latest':
        sortedData = data.exhibitions?.slice().sort((a: any, b: any) => b.publishedAt - a.publishedAt);
        break;
      case 'Alphabetical':
        sortedData = data.exhibitions?.slice().sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
      case 'like':
        sortedData = data.exhibitions?.slice().sort((a: any, b: any) => b.like - a.like);
        break;
      case 'view':
        sortedData = data.exhibitions?.slice().sort((a: any, b: any) => b.views.totalView - a.views.totalView);
        break;
      default:
        sortedData = data.exhibitions?.slice().sort((a: any, b: any) => a.title.localeCompare(b.title));
        break;
    }
    setData((prev) => ({
      ...prev,
      exhibitions: sortedData,
    }));
  };

  useEffect(() => {
    if (!projectId) return;
    const filter =
      selectedSort === 'latest'
        ? 'publishedAt'
        : selectedSort === 'like'
        ? 'like'
        : selectedSort === 'view'
        ? 'totalView'
        : 'title';
    moduleApis.getExhibitionsByProjectId(projectId, filter, 200, 1, 'main').then((res) => {
      setData((prev) => ({
        ...prev,
        exhibitions: res.data.exhibitions,
      }));
    });
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [projectId, selectedSort]);

  useEffect(() => {
    sortExhibitions();
  }, [selectedSort]);

  return (
    <>
      <Box mobileView={mobileView}>
        <div>
          <CardTitle mobileView={mobileView}>{data.title}</CardTitle>
          <CardDesc mobileView={mobileView}>{data.description}</CardDesc>
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
      {!isLoading && data.exhibitions?.length === 0 ? (
        <div style={{ padding: '20px' }}>
          <EmptyItem />
        </div>
      ) : (
        <GalleryA exhibitions={data.exhibitions} hasMore={false} />
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
