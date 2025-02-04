import React, { useEffect, useState } from 'react';

// data
import { moduleApis } from '@/api/module';
import { getAdminExhibitionListAll } from '@/api/firestore/getExhibitions';

// store
import { useProjectStore } from '@/store/project';

// lib
import moment from 'moment';
import { useTranslation } from 'react-i18next';

// style
import styled from '@emotion/styled';
import { Box, Title, CloseButton } from '@/components/manage/designMode/Modals/style';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import { CircularProgress } from '@mui/material';
import InputBase from '@mui/material/InputBase';

// icons
import SearchIcon from '@/images/icons/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@/images/icons/Check';

interface Props {
  open: boolean;
  onClose: () => void;
  selectedItems: any[];
  setSelectedItems: (data: any[]) => void;
}

export default function AddExhibitionModal({ open, onClose, selectedItems, setSelectedItems }: Props) {
  const isAdmin = window.location.href.includes('admin');
  const { t } = useTranslation();
  const { projectId } = useProjectStore();
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const [filteredData, setFilteredData] = useState<any>([]);
  const [searchText, setSearchText] = useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  };

  // 검색
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaginationModel({
      pageSize: parseInt(event.target.value, 10),
      page: 0,
    });
  };
  const convertTimestampToDate = (timestamp: any) => {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  };

  const addItem = (item: any) => {
    const newItem = { ...item, type: 'onthewall' };
    if (!selectedItems.some((i) => i.id === newItem.id)) {
      setSelectedItems([...selectedItems, newItem]);
    }
  };

  const fetchData = async () => {
    const res = await moduleApis.getExhibitionsByProjectId(projectId);
    setData(res.data.exhibitions);
  };

  const fetchAdminData = async () => {
    getAdminExhibitionListAll().then((res) => {
      setData(res);
    });
  };

  const paginatedData = filteredData.slice(
    paginationModel.page * paginationModel.pageSize,
    paginationModel.page * paginationModel.pageSize + paginationModel.pageSize
  );

  useEffect(() => {
    setLoading(true);
    if (!isAdmin) {
      fetchData();
    } else {
      fetchAdminData();
    }
  }, []);

  useEffect(() => {
    if (data) {
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  }, [data]);

  useEffect(() => {
    if (!data) return;
    // 검색 필터링

    const filteredData = searchText
      ? data?.filter((exhibition: any) => exhibition.title.toLowerCase().includes(searchText.toLowerCase()))
      : data?.filter((exhibition: any) => !exhibition.isDeleted);
    setFilteredData(filteredData);
  }, [searchText, data]);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box className="Exhibition">
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>

          <Title>{t('Exhibitions (Admin)')}</Title>
          <Search>
            <SearchBar>
              <SearchIcon className="w-5 h-5" />
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder={t('Search...')}
                value={searchText}
                onChange={handleSearchChange}
              />
            </SearchBar>
          </Search>
          {isLoading ? (
            <CircularProgress />
          ) : (
            <>
              <Table>
                <TableHead sx={{ backgroundColor: '#DBE8FF' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ width: 350 }}>
                      {t('Title')}
                    </TableCell>
                    <TableCell align="center">{t('User Name')}</TableCell>
                    <TableCell align="center">{t('Created At')}</TableCell>
                    <TableCell align="center">{t('Status')}</TableCell>
                    <TableCell align="center" sx={{ width: 120 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell align="center" colSpan={5}>
                        {t('No data.')} <br />
                        {t('please create an exhibition first, and then create a group section.')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell align="center">
                          <Subtitle>{item.title}</Subtitle>
                        </TableCell>
                        <TableCell align="center">{item.author}</TableCell>
                        <TableCell align="center">
                          {item.createdAt
                            ? moment(convertTimestampToDate(item.createdAt)).format('YYYY년 MM월 DD일')
                            : t('No Created date')}
                        </TableCell>
                        <TableCell align="center">{item.status}</TableCell>
                        <TableCell align="center">
                          <StyledButton
                            color="primary"
                            variant="outlined"
                            disabled={selectedItems.some((i) => i.id === item.id)}
                            onClick={() => {
                              addItem(item);
                            }}
                          >
                            {selectedItems.some((i) => i.id === item.id) ? <CheckIcon /> : 'Add'}
                          </StyledButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 30, 50, 100, 200]}
                component="div"
                count={filteredData.length}
                rowsPerPage={paginationModel.pageSize}
                page={paginationModel.page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ backgroundColor: '#fff' }}
              />
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}

const StyledButton = styled(Button)`
  border-radius: 25px;
  & svg {
    width: 22px;
    height: 22px;
  }
`;

const Subtitle = styled.p`
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 1rem;
  width: 350px;
`;

const Search = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SearchBar = styled.div`
  border: 1px solid #115de6;
  border-radius: 5px;
  padding: 6px 10px 3px 10px;
  display: flex;
  align-items: center;
  background-color: #fff;

  & input {
    font-size: 14px;
  }

  & svg {
    color: #115de6;
  }
`;
