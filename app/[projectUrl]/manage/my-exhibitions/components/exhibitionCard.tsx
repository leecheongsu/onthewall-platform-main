'use client';
// react
import React, { useEffect, useState } from 'react';

// api
import { moduleApis } from '@/api/module';
import { deleteExhibition } from '@/api/firestore/getExhibitions';

// store
import { useLanguageStore } from '@/store/language';

// lib
import moment, { lang } from 'moment';
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
import { useUserStore } from '@/store/user';
import LikeIcon from '@/images/icons/Like';

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
  const { language } = useLanguageStore();
  const [deleteModal, setDeleteModal] = useState(false);
  const [hover, setHover] = useState(false);
  const [hover2, setHover2] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [statusText, setStatusText] = useState('');
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

  const handleMenuItemClick = (type: string) => {
    copyLinkSuccess(type);
    handleClose();
  };

  useEffect(() => {
    setStatusText(getStatusText(exhibitionData.status, language));
  }, [exhibitionData.status, language]);

  return (
    <>
      <Grid item xl={4} lg={4} md={6} sm={12} xs={12}>
        <Box>
          <Head>
            <ExhibitionState onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
              {exhibitionData.status === 'closed' && (
                <>
                  <RejectIcon>
                    <ErrorOutlineIcon />
                  </RejectIcon>
                  <RejectMessage hover={hover}>{`${exhibitionData.cloudData?.rejectReason ?? ''}`}</RejectMessage>
                </>
              )}
              <Status status={exhibitionData.status}>{statusText}</Status>
              {projectsMap[projectId].status === 'user' && exhibitionData.isHidden && (
                <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                  <RejectIcon>
                    <ErrorOutlineIcon />
                  </RejectIcon>
                  <RejectMessage hover={hover}>
                    {t('This exhibition is not yet public. Please request approval from the administrator.')}
                  </RejectMessage>
                </div>
              )}
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
                      exhibitionData.originalPosterImage.url ||
                      'https://firebasestorage.googleapis.com/v0/b/gd-virtual-staging.appspot.com/o/banner%2FFrame%203463-2.png?alt=media&token=8e90f47b-db21-471f-b487-552b38dbc243'
                    }
                    alt={exhibitionData.originalPosterImage.url || 'No Image'}
                  />
                  <ThumbButtons hover={hover2}>
                    <ThumbButton disabled={isExpired} disableRipple onClick={handleClick}>
                      <ShareButton>
                        <ShareIcon className="w-7 h-7 share" />
                      </ShareButton>
                      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
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
              <Title>
                {loading ? <Skeleton width={120} height={20} /> : exhibitionData.title || t('Untitled Exhibition')}
              </Title>
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
                    {exhibitionData?.publishedAt
                      ? moment(convertTimestampToDate(exhibitionData.publishedAt)).format('YYYY년 MM월 DD일')
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
  border-radius: 5px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
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
const Title = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  white-space: nowrap;
  -webkit-line-clamp: 2; /* Limits to 2 lines */
  -webkit-box-orient: vertical;
  font-size: 16px;
  color: #0f1a2a;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid #e5e5e5;
  font-weight: 600;
  //max-height: 3.2em; /* Adjust this value to fit the maximum height */
  line-height: 1.6em; /* Adjust this value to control line spacing */
  word-wrap: break-word;
  text-align: left;
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

const ShareButton = styled.div`
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

const Hidden = styled.div`
  color: #ff3848;
  font-size: 12px;
  margin-left: 10px;
  border: 1px solid #ff3848;
  border-radius: 14px;
  padding: 3px 7px;
  cursor: pointer;
`;
