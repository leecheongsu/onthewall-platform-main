import React, { useState } from 'react';
import styled from '@emotion/styled';
import Sheet from '@mui/joy/Sheet';
import Input from '@mui/joy/Input';
import SearchIcon from '@mui/icons-material/Search';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Box from '@mui/joy/Box';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Table from '@mui/joy/Table';
import Chip from '@mui/joy/Chip';
import Avatar from '@mui/joy/Avatar';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useTranslation } from 'react-i18next';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { Actions } from '@/app/[projectUrl]/manage/members/components/buttons';
import { getComparator, Order, stableSort } from '@/utils/sorting';
import Link from '@mui/joy/Link';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { EmptyItem } from '@/components/EmptyItem';
import { Settings } from '@/app/[projectUrl]/manage/members/components/modals';

interface Props {
  data: any[];
}

const NotExist = () => {
  const { i18n, t } = useTranslation();
  const text = [t('Not Exists Data')];

  return (
    <>
      <Container>
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
              maxWidth: '30%',
              marginLeft: 'auto',
              marginBottom: 2,
            }}
          >
            <Settings />
          </Box>
          <EmptyItem text={text} />
        </Wrapper>
      </Container>
    </>
  );
};

const withNotExist = (WrappedComponent: React.ComponentType<Props>) => (props: Props) => {
  if (!props.data || props.data.length === 0) return <NotExist />;
  return <WrappedComponent {...props} />;
};

type RegistrationPath = 'email' | 'kakao' | 'google';
const registrationPathToObj: Record<RegistrationPath, { label: string; color: string }> = {
  email: {
    label: 'E-Mail',
    color: 'primary',
  },
  kakao: {
    label: 'KAKAO',
    color: 'warning',
  },
  google: {
    label: 'GOOGLE',
    color: 'neutral',
  },
};

function DataTable({ data }: Props) {
  const { i18n, t } = useTranslation();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<'userName' | 'createdAt'>('userName');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [registrationFilter, setRegistrationFilter] = useState<string | null>('');
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleChangePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!registrationFilter || row.registrationPath === registrationFilter)
  );

  const sortedData = stableSort(filteredData, getComparator(order, orderBy));
  const paginatedData = sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSort = (property: 'userName' | 'createdAt') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getPaginationButtons = (currentPage: number, totalPages: number) => {
    const startPage = Math.floor(currentPage / 5) * 5;
    const endPage = Math.min(startPage + 5, totalPages);

    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
  };

  const paginationButtons = getPaginationButtons(page, totalPages);

  return (
    <Container>
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
          <FormControl size="sm" sx={{ flex: 1 }}>
            <FormLabel>{t('Registration Path')}</FormLabel>
            <Select
              size="sm"
              placeholder={t('Filter by Registration Path')}
              slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
              value={registrationFilter}
              onChange={(event, selected) => setRegistrationFilter(selected)}
            >
              <Option value={null}>ALL</Option>
              <Option value="email">E-Mail</Option>
              <Option value="kakao">KAKAO</Option>
              <Option value="google">GOOGLE</Option>
            </Select>
          </FormControl>
          <Settings />
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
                  <Link
                    underline="none"
                    color="primary"
                    component="button"
                    onClick={() => handleSort('userName')}
                    fontWeight="lg"
                    endDecorator={<ArrowDropDownIcon />}
                    sx={{
                      '& svg': {
                        transition: '0.2s',
                        transform: orderBy === 'userName' && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    }}
                  >
                    {t('User Name')}
                  </Link>
                </th>
                <th style={{ width: 180, padding: '12px 6px', textAlign: 'center' }}>Phone</th>
                <th style={{ width: 180, padding: '12px 6px', textAlign: 'center' }}>E-Mail</th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>Registration Path</th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>
                  <Link
                    underline="none"
                    color="primary"
                    component="button"
                    onClick={() => handleSort('createdAt')}
                    fontWeight="lg"
                    endDecorator={<ArrowDropDownIcon />}
                    sx={{
                      '& svg': {
                        transition: '0.2s',
                        transform: orderBy === 'createdAt' && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    }}
                  >
                    {t('Created At')}
                  </Link>
                </th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.uid}>
                  <td style={{ textAlign: 'center' }}>
                    <Typography level="body-xs">{row.userName}</Typography>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Typography level="body-xs">{row.phone}</Typography>
                  </td>
                  <td style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', minWidth: '180px' }}>
                      <Avatar size="sm">{row.email.slice(0, 1)}</Avatar>
                      <div>
                        <Typography level="body-xs">{row.email}</Typography>
                      </div>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={
                        registrationPathToObj[row.registrationPath as RegistrationPath].color as
                          | 'neutral'
                          | 'warning'
                          | 'primary'
                      }
                    >
                      {registrationPathToObj[row.registrationPath as RegistrationPath].label}
                    </Chip>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Typography level="body-xs">{row.createdAt}</Typography>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Actions data={row} />
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
            gap: 1,
            [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
            display: {
              xs: 'none',
              md: 'flex',
            },
          }}
        >
          <CustomButton
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={<KeyboardArrowLeftIcon />}
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 0}
          >
            {t('Previous')}
          </CustomButton>

          <Box sx={{ flex: 1 }} />
          {paginationButtons.map((btnPage) => (
            <IconButton
              key={btnPage}
              size="sm"
              variant={btnPage === page ? 'solid' : 'outlined'}
              color="neutral"
              onClick={() => handleChangePage(btnPage)}
            >
              {btnPage + 1}
            </IconButton>
          ))}
          <Box sx={{ flex: 1 }} />

          <CustomButton
            size="sm"
            variant="outlined"
            color="neutral"
            endDecorator={<KeyboardArrowRightIcon />}
            onClick={() => handleChangePage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            {t('Next')}
          </CustomButton>
        </Box>
      </Wrapper>
    </Container>
  );
}

export default withNotExist(DataTable);

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
