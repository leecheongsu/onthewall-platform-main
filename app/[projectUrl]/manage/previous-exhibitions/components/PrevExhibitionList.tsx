'use client';
// react
import React, { useEffect, useState } from 'react';

// api
import { deleteExhibition } from '@/api/firestore/getExhibitions';

// lib
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';
import getBuilderLink from '@/utils/getBuilderLink';

// mui
import {
  Box,
  Button,
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

// comp
import { DeleteModal } from '@/app/[projectUrl]/manage/my-exhibitions/components/deleteModal';
import { ActiveModal } from '@/app/[projectUrl]/manage/previous-exhibitions/components/activeModal';
import LikeIcon from '@/images/icons/Like';

import { useProjectStore } from '@/store/project';
import { useUserStore } from '@/store/user';

interface Props {
  exhibitionData: any;
  onDelete: (id: string) => void;
  loading?: boolean;
  onFetch: () => void;
}

const PrevExhibitionList = ({ exhibitionData, onDelete, loading, onFetch }: Props) => {
  const { i18n, t } = useTranslation();
  const { isExpired, projectId } = useProjectStore();
  const { projectsMap } = useUserStore();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState<any>(null);

  const [activeModal, setActiveModal] = useState(false);
  const [activeData, setActiveData] = useState<any>(null);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 5, page: 0 });
  const [isWarning, setIsWarning] = useState(false);

  const deleteItem = (data: any) => {
    setDeleteModal(true);
    setDeleteData(data);
  };

  const activeItem = (data: any) => {
    const expiredAt = new Date(data.expiredAt?._seconds * 1000 + data.expiredAt?._nanoseconds / 1000000);

    const now = new Date().getTime();
    const isNotExpired = now < expiredAt.getTime();

    if (isNotExpired) {
      setIsWarning(true);
    }

    setActiveModal(true);
    setActiveData(data);
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

  const ExhibitionCell = (data: any) => {
    const expiredAt = new Date(data.expiredAt?._seconds * 1000 + data.expiredAt?._nanoseconds / 1000000);
    const now = new Date().getTime();

    const expired = expiredAt.getTime() < now;

    return (
      <StateTitle>
        <Status status={expired}>{expired ? 'InActive' : 'Active'}</Status>
        <Title
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
            marginLeft: '10px',
          }}
        >
          {data.data.title}
        </Title>
      </StateTitle>
    );
  };

  const isShowEdit = (data: any) => {
    const expiredAt = new Date(data.expiredAt?._seconds * 1000 + data.expiredAt?._nanoseconds / 1000000);
    const now = new Date().getTime();
    const isExpired = expiredAt.getTime() < now;

    return data.plan === 'free' || isExpired;
  };

  return (
    <>
      <Table sx={{ backgroundColor: '#fff' }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ width: '200px' }}>
              {t('Thumbnail')}
            </TableCell>
            <TableCell align="center">{t('Exhibition')}</TableCell>
            <TableCell align="center" sx={{ width: '200px' }}>
              {t('Counts')}
            </TableCell>
            <TableCell align="center">{t('Actions')}</TableCell>
            <TableCell align="center"></TableCell>
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
                  <ExhibitionCell data={data} />
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
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => window.open(`https://art.onthewall.io/${data.id}`)}
                      disabled={isExpired}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {t('Preview')}
                    </Button>
                    <Button
                      color="primary"
                      variant="outlined"
                      disabled={isShowEdit(data)}
                      onClick={(e) => {
                        getBuilderLink(projectId, data.id, projectsMap[projectId].status).then((url) => {
                          window.open(url);
                        });
                      }}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {t('Edit')}
                    </Button>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => {
                        activeItem(data);
                      }}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {t('Activate')}
                    </Button>
                    <Button
                      color="error"
                      variant="contained"
                      onClick={() => {
                        deleteItem(data);
                      }}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {t('Delete')}
                    </Button>
                  </Buttons>
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
      {activeModal && (
        <ActiveModal
          open={activeModal}
          onClose={() => setActiveModal(false)}
          activeData={activeData}
          setActiveData={setActiveData}
          isWarning={isWarning}
          onFetch={onFetch}
        />
      )}
    </>
  );
};

export default PrevExhibitionList;

const Title = styled(Typography)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  width: 300px;
  //최대 2줄
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 16px;
  color: #0f1a2a;
  font-weight: 600;
  max-width: 100%;
  display: block;
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

const Status = styled.div<{ status: boolean }>`
  min-width: 80px;
  text-align: center;
  color: ${(props) => (props.status ? '#FF3848' : '#115DE6')};
  border: 1px solid ${(props) => (props.status ? '#FF3848' : '#115DE6')};
  border-radius: 25px;
  font-size: 13px;
  padding: 3px 10px;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
