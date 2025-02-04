'use client';
// react
import React, { useState } from 'react';

// api
import { deleteExhibition } from '@/api/firestore/getExhibitions';
import { moduleApis } from '@/api/module';

// lib
import moment from 'moment';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';

// mui
import { Grid } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';

// style
import styled from '@emotion/styled';

// icons
import ShareIcon from '@/images/icons/Share';
import DeleteIcon from '@/images/icons/Delete';
import ChatIcon from '@/images/icons/Chat';
import ViewIcon from '@/images/icons/View';
import MultipleIcon from '@/images/icons/Muitiple';
import SettingSolidIcon from '@/images/icons/SettingSolid';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// utils
import { copyLink } from '@/utils/utility';
import getBuilderLink from '@/utils/getBuilderLink';

// comp
import { DeleteModal } from '@/app/[projectUrl]/manage/my-exhibitions/components/deleteModal';
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

const ExhibitionCard = ({ exhibitionData, onDelete, setSuccessCopy, setLinkEmbed, theme, loading }: Props) => {
  const { i18n, t } = useTranslation();
  const { isExpired, projectId } = useProjectStore();
  const { projectsMap } = useUserStore();
  const [deleteModal, setDeleteModal] = useState(false);
  const [hover, setHover] = useState(false);
  const [hover2, setHover2] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // 삭제 모달 오픈
  const deleteItem = () => {
    setDeleteModal(true);
  };

  const copyLinkSuccess = (type: string) => {
    copyLink(exhibitionData.id, type);
    setSuccessCopy(true);
    setLinkEmbed && setLinkEmbed(type);
    setTimeout(() => {
      setSuccessCopy(false);
    }, 500);
  };

  const convertTimestampToDate = (timestamp: any) => {
    return new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLIC':
        return 'PUBLIC';
      case 'PRIVATE':
        return 'PRIVATE';
      case 'HIDDEN':
        return 'HIDDEN';
      default:
        return 'PRIVATE';
    }
  };

  const handleMenuItemClick = (type: string) => {
    copyLinkSuccess(type);
    handleClose();
  };

  return (
    <>
      <Grid item xl={3} lg={4} md={6} sm={12} xs={12}>
        <Box>
          <Head>
            <ExhibitionState onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
              <Status status={exhibitionData.status}>{getStatusText(exhibitionData.status)}</Status>
            </ExhibitionState>
            <CountBox>
              <Count>
                <ChatIcon className="w-6 h-6" />
                {exhibitionData.commentCount ?? 0}
              </Count>
              <Count>
                <LikeIcon className="w-5 h-5" />
                {exhibitionData.like ?? 0}
              </Count>
              <Count>
                <ViewIcon className="w-6 h-6" />
                {exhibitionData.views.totalView ?? 0}
              </Count>
            </CountBox>
          </Head>
          <Content>
            <Thumb onMouseEnter={() => setHover2(true)} onMouseLeave={() => setHover2(false)}>
              {loading ? (
                <Skeleton width={350} height={250} />
              ) : (
                <>
                  <img
                    src={
                      exhibitionData.compressedPosterImage.url ||
                      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                    }
                    alt={exhibitionData.compressedPosterImage.url || 'No Image'}
                  />
                  <ThumbButtons hover={hover2}>
                    <ThumbButton disabled={isExpired} disableRipple>
                      <ShareButton onClick={handleClick} disableRipple>
                        <ShareIcon className="w-7 h-7 share" />
                      </ShareButton>
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={() => handleMenuItemClick('link')}>{t('Copy share link')}</MenuItem>
                        <MenuItem onClick={() => handleMenuItemClick('embed')}>{t('Copy embed code')}</MenuItem>
                      </Menu>
                    </ThumbButton>
                    <ThumbButton
                      disabled={isExpired}
                      disableRipple
                      onClick={(e) => {
                        if (exhibitionData.publishedAt) {
                          window.open(`https://art.onthewall.io/${exhibitionData.id}`);
                        } else {
                          e.preventDefault();
                        }
                      }}
                    >
                      <MultipleIcon className="w-12 h-12 view" />
                    </ThumbButton>
                    <ThumbButton
                      disableRipple
                      onClick={() => {
                        deleteItem();
                      }}
                    >
                      <DeleteIcon className="w-8 h-8 del" />
                    </ThumbButton>
                  </ThumbButtons>
                </>
              )}
            </Thumb>

            <InfoBox>
              <Title>{loading ? <Skeleton width={120} height={20} /> : exhibitionData.title}</Title>
              <Info>
                <span>{t('Space')}</span>
                {loading ? <Skeleton width={90} height={20} /> : <p>{exhibitionData.space.title_en}</p>}
              </Info>
              <Info>
                <span>{t('Created At')}</span>
                {loading ? (
                  <Skeleton width={90} height={20} />
                ) : (
                  <p>
                    {exhibitionData?.createdAt
                      ? moment(convertTimestampToDate(exhibitionData.createdAt)).format('YYYY년 MM월 DD일')
                      : t('No Created date')}
                  </p>
                )}
              </Info>
              <Info>
                <span>{t('Published At')}</span>
                {loading ? (
                  <Skeleton width={90} height={20} />
                ) : (
                  <p>
                    {exhibitionData?.updatedAt
                      ? moment(convertTimestampToDate(exhibitionData.updatedAt)).format('YYYY년 MM월 DD일')
                      : t('No Published date')}
                  </p>
                )}
              </Info>
              <BuilderButton
                onClick={(e) => {
                  getBuilderLink(projectId, exhibitionData.id, projectsMap[projectId].status).then((url) => {
                    window.open(url);
                  });
                }}
                theme={theme.primary}
                disabled={isExpired}
              >
                <SettingSolidIcon className="w-4 h-4 mr-2" />
                {t('Setting')}
              </BuilderButton>
            </InfoBox>
          </Content>
        </Box>
      </Grid>
      {deleteModal && (
        <DeleteModal
          open={deleteModal}
          onClose={() => setDeleteModal(false)}
          exhibitionTitle={exhibitionData.title}
          onDelete={() => {
            onDelete(exhibitionData.id);
            deleteExhibition(exhibitionData.id);
          }}
        />
      )}
    </>
  );
};

export default ExhibitionCard;

const Box = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.03);
  display: grid;
`;
const Head = styled.div`
  height: 55px;
  padding: 0 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
`;
const Title = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  width: 100%;
  //최대 2줄
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 16px;
  color: #0f1a2a;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e5e5e5;
  font-weight: 600;
`;
const Content = styled.div``;

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
const InfoBox = styled.div`
  padding: 15px;
  border-top: 1px solid #e5e5e5;
`;
const Info = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  margin-bottom: 5px;
  & span {
    color: #0f1a2a;
    font-size: 14px;
    flex: 1;
    text-align: left;
  }
  & p {
    color: #0f1a2a;
    font-size: 14px;
    flex: 3;
    text-align: left;
  }
`;
const Thumb = styled.div`
  height: 280px;
  position: relative;
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    display: block;
  }
`;

const ThumbButtons = styled.div<{ hover: boolean }>`
  position: absolute;
  top: 0px;
  right: 0px;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  opacity: ${(props) => (props.hover ? 1 : 0)};
  transition: all 0.3s ease-in-out;
`;

const ThumbButton = styled(Button)`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  & svg {
    color: #979797;
  }
  &:hover svg {
    color: #fff;
  }
  &:hover .del {
    color: #ff3848;
  }
  :disabled {
    cursor: not-allowed;
  }
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 120px;
    width: 1px;
    background-color: #979797;
  }
  :hover {
    background-color: transparent;
  }
`;

const ShareButton = styled(Button)`
  background-color: transparent;
  &:hover {
    background-color: transparent;
  }
  :disabled {
    cursor: not-allowed;
  }
`;

const BuilderButton = styled.button<{ theme?: any }>`
  background-color: #fff;
  border: 1px solid ${(props) => props.theme};
  border-radius: 5px;
  color: ${(props) => props.theme};
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 10px 0;
  font-size: 14px;
  margin-top: 15px;
  cursor: pointer;
  &:hover {
    background-color: rgb(17, 93, 230, 0.05);
  }
  :disabled {
    cursor: not-allowed;
  }
`;

const ExhibitionState = styled.div`
  display: flex;
  align-items: center;
`;

const Status = styled.div<{ status: string }>`
  color: ${(props) => {
    switch (props.status) {
      case 'PUBLIC':
        return '#115DE6';
      case 'PRIVATE':
        return '#4AD991';
      case 'HIDDEN':
        return '#FEC53D';
      default:
        return '#4AD991';
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.status) {
        case 'PUBLIC':
          return '#115DE6';
        case 'PRIVATE':
          return '#4AD991';
        case 'HIDDEN':
          return '#FEC53D';
        default:
          return '#4AD991';
      }
    }};
  border-radius: 25px;
  font-size: 14px;
  padding: 3px 10px;
  cursor: pointer;
`;

const RejectIcon = styled.div`
  position: absolute;
  left: 7px;
  top: 3px;
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
  left: 20px;
  bottom: 35px;
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
