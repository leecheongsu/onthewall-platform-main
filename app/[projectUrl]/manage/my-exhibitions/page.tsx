'use client';

// react
import React, { useState, useEffect, useCallback } from 'react';

// data
import { moduleApis, moduleActionApis } from '@/api/module';
import { getExhibitionUsageInfo, subtractExhibitionCount } from '@/api/firestore/getProject';

// store
import { useUserStore } from '@/store/user';
import { useDesignStore } from '@/store/design';
import { useProjectStore } from '@/store/project';
import { getUserInfo } from '@/api/firestore/getUsers';
import { useRouter } from 'next/navigation';

// lib
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';

// mui
import { Grid, InputBase, Button } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

// icons
import SearchIcon from '@/images/icons/Search';
import CheckIcon from '@/images/icons/Check';
import GridViewSharpIcon from '@mui/icons-material/GridViewSharp';
import ViewStreamSharpIcon from '@mui/icons-material/ViewStreamSharp';
import InfoIcon from '@mui/icons-material/Info';

// comp
import ExhibitionCard from '@/app/[projectUrl]/manage/my-exhibitions/components/exhibitionCard';
import ExhibitionList from '@/app/[projectUrl]/manage/my-exhibitions/components/exhibitionList';
import { EmptyItem } from '@/components/EmptyItem';
import withAuth from '@/components/hoc/withAuth';
import { ACCESS_ALL_PROJECT, DENY_USER } from '@/constants/acess';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Props {}

function Page({}: Props) {
  const router = useRouter();
  const { t } = useTranslation();
  const { projectUrl, projectId, isExpired } = useProjectStore();
  const { uid, status, projectsMap } = useUserStore();
  const { theme } = useDesignStore();

  const [data, setData] = useState<any>({ exhibitions: [] });
  const [current, setCurrent] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchText, setSearchText] = useState('');

  const [successCopy, setSuccessCopy] = useState(false);
  const [linkEmbed, setLinkEmbed] = useState('');
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);

  const [exhibitionCount, setExhibitionCount] = useState({
    adminExhibitionCount: 0,
    currentExhibitionCount: 0,
    assignedExhibitionCount: 0,
    exhibitionLimit: 0,
  });

  // select list type
  const [selectedItem, setSelectedItem] = useState({
    icon: <GridViewSharpIcon />,
    text: 'Gallery Type',
  });

  // modify open
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // const fetchData = async () => {
  //   moduleApis.getExhibitionsByUserId(uid).then((res) => {
  //     setData(res.data);
  //   });

  //   // 전체 전시회 수
  //   getUserInfo(uid).then((res: any) => {
  //     setTotal(res?.exhibitionCount ?? 0);
  //   });
  // };

  // 검색
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // 삭제
  const handleDelete = async (exhibitionId: string) => {
    const p1 = moduleActionApis.deleteExhibition(exhibitionId);
    const p2 = subtractExhibitionCount(projectId, status);
    await Promise.all([p1, p2]).then(() => {
      if (status === 'general' && projectsMap[projectId]?.status === 'user') {
        setCurrent((prev) => prev - 1);
      } else {
        getExhibitionUsageInfo(projectId).then((res: any) => {
          setExhibitionCount(res);
        });
      }

      // fetchData();
    });
  };

  const onClickExhibition = () => {
    router.push(`/${projectUrl}/manage/my-exhibitions/register`);
  };

  const isNewExhibitionDisabled = useCallback(() => {
    if (isExpired) true;

    if (status === 'superadmin') {
      return false;
    }

    if (status === 'general') {
      if (projectsMap[projectId]?.status === 'admin' || projectsMap[projectId]?.status === 'owner') {
        const { adminExhibitionCount, assignedExhibitionCount, exhibitionLimit } = exhibitionCount;

        return adminExhibitionCount + assignedExhibitionCount >= exhibitionLimit;
      } else {
        return current >= total;
      }
    }
  }, [exhibitionCount, isExpired, status]);

  const handleMenuItemClick = (icon: any, text: string) => {
    setSelectedItem({ icon, text });
    handleClose();
    sessionStorage.setItem('listType', text);
  };

  useEffect(() => {
    setLoading(true);

    const q = query(
      collection(db, 'Exhibition'),
      where('uid', '==', uid),
      where('isDeleted', '==', false),
      where('version', '==', 2),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // Handle the case where no data is returned
          setData({ exhibitions: [] });
          setTotal(0);
          setLoading(false);
          return;
        }

        const exhibitions = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            ...doc.data(),
            createdAt: { _nanoseconds: doc.data().createdAt.nanoseconds, _seconds: doc.data().createdAt.seconds },
            publishedAt: doc.data().publishedAt
              ? { _nanoseconds: doc.data().publishedAt.nanoseconds, _seconds: doc.data().publishedAt.seconds }
              : null,
          };
        });

        setData({ exhibitions });
        setTotal(snapshot.size);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching exhibitions:', error);
        setLoading(false); // Stop loading in case of an error
      }
    );

    const savedListType = sessionStorage.getItem('listType');

    if (savedListType) {
      const icon = savedListType === 'Gallery Type' ? <GridViewSharpIcon /> : <ViewStreamSharpIcon />;

      setSelectedItem({
        icon,
        text: savedListType,
      });
    }

    return () => {
      unsubscribe();
    };
  }, [uid]);

  useEffect(() => {
    if (!data?.exhibitions) {
      return;
    }
    // 검색 필터링

    const filteredData = searchText
      ? data.exhibitions.filter((exhibition: any) => exhibition.title.toLowerCase().includes(searchText.toLowerCase()))
      : data.exhibitions?.filter((exhibition: any) => !exhibition.isDeleted);
    setFilteredData(filteredData);

    //전체, 현재 사용중인 전시회 수
    let current = data.exhibitions?.length;
    setCurrent(current);
  }, [searchText, data]);

  useEffect(() => {
    getExhibitionUsageInfo(projectId).then((res: any) => {
      setExhibitionCount(res);
    });
  }, []);

  // console.log("asd");

  return (
    <>
      <Container>
        <Box>
          <Title
            onMouseLeave={() => {
              setHover(false);
            }}
          >
            {t('My Exhibitions')}
            <InfoIcon
              sx={{ margin: '0 5px', width: '16px', color: '#6a6a6a', cursor: 'pointer' }}
              onMouseEnter={() => {
                setHover(true);
              }}
            />
            {hover ? (
              <HelperTxt>
                {t(
                  'You can customize the basic site information and screen displayed on the main page (sections, banners, adding and removing blank spaces, etc.)'
                )}
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
            <CreateButton disabled={isNewExhibitionDisabled()} variant="contained" onClick={onClickExhibition}>
              + {t('New Exhibition')}
            </CreateButton>
          </Search>

          <CountContainer>
            <Count>
              <p>
                {t('Current Usage')} :{' '}
                {loading
                  ? 0
                  : status === 'general' && projectsMap[projectId]?.status === 'user'
                  ? current
                  : exhibitionCount.adminExhibitionCount + exhibitionCount.assignedExhibitionCount}
              </p>
              <p>
                {t('Total Allowed')} :{' '}
                {loading
                  ? 0
                  : status === 'general' && projectsMap[projectId]?.status === 'user'
                  ? total
                  : exhibitionCount.exhibitionLimit}
              </p>
              <ListTypeMenu>
                <ListButton onClick={handleClick} variant="outlined">
                  {selectedItem.icon}
                  {selectedItem.text}
                </ListButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                  <MenuItem onClick={() => handleMenuItemClick(<ViewStreamSharpIcon />, 'List Type')}>
                    <ListItem>
                      <ViewStreamSharpIcon />
                      {t('List Type')}
                    </ListItem>
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick(<GridViewSharpIcon />, 'Gallery Type')}>
                    <ListItem>
                      <GridViewSharpIcon />
                      {t('Gallery Type')}
                    </ListItem>
                  </MenuItem>
                </Menu>
              </ListTypeMenu>
            </Count>
          </CountContainer>
          {loading ? (
            <LoadingBox>
              <CircularProgress />
            </LoadingBox>
          ) : data.exhibitions.length === 0 ? (
            <EmptyItem />
          ) : selectedItem.text === 'Gallery Type' ? (
            <>
              <Grid container spacing={2} rowGap={2}>
                {filteredData?.map((exhibition: any, idx: any) => {
                  return (
                    <ExhibitionCard
                      exhibitionData={exhibition}
                      key={idx}
                      onDelete={handleDelete}
                      setSuccessCopy={setSuccessCopy}
                      setLinkEmbed={setLinkEmbed}
                      theme={theme}
                      loading={loading}
                    />
                  );
                })}
              </Grid>
            </>
          ) : (
            <>
              <ExhibitionList
                exhibitionData={filteredData}
                onDelete={handleDelete}
                setSuccessCopy={setSuccessCopy}
                setLinkEmbed={setLinkEmbed}
                theme={theme}
                loading={loading}
              />
            </>
          )}
          <CopyBox theme={theme} opacity={successCopy ? 1 : 0}>
            <CheckIcon className="w-4 h-4" />
            <p>{t('Successfully') + ` ${linkEmbed} ` + t('copied')}</p>
          </CopyBox>
        </Box>
      </Container>
    </>
  );
}

export default withAuth(Page, DENY_USER, ACCESS_ALL_PROJECT);

const Container = styled.div`
  height: 100%;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

const Box = styled.div`
  text-align: center;
  padding: 15px;
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

const Count = styled.div`
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  align-items: center;

  & p {
    font-size: 14px;
    font-weight: 500;
    color: #88909c;
  }
`;
const CountContainer = styled.div`
  background-color: white;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 5px;
  margin-bottom: 20px;
  gap: 14px;

  & p {
    font-size: 14px;
    font-weight: 500;
    color: #88909c;
  }
`;

const Search = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.div<{ theme: any }>`
  border: 1px solid ${(props) => props.theme};
  border-radius: 5px;
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

const CopyBox = styled.div<{ theme: any; opacity: number }>`
  position: fixed;
  top: 100px;
  right: 25px;
  border-radius: 20px;
  padding: 7px 15px;
  border: 1px solid ${(props) => props.theme.primary};
  color: ${(props) => props.theme.primary};
  display: flex;
  align-items: center;
  transform: ${(props) => (props.opacity ? 'translateY(-25px)' : 'translateY(0)')};
  transition: all 0.3s ease-in-out;
  opacity: ${(props) => props.opacity};
  background-color: #fff;

  & p {
    margin-left: 10px;
  }
`;

const ListTypeMenu = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ListButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 5px 10px;
  background-color: #fff;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #88909c;

  & svg {
    color: #88909c;
  }

  &:hover {
    color: #115de6;

    & svg {
      color: #115de6;
    }
  }
`;

const LoadingBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  height: 400px;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
`;

const CreateButton = styled(Button)`
  background-color: #115de6;
  :hover {
    background-color: #0f4db6;
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
