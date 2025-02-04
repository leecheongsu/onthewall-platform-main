'use client';
import React, { useEffect, useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import Loading from '@/app/loading';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import NumberComma from '@/utils/numberComma';
import { Tooltip } from '@mui/material';

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
  const { t } = useTranslation();
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('userName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<Array<any>>([]);
  const [data, setData] = useState<Array<any>>([]);
  const [filteredData, setFilteredData] = useState<Array<any>>(data);
  const [paginatedData, setPaginatedData] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const MAX_PAGE_BUTTONS = 15; // 최대 페이지 버튼 수
  const [totalPages, setTotalPages] = useState(Math.ceil(data.length / rowsPerPage));
  const [buttonGroup, setButtonGroup] = useState(0); // 페이지 그룹을 추적

  // 페이지 그룹 계산 (한 번에 MAX_PAGE_BUTTONS 만큼만 보여줌)
  const startPage = buttonGroup * MAX_PAGE_BUTTONS;
  const endPage = Math.min(startPage + MAX_PAGE_BUTTONS, totalPages);

  const handleSort = (property: any) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (newPage: any) => {
    setPage(newPage);
    if (newPage >= endPage) {
      setButtonGroup(buttonGroup + 1); // 다음 그룹으로 이동
    } else if (newPage < startPage) {
      setButtonGroup(buttonGroup - 1); // 이전 그룹으로 이동
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard: ' + text);
    });
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Order'), (querySnapshot) => {
      const orders: Array<any> = [];
      querySnapshot.forEach((doc) => {
        orders.push(doc.data());
      });
      setOrders(orders);
    });

    // 컴포넌트 언마운트 시 실시간 구독 해제
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const sortedData = [...orders].sort((a, b) => {
      if (orderBy === 'userName') {
        return order === 'asc' ? a.buyer_name?.localeCompare(b.buyer_name) : b.buyer_name?.localeCompare(a.buyer_name);
      } else if (orderBy === 'createdAt') {
        return order === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

    setData(sortedData);
  }, [orders, order, orderBy]);

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
        row.buyer_name?.toLowerCase().includes(searchLower) ||
        row.buyer_email?.toLowerCase().includes(searchLower) ||
        row.buyer_tel?.toLowerCase().includes(searchLower)
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <>
      {isLoading && <Loading isSpinner={true} />}
      <Container>
        <Header>
          <HeaderTitle>{t('Orders')}</HeaderTitle>
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
                  <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>
                    <Typography
                      // underline="none"
                      color="primary"
                      component="button"
                      onClick={() => handleSort('userName')}
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
                      {t('User Name')}
                    </Typography>
                  </th>
                  <th style={{ width: 150, padding: '12px 6px', textAlign: 'center' }}>{t('E-Mail')}</th>
                  <th style={{ width: 80, padding: '12px 6px', textAlign: 'center' }}>{t('ProjectId')}</th>
                  <th style={{ width: 90, padding: '12px 6px', textAlign: 'center' }}>{t('Plan')}</th>
                  <th style={{ width: 90, padding: '12px 6px', textAlign: 'center' }}>{t('금액')}</th>
                  <th style={{ width: 90, padding: '12px 6px', textAlign: 'center' }}>{t('Currency')}</th>
                  <th style={{ width: 90, padding: '12px 6px', textAlign: 'center' }}>{t('Status')}</th>
                  <th style={{ width: 90, padding: '12px 6px', textAlign: 'center' }}>{t('Created At')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr key={row.id}>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.buyer_name}</Typography>
                    </td>
                    <td style={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: '180px' }}>
                        <Avatar size="sm">{row.buyer_email?.slice(0, 1)}</Avatar>
                        <div>
                          <Typography level="body-xs">{row.buyer_email}</Typography>
                        </div>
                      </Box>
                    </td>
                    <td
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => copyToClipboard(row.projectId)}
                    >
                      <Tooltip title={row.projectId}>
                        <Typography
                          level="body-xs"
                          sx={{
                            maxWidth: '150px', // 셀 너비 제한
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer', // 마우스 커서 변경
                          }}
                        >
                          {row.projectId}
                        </Typography>
                      </Tooltip>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.plan}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{NumberComma(row.amount)}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.currency}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{row.status}</Typography>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <Typography level="body-xs">{formatDate(row.createdAt)}</Typography>
                    </td>
                  </tr>
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
