'use client';

// react
import React, { useState, useEffect } from 'react';

// data
import { moduleApis, moduleActionApis } from '@/api/module';
import { getExhibitionUsageInfo } from '@/api/firestore/getProject';

// store
import { useUserStore } from '@/store/user';
import { useDesignStore } from '@/store/design';
import { useProjectStore } from '@/store/project';

// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { InputBase } from '@mui/material';

// icons
import SearchIcon from '@/images/icons/Search';
import InfoIcon from '@mui/icons-material/Info';

// comp
import PrevExhibitionList from '@/app/[projectUrl]/manage/previous-exhibitions/components/PrevExhibitionList';
import { EmptyItem } from '@/components/EmptyItem';

interface Props {}

function Page({}: Props) {
  const { t } = useTranslation();
  const { projectId } = useProjectStore();
  const { uid } = useUserStore();
  const { theme } = useDesignStore();

  const [data, setData] = useState<any>({});

  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchText, setSearchText] = useState('');

  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);

  const fetchData = async () => {
    moduleApis.getExhibitionsByUserId(uid).then((res) => {
      setData(res.data);
    });
  };

  // 검색
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // 삭제
  const handleDelete = async (exhibitionId: string) => {
    moduleActionApis.deleteExhibition(exhibitionId).then(() => {
      fetchData();
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!data.exhibitions) return;
    // 검색 필터링

    const filterByVersion = (exhibitions: Exhibition[]) => exhibitions.filter((v) => v.version === 1.0);

    const filterBySearchText = (exhibitions: Exhibition[], searchText: string) =>
      searchText ? exhibitions.filter((v) => v.title.toLowerCase().includes(searchText.toLowerCase())) : exhibitions;

    const filteredExhibitions = filterBySearchText(filterByVersion(data.exhibitions), searchText);
    setFilteredData(filteredExhibitions);
  }, [searchText, data]);

  useEffect(() => {
    getExhibitionUsageInfo(projectId);
  }, []);

  return (
    <>
      <Container>
        <Box>
          <Title
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            {t('Previous Exhibitions')}
            <InfoIcon
              sx={{ margin: '0 5px', width: '16px', color: '#6a6a6a', cursor: 'pointer' }}
              onMouseEnter={() => {
                setHover(true);
              }}
            />
            {hover ? (
              <HelperTxt>
                {t('You can manage the display status of previous versions (onthwall) (activate, delete, etc.).')}
              </HelperTxt>
            ) : null}
          </Title>

          <Search>
            <SearchBar theme={theme.primary}>
              <SearchIcon className="w-5 h-5" />
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={t('Search...')}
                value={searchText}
                onChange={handleSearchChange}
              />
            </SearchBar>
          </Search>

          {data.exhibitions?.length === 0 ? (
            <EmptyItem />
          ) : (
            <PrevExhibitionList
              exhibitionData={filteredData}
              onDelete={handleDelete}
              loading={loading}
              onFetch={fetchData}
            />
          )}
        </Box>
      </Container>
    </>
  );
}

export default Page;

const Container = styled.div`
  height: 100%;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const Box = styled.div`
  text-align: center;
  padding: 30px;
  position: relative;
`;

const Title = styled.h2`
  width: fit-content;
  text-align: left;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: flex-start;
`;

const Search = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.div<{ theme: any }>`
  border: 1px solid ${(props) => props.theme};
  border-radius: 6px;
  padding: 6px 10px 3px 10px;
  display: flex;
  align-items: center;
  background-color: #fff;
  & input {
    font-size: 14px;
  }
  & svg {
    color: ${(props) => props.theme};
  }
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
