'use client';
// react
import React, { use, useEffect, useState } from 'react';

// lib
import { useTranslation } from 'react-i18next';

// comp
import GroupExhibition from '@/components/GroupExhibition';
import GroupChannel from '@/components/GroupChannel';
import Banner from '@/components/Banner';
import Video from '@/components/Video';

// project manage
import AddGroupModal from '@/components/manage/designMode/Modals/AddGroupModal';
import AddBannerModal from '@/components/manage/designMode/Modals/AddBannerModal';
import AddVideoModal from '@/components/manage/designMode/Modals/AddVideoModal';
import AddBlankModal from '@/components/manage/designMode/Modals/AddBlankModal';

// admin manage
import AdminGroupModal from '@/components/admin/designMode/Modals/AddGroupModal';
import AdminBannerModal from '@/components/admin/designMode/Modals/AddBannerModal';
import AdminVideoModal from '@/components/admin/designMode/Modals/AddVideoModal';
import AdminBlankModal from '@/components/admin/designMode/Modals/AddBlankModal';
import AdminChannelModal from '@/components/admin/designMode/Modals/AddChannelModal';

import Blank from '@/components/Blank';
import RecentChannel from '@/components/home/RecentChannel';
import RecentExhibition from '@/components/home/RecentExhibition';

import PopularExhibition from '@/components/home/PopularExhibition';
// styles
import styled from '@emotion/styled';

// icons
import LinkToast from '@/components/LinkToast';

interface Props {
  data: any;
  setData: any;
}

const Section = ({ data, setData }: Props) => {
  const isAdmin = window.location.href.includes('admin');
  const { i18n, t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);
  const DeleteSection = (data: any) => {
    setData((prevData: any) =>
      prevData.map((section: any) => (section === data ? { ...section, isDeleted: true } : section))
    );
  };

  useEffect(() => {
    //console.log('🚀AddData🚀', data);
  }, [data]);

  if (data.type === 'BANNER') {
    return (
      <>
        <Wrapper>
          <Banner bannerData={data} />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                {t('Edit')}
              </p>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
        {editOpen &&
          (isAdmin ? (
            <AdminBannerModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ) : (
            <AddBannerModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ))}
      </>
    );
  }
  if (data.type === 'VIDEO') {
    return (
      <>
        <Wrapper>
          <Video video={data.videoUrl} />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                {t('Edit')}
              </p>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
        {editOpen &&
          (isAdmin ? (
            <AdminVideoModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ) : (
            <AddVideoModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ))}
      </>
    );
  }
  if (data.type === 'BLANK') {
    return (
      <>
        <Wrapper>
          <Blank data={data} />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                {t('Edit')}
              </p>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
        {editOpen &&
          (isAdmin ? (
            <AdminBlankModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ) : (
            <AddBlankModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ))}
      </>
    );
  }
  if (data.type === 'GROUP_EXHIBITION') {
    return (
      <>
        <Wrapper>
          <GroupExhibition
            title={data.title}
            description={data.description}
            exhibitions={data.exhibitions}
            dueDate={data.dueDate}
            type={data.type}
            layout={data.layout}
            id={data.id}
            hasMore={true}
          />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  setEditOpen(true);
                }}
              >
                {t('Edit')}
              </p>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
        <LinkToast />
        {editOpen &&
          (isAdmin ? (
            <AdminGroupModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ) : (
            <AddGroupModal
              open={editOpen}
              onClose={() => {
                setEditOpen(false);
              }}
              data={data}
              setData={setData}
              edit={true}
            />
          ))}
      </>
    );
  }
  if (data.type === 'GROUP_CHANNEL') {
    return (
      <Wrapper>
        <GroupChannel
          title={data.title}
          description={data.description}
          channel={data.channel}
          type={data.type}
          hasShuffle={true}
        />
        <Edit className="edit">
          <Box>
            <p
              onClick={() => {
                DeleteSection(data);
              }}
            >
              {t('Delete')}
            </p>
          </Box>
        </Edit>
      </Wrapper>
    );
  }
  if (data.type === 'RECENT_EXHIBITION') {
    return (
      <>
        <Wrapper>
          <RecentExhibition />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
        <LinkToast />
      </>
    );
  }
  if (data.type === 'RECENT_CHANNEL') {
    return (
      <>
        <Wrapper>
          <RecentChannel />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
      </>
    );
  }
  if (data.type === 'POPULAR_EXHIBITION') {
    return (
      <>
        <Wrapper>
          <PopularExhibition dueDate={data.dueDate} type={data.type} layout={data.layout} />
          <Edit className="edit">
            <Box>
              <p
                onClick={() => {
                  DeleteSection(data);
                }}
              >
                {t('Delete')}
              </p>
            </Box>
          </Edit>
        </Wrapper>
        <LinkToast />
      </>
    );
  }

  return null;
};

export default Section;

const Wrapper = styled.div`
  position: relative;

  :hover .edit {
    opacity: 1;
    transition: all 0.3s;
  }
`;

const Edit = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 8px;
  opacity: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 5px;
`;

const Box = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: white;
  border-radius: 5px;
  z-index: 11;
  padding: 15px 30px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);

  & p:hover {
    color: #1976d2;
  }
`;
