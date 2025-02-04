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
import Link from '@mui/joy/Link';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Chip from '@mui/joy/Chip';
import Avatar from '@mui/joy/Avatar';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useTranslation } from 'react-i18next';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { moduleActionApis } from '@/api/module';
import { getComparator, Order, stableSort } from '@/utils/sorting';
import { EmptyItem } from '@/components/EmptyItem';
// import { Actions, AccessButtons } from '@/app/[projectUrl]/manage/exhibition-status/components/buttons';

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
          ></Box>
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

const statusToObj = {
  created: {
    label: 'CREATED',
    color: 'success',
  },
  published: {
    label: 'PUBLISHED',
    color: 'primary',
  },
  closed: {
    label: 'CLOSED',
    color: 'danger',
  },
};

function DataTable({ data }: Props) {
  const { i18n, t } = useTranslation();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<'title' | 'createdAt'>('title');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('');
  const totalPages = Math.ceil(data.length / rowsPerPage);

  const handleChangePage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const filteredData = data.filter(
    (row) =>
      row.title.toLowerCase().includes(searchTerm.toLowerCase()) && (!statusFilter || row.status === statusFilter)
  );

  const sortedData = stableSort(filteredData, getComparator(order, orderBy));
  const paginatedData = sortedData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleSort = (property: 'title' | 'createdAt') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handlePreviewButton = (id: string) => {
    moduleActionApis.requestPreview(id).then((res) => {
      if (res === 'success') {
        window.open(`https://art.onthewall.io/preview/${id}`, '_blank');
      } else {
        alert(t('Failed to request preview'));
      }
    });
  };

  const getPaginationButtons = (currentPage: number, totalPages: number) => {
    const startPage = Math.floor(currentPage / 5) * 5;
    const endPage = Math.min(startPage + 5, totalPages);

    return Array.from({ length: endPage - startPage }, (_, index) => startPage + index);
  };

  const paginationButtons = getPaginationButtons(page, totalPages);

  return (
    <Container>
      {/* <Wrapper>
        <Box
          className="SearchAndFilters-tabletUp"
          sx={{
            borderRadius: 'sm',
            py: 2,
            display: { xs: 'none', sm: 'flex' },
            flexWrap: 'wrap',
            gap: 1.5,
            justifyContent: 'flex-end',
            width: '100%',
            maxWidth: '50%',
            marginLeft: 'auto',
          }}
        >
          <FormControl size="sm" sx={{ flex: 1 }}>
            <FormLabel>Search for Title</FormLabel>
            <Input
              size="sm"
              placeholder="Search"
              startDecorator={<SearchIcon />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>
          <FormControl size="sm" sx={{ flex: 1 }}>
            <FormLabel>Status</FormLabel>
            <Select
              size="sm"
              placeholder="Filter by status"
              slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
              value={statusFilter}
              onChange={(event, selected) => setStatusFilter(selected)}
            >
              <Option value={null}>ALL</Option>
              <Option value="created">CREATED</Option>
              <Option value="published">PUBLISHED</Option>
              <Option value="closed">CLOSED</Option>
            </Select>
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
                  <Link
                    underline="none"
                    color="primary"
                    component="button"
                    onClick={() => handleSort('title')}
                    fontWeight="lg"
                    endDecorator={<ArrowDropDownIcon />}
                    sx={{
                      '& svg': {
                        transition: '0.2s',
                        transform: orderBy === 'title' && order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    }}
                  >
                    Exhibition Title
                  </Link>
                </th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>Status</th>
                <th style={{ width: 220, padding: '12px 6px', textAlign: 'center' }}>Access</th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>User Name</th>
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
                    Created At
                  </Link>
                </th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>Updated At</th>
                <th style={{ width: 120, padding: '12px 6px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Typography level="body-xs" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <PublishedTag isPublished={row.isPublished}>
                        {row.isPublished ? 'Publish' : 'Inactive'}
                      </PublishedTag>
                      <PreviewButton onClick={() => handlePreviewButton(row.id)}>{row.title}</PreviewButton>
                    </Typography>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={
                        (statusToObj[row.status as ExhibitionStatus]?.color as
                          | 'success'
                          | 'neutral'
                          | 'danger'
                          | 'primary') ?? 'primary'
                      }
                    >
                      {statusToObj[row.status as ExhibitionStatus]?.label ?? 'PUBLISHED'}
                    </Chip>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <AccessButtons data={row} />
                  </td>
                  <td style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar size="sm">{row.userName?.slice(0, 1) ?? ''}</Avatar>
                      <div>
                        <Typography level="body-xs">{row.userName}</Typography>
                      </div>
                    </Box>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Typography level="body-xs">{row.createdAt}</Typography>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Typography level="body-xs">{row.updatedAt}</Typography>
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
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            startDecorator={<KeyboardArrowLeftIcon />}
            onClick={() => handleChangePage(page - 1)}
            disabled={page === 0}
          >
            Previous
          </Button>

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

          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            endDecorator={<KeyboardArrowRightIcon />}
            onClick={() => handleChangePage(page + 1)}
            disabled={page >= totalPages - 1}
          >
            Next
          </Button>
        </Box>
      </Wrapper> */}
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

const PublishedTag = styled.div<{ isPublished: boolean }>`
  color: ${({ isPublished }) => (isPublished ? '#115DE6' : '#F93C65')};
  border: ${({ isPublished }) => (isPublished ? '1px solid #115DE6' : '1px solid #F93C65')};
  border-radius: 25px;
  font-size: 10px;
  padding: 3px 10px;
  cursor: pointer;
`;

const PreviewButton = styled.div`
  &:hover {
    color: #115de6;
    text-decoration: underline;
  }
`;
