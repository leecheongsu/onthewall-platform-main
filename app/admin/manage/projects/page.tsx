'use client';
import React, { use, useCallback, useEffect, useState } from 'react';
import styled from '@emotion/styled';
import Sheet from '@mui/joy/Sheet';
import Input from '@mui/joy/Input';
import SearchIcon from '@mui/icons-material/Search';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Table from '@mui/joy/Table';
import Chip from '@mui/joy/Chip';
import Avatar from '@mui/joy/Avatar';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import IconButton from '@mui/joy/IconButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/joy/Button';
import { db } from '@/lib/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import ModalBox from '@/components/Modal';
import Loading from '@/app/loading';
import { Actions } from './components/buttons';

const dummyData = [
  {
    id: 1,
    userName: 'John Doe',
    phone: '123-456-7890',
    email: 'john@example.com',
    registrationPath: 'email',
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    userName: 'Jane Smith',
    phone: '987-654-3210',
    email: 'jane@example.com',
    registrationPath: 'google',
    createdAt: '2024-01-05',
  },
  {
    id: 3,
    userName: 'Jim Brown',
    phone: '555-555-5555',
    email: 'jim@example.com',
    registrationPath: 'kakao',
    createdAt: '2024-02-10',
  },
];

const registrationPathToObj = {
  email: { label: 'E-Mail', color: 'primary' },
  kakao: { label: 'KAKAO', color: 'warning' },
  google: { label: 'GOOGLE', color: 'neutral' },
};

function DataTable() {
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('userName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Array<Project>>([]);
  const [data, setData] = useState<Array<Project>>([]);
  const [filteredData, setFilteredData] = useState<Array<Project>>(data);
  const [paginatedData, setPaginatedData] = useState<Array<Project>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<any>({});

  const { t } = useTranslation();
  const MAX_PAGE_BUTTONS = 15; // 최대 페이지 버튼 수
  const [totalPages, setTotalPages] = useState(Math.ceil(data.length / rowsPerPage));
  const [buttonGroup, setButtonGroup] = useState(0); // 페이지 그룹을 추적

  // 페이지 그룹 계산 (한 번에 MAX_PAGE_BUTTONS 만큼만 보여줌)
  const startPage = buttonGroup * MAX_PAGE_BUTTONS;
  const endPage = Math.min(startPage + MAX_PAGE_BUTTONS, totalPages);

  const handleChangePage = (newPage: any) => {
    setPage(newPage);
    if (newPage >= endPage) {
      setButtonGroup(buttonGroup + 1); // 다음 그룹으로 이동
    } else if (newPage < startPage) {
      setButtonGroup(buttonGroup - 1); // 이전 그룹으로 이동
    }
  };

  const handleSort = (property: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Project'), (querySnapshot) => {
      const projects: Array<Project> = [];
      querySnapshot.forEach((doc) => {
        projects.push(doc.data() as Project);
      });
      setProjects(projects);
    });

    // 컴포넌트 언마운트 시 실시간 구독 해제
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sortedData = [...projects].sort((a, b) => {
      if (orderBy === 'channelName') {
        return order === 'asc'
          ? a.channelName?.localeCompare(b.channelName)
          : b.channelName?.localeCompare(a.channelName);
      } else if (orderBy === 'createdAt') {
        return order === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    setData(sortedData);
  }, [projects, order, orderBy]);

  useEffect(() => {
    if (paginatedData.length > 0) {
      setIsLoading(false);
    }
  }, [paginatedData]);

  // 검색어에 따른 데이터 필터링 및 페이지 수 동기화
  useEffect(() => {
    const filtered = data.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.channelName?.toLowerCase().includes(searchLower) || row.projectUrl?.toLowerCase().includes(searchLower)
      );
    });

    const filteredTotalPages = Math.ceil(filtered.length / rowsPerPage);

    // 필터링된 데이터를 별도로 저장
    setFilteredData(filtered);

    // 검색 결과에 맞게 페이지 그룹과 페이지 초기화
    setPage(0); // 검색할 때 페이지를 첫 페이지로 초기화
    setButtonGroup(0); // 페이지 그룹도 첫 그룹으로 초기화
    setPaginatedData(filtered.slice(0, rowsPerPage)); // 첫 페이지에 해당하는 데이터만 설정

    // 페이지 수 업데이트
    setTotalPages(filteredTotalPages); // totalPages를 필터된 데이터에 맞게 업데이트
  }, [searchTerm, data, rowsPerPage]);

  // 페이지 이동 시에도 filteredData 기반으로 데이터 업데이트
  useEffect(() => {
    const _data = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    setPaginatedData(_data);
  }, [filteredData, page, rowsPerPage]);

  const handleClick = (row: Project) => {
    setSelectedData(row);
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setSelectedData({});
  };

  return (
    <>
      {isLoading && <Loading isSpinner={true} />}
      <Container>
        <Header>
          <HeaderTitle>{t('Projects')}</HeaderTitle>
        </Header>
        <Wrapper>
          <Box
            className="SearchAndFilters-tabletUp"
            sx={{
              borderRadius: 'sm',
              display: { xs: 'none', sm: 'flex' },
              flexWrap: 'wrap',
              gap: 1.5,
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              width: '100%',
              maxWidth: '50%',
              marginLeft: 'auto',
              marginBottom: 2,
            }}
          >
            <FormControl size="sm" sx={{ flex: 1 }}>
              <FormLabel>{t('Search for Name')}</FormLabel>
              <Input
                size="sm"
                placeholder={t('Search')}
                startDecorator={<SearchIcon />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormControl>
          </Box>
          <Sheet
            className="OrderTableContainer"
            variant="outlined"
            sx={{
              display: { xs: 'none', sm: 'initial' },
              width: '100%',
              borderRadius: 'sm',
              flexShrink: 1,
              overflow: 'auto',
              minHeight: 0,
            }}
          >
            <Table
              aria-labelledby="tableTitle"
              stickyHeader
              hoverRow
              sx={{
                '--Table-headerUnderlineThickness': '1px',
                '--TableCell-paddingY': '8px',
                '--TableCell-paddingX': '8px',
              }}
            >
              <thead>
                <tr>
                  <th style={{ width: 180, padding: '12px 6px', textAlign: 'center' }}>
                    <Typography
                      color="primary"
                      component="button"
                      onClick={() => handleSort('channelName')}
                      fontWeight="lg"
                      endDecorator={<ArrowDropDownIcon />}
                      sx={{
                        margin: '0 auto',
                        '& svg': {
                          transition: '0.2s',
                          transform: orderBy === 'userName' && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                        },
                      }}
                    >
                      {t('Channel Name')}
                    </Typography>
                  </th>
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>{t('ProjectUrl')}</th>
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>{t('Tier')}</th>
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>{t('Exhibition Limit')}</th>
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>
                    {t('Admin Exhibition Count')}
                  </th>
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>
                    {t('Assigned Exhibition Count')}
                  </th>
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>{t('Created At')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <StyledTr key={row.id} onClick={() => handleClick(row)}>
                    <td style={{ textAlign: 'center', minWidth: 180 }}>
                      <Typography level="body-xs">{row.channelName}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.projectUrl}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.tier}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.exhibitionLimit}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.adminExhibitionCount}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.assignedExhibitionCount}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">
                        {(row.createdAt.toDate() as Date).toISOString().split('T')[0]}
                      </Typography>
                    </td>
                  </StyledTr>
                ))}
              </tbody>
            </Table>
          </Sheet>
          <Box
            className="Pagination-laptopUp"
            sx={{
              pt: 2,
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              [`& .MuiIconButton-root`]: { borderRadius: '50%' },
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <CustomButton
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<KeyboardArrowLeftIcon />}
              onClick={() => {
                const newGroup = buttonGroup - 1;
                if (newGroup >= 0) {
                  setButtonGroup(newGroup);
                  setPage(newGroup * MAX_PAGE_BUTTONS); // 그룹의 첫 번째 페이지로 이동
                }
              }}
              disabled={buttonGroup === 0} // 첫 그룹이면 비활성화
            >
              {t('Previous')}
            </CustomButton>

            {/* 페이지 번호 버튼 */}
            {Array.from({ length: endPage - startPage }, (_, i) => {
              const pageIndex = startPage + i;
              return (
                <IconButton
                  key={pageIndex}
                  size="sm"
                  variant={pageIndex === page ? 'solid' : 'outlined'}
                  color="neutral"
                  onClick={() => handleChangePage(pageIndex)}
                >
                  {pageIndex + 1}
                </IconButton>
              );
            })}

            {/* 다음 페이지 그룹으로 이동 */}
            <CustomButton
              size="sm"
              variant="outlined"
              color="neutral"
              endDecorator={<KeyboardArrowRightIcon />}
              onClick={() => {
                const newGroup = buttonGroup + 1;
                if (endPage < totalPages) {
                  setButtonGroup(newGroup);
                  setPage(newGroup * MAX_PAGE_BUTTONS); // 그룹의 첫 번째 페이지로 이동
                }
              }}
              disabled={endPage >= totalPages} // 마지막 그룹이면 비활성화
            >
              {t('Next')}
            </CustomButton>
          </Box>
        </Wrapper>
      </Container>
      <Actions isOpen={isOpen} setIsOpen={setIsOpen} onClose={onClose} data={selectedData} />
    </>
  );
}

export default DataTable;

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
`;
const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CustomButton = styled(Button)`
  background-color: #115de6;
  color: #fff;
  &:hover {
    background-color: #0056b3;
    color: #fff;
  }
  &.Mui-disabled {
    border: 1px solid #636b7433;
    background-color: #fff;
    color: #636b7433;
  }
`;

const StyledTr = styled.tr`
  cursor: pointer;
`;
