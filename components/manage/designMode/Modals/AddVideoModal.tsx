import React, { useEffect, useState } from 'react';

// data
import { Timestamp } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';
import ShortUniqueId from 'short-unique-id';

// style
import { Box, Title, Column, Row, Label, Value, CloseButton } from '@/components/manage/designMode/Modals/style';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { CardMedia } from '@mui/material';

// icons
import CloseIcon from '@mui/icons-material/Close';

// components
import VideoUploadButton from '@/components/VideoUploadButton';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  setData: (data: any) => void;
  edit?: boolean;
  order?: number;
}

export default function AddVideoModal({ open, onClose, data, setData, edit, order }: Props) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState({
    path: '',
    url: '',
    fileName: '',
  });

  const handleSave = () => {
    const newData = {
      videoUrl: videoData.url,
      type: 'VIDEO',
      order: order,
      isDeleted: false,
      updatedAt: Timestamp.now(),
      id: edit ? data.id : new ShortUniqueId().randomUUID(6),
    };
    if (edit) {
      // edit 모드에서는 단일 객체를 수정합니다.
      setData((prevData: any) => prevData.map((item: any) => (item.id === data.id ? { ...item, ...newData } : item)));
    } else {
      // 배열인지 확인하고 배열로 변환
      const existingData = Array.isArray(data) ? data : [data];
      setData([...existingData, newData]);
    }
  };

  useEffect(() => {
    if (open) {
      setVideoData({
        path: '',
        url: edit && data.videoUrl ? data.videoUrl : '',
        fileName: '',
      });
    } else {
      setVideoData({
        path: '',
        url: '',
        fileName: '',
      });
    }
  }, [open, edit, data]);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>

          <Title>{t('Video')}</Title>
          <Row>
            <Label>{t('Video')}</Label>
            <Value>
              <Column>
                {videoData.url && (
                  <CardMedia
                    component="video"
                    autoPlay
                    controls
                    muted
                    loop
                    src={videoData.url}
                    sx={{ marginBottom: '10px' }}
                  />
                )}
                <VideoUploadButton
                  videoData={videoData}
                  setVideoData={setVideoData}
                  isLoading={isLoading}
                  setLoading={setIsLoading}
                />
              </Column>
            </Value>
          </Row>
          <Row className="Buttons">
            <Button
              variant="outlined"
              color="primary"
              onClick={onClose}
              sx={{ width: '200px', textTransform: 'capitalize', fontSize: '1rem' }}
            >
              {t('Close')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ width: '200px', textTransform: 'capitalize', fontSize: '1rem' }}
              onClick={() => {
                onClose();
                handleSave();
              }}
              disabled={isLoading}
            >
              {t('Save')}
            </Button>
          </Row>
        </Box>
      </Modal>
    </>
  );
}
