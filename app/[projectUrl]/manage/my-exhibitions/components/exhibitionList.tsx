'use client';
// react
import React, { useState, useEffect } from 'react';

// api
import { deleteExhibition } from '@/api/firestore/getExhibitions';
import { moduleApis } from '@/api/module';

// store
import { useLanguageStore } from '@/store/language';

// lib
import moment from 'moment';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';

// mui
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';

// style
import styled from '@emotion/styled';

// icons
import ChatIcon from '@/images/icons/Chat';
import ViewIcon from '@/images/icons/View';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import ActionShareIcon from '@/images/icons/ActionShare';
import ActionEdit from '@/images/icons/ActionEdit';
import ActionSetting from '@/images/icons/ActionSetting';

import ModifyIcon from '@/images/icons/Modify';

// utils
import { copyLink } from '@/utils/utility';
import getBuilderLink from '@/utils/getBuilderLink';

// comp
import { DeleteModal } from '@/app/[projectUrl]/manage/my-exhibitions/components/deleteModal';
import { DetailModal } from '@/app/[projectUrl]/manage/my-exhibitions/components/detailModal';
import { useProjectStore } from '@/store/project';
import LikeIcon from '@/images/icons/Like';
import { useUserStore } from '@/store/user';

interface Props {
  exhibitionData: any;
  onDelete: (id: string) => void;
  setSuccessCopy: (value: boolean) => void;
  setLinkEmbed?: (value: string) => void;
  theme: any;
  loading?: boolean;
}

interface ExhibitionCellProps {
  data: {
    status: string;
    cloudData?: {
      rejectReason?: string;
    };
    title: string;
    isHidden?: boolean;
  };
  loading: boolean | undefined;
}

const ExhibitionList = ({ exhibitionData, onDelete, setSuccessCopy, setLinkEmbed, theme, loading }: Props) => {
  const { i18n, t } = useTranslation();
  const { isExpired, projectId } = useProjectStore();
  const { projectsMap } = useUserStore();
  const { language } = useLanguageStore();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState<any>(null);
  const [detailModal, setDetailModal] = useState(false);

  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });

  const [selectedData, setSelectedData] = useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [statusText, setStatusText] = useState('');

  const open = Boolean(anchorEl);

  const handleClick = (event: any, rowData: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedData(rowData);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const deleteItem = (data: any) => {
    setDeleteModal(true);
    setDeleteData(data);
    handleClose();
  };

  const copyLinkSuccess = (type: string, id: string) => {
    copyLink(id, type);
    setSuccessCopy(true);
    setLinkEmbed && setLinkEmbed(type);
    setTimeout(() => {
      setSuccessCopy(false);
    }, 500);
  };

  const convertTimestampToDate = (timestamp: any) => {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  };

  const getStatusText = (status: string, language: string) => {
    if (language === 'kr') {
      switch (status) {
        case 'created':
          return '생성됨';
        case 'published':
          return '출판';
        case 'closed':
          return '마감됨';
        default:
          return '생성됨';
      }
    } else {
      switch (status) {
        case 'created':
          return 'CREATED';
        case 'published':
          return 'PUBLISHED';
        case 'closed':
          return 'CLOSED';
        default:
          return 'CREATED';
      }
    }
  };

  const handleMenuItemClick = (type: string, id: string) => {
    copyLinkSuccess(type, id);
    handleClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaginationModel({
      pageSize: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const ExhibitionCell: React.FC<ExhibitionCellProps> = ({ data, loading }) => {
    const [hover, setHover] = useState(false);
    const { t } = useTranslation();
    const { language } = useLanguageStore();

    // getStatusText를 ExhibitionCell 내부에서 처리
    const statusText = getStatusText(data.status, language);

    return (
      <StateTitle>
        {data.status === 'closed' && (
          <>
            <RejectIcon>
              <ErrorOutlineIcon />
            </RejectIcon>
            <RejectMessage hover={hover}>{`${data.cloudData?.rejectReason ?? ''}`}</RejectMessage>
          </>
        )}
        <Status status={data.status} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          {statusText}
        </Status>
        {data?.isHidden && (
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <RejectIcon>
              <ErrorOutlineIcon />
            </RejectIcon>
            <RejectMessage hover={hover}>
              {t('This exhibition is not yet public. Please request approval from the administrator.')}
            </RejectMessage>
          </div>
        )}
        <Title
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          }}
        >
          {loading ? <Skeleton width={120} height={20} /> : data.title}
        </Title>
      </StateTitle>
    );
  };

  useEffect(() => {
    setStatusText(getStatusText(exhibitionData.status, language));
  }, [exhibitionData.status, language]);

  return (
    <Wrapper>
      <Table sx={{ backgroundColor: '#fff' }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '200px' }}>
              {t('Thumbnail')}
            </TableCell>
            <TableCell align="center">{t('Exhibition')}</TableCell>
            <TableCell align="center" sx={{ width: '12%' }}>
              {t('Counts')}
            </TableCell>
            <TableCell align="center" sx={{ width: '12%' }}>
              {t('Actions')}
            </TableCell>
            <TableCell align="center" sx={{ width: '5%' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exhibitionData
            .slice(
              paginationModel.page * paginationModel.pageSize,
              paginationModel.page * paginationModel.pageSize + paginationModel.pageSize
            )
            .map((data: any) => (
              <TableRow key={data.id}>
                <TableCell>
                  {loading ? (
                    <Skeleton width={200} height={80} />
                  ) : (
                    <Box
                      component="img"
                      src={
                        data.originalPosterImage.url ||
                        'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                      }
                      alt={data.originalPosterImage.url || 'Image'}
                      sx={{ width: '100%', height: 80, objectFit: 'cover' }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <ExhibitionCell data={data} loading={loading} />
                </TableCell>
                <TableCell>
                  <CountBox>
                    <Count>
                      <ChatIcon className="w-6 h-6" />
                      {data.commentCount ?? 0}
                    </Count>
                    <Count>
                      <LikeIcon className="w-5 h-5" />
                      {data.like ?? 0}
                    </Count>
                    <Count>
                      <ViewIcon className="w-6 h-6" />
                      {data.views.totalView ?? 0}
                    </Count>
                  </CountBox>
                </TableCell>
                <TableCell>
                  <Buttons>
                    <StyledButton onClick={() => handleMenuItemClick('link', data.id)} disabled={isExpired}>
                      <ActionShareIcon />
                    </StyledButton>
                    <StyledButton
                      onClick={() => window.open(`https://art.onthewall.io/${data.id}`)}
                      disabled={isExpired}
                    >
                      <ActionEdit />
                    </StyledButton>
                    <StyledButton
                      disabled={isExpired}
                      onClick={(e) => {
                        getBuilderLink(projectId, data.id, projectsMap[projectId].status).then((url) => {
                          window.open(url);
                        });
                      }}
                    >
                      <ActionSetting />
                    </StyledButton>
                  </Buttons>
                </TableCell>
                <TableCell>
                  <StyledButton disabled={isExpired} onClick={(event) => handleClick(event, data)}>
                    <ModifyIcon />
                  </StyledButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem
                      onClick={() => {
                        if (selectedData) {
                          setDetailModal(true);
                          handleClose();
                        }
                      }}
                    >
                      {t('Detail')}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        if (selectedData) {
                          deleteItem(selectedData);
                        }
                      }}
                      style={{ color: '#F93C65' }}
                    >
                      {t('Delete')}
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20, 30, 50, 100, 200]}
        component="div"
        count={exhibitionData.length}
        rowsPerPage={paginationModel.pageSize}
        page={paginationModel.page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ backgroundColor: '#fff' }}
      />
      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          exhibitionTitle={deleteData.title}
          onDelete={() => {
            onDelete(deleteData.id);
            deleteExhibition(deleteData.id);
          }}
        />
      )}
      {detailModal && <DetailModal open={detailModal} onClose={() => setDetailModal(false)} data={selectedData} />}
    </Wrapper>
  );
};

export default ExhibitionList;

const Wrapper = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
`;

const Title = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  //최대 2줄
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 16px;
  color: #0f1a2a;
  font-weight: 600;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: block;
  max-width: 500px;
`;
const CountBox = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
`;

const Count = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #94a3b8;
  & svg {
    color: #94a3b8;
  }
`;

const StateTitle = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Status = styled.div<{ status: string }>`
  min-width: 80px;
  text-align: center;
  color: ${(props) => {
    switch (props.status) {
      case 'created':
        return '#4AD991';
      case 'published':
        return '#115DE6';
      case 'closed':
        return '#Ff3848';
      default:
        return '#4AD991';
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.status) {
        case 'created':
          return '#4AD991';
        case 'published':
          return '#115DE6';
        case 'closed':
          return '#Ff3848';
        default:
          return '#4AD991';
      }
    }};
  border-radius: 25px;
  font-size: 13px;
  padding: 3px 10px;
  cursor: pointer;
`;

const RejectIcon = styled.div`
  position: absolute;
  left: -10px;
  top: -10px;
  cursor: pointer;
  & svg {
    animation: pulse 1s infinite;
    @keyframes pulse {
      0% {
        color: #f93c65;
      }
      50% {
        color: #fec53d;
      }
      100% {
        color: #f93c65;
      }
    }
  }
`;

const RejectMessage = styled.div<{ hover: boolean }>`
  position: absolute;
  left: 0px;
  bottom: 20px;
  width: 250px;
  word-break: keep-all;
  word-wrap: break-word;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
  border-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: #fff;
  font-size: 14px;
  display: ${(props) => (props.hover ? 'block' : 'none')};
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const StyledButton = styled(Button)`
  background-color: transparent;
  min-width: fit-content;
  & svg {
    color: #94a3b8;
  }
  :disabled {
    cursor: not-allowed;
  }
`;
