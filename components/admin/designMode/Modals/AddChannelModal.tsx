import React, { use, useEffect, useState } from 'react';

// data
import { getExhibitionDoc } from '@/api/firestore/getExhibitions';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

// lib
import { useTranslation } from 'react-i18next';

// style
import { Box, Title, Row, Column, Label, Value, CloseButton } from '@/components/manage/designMode/Modals/style';
import styled from '@emotion/styled';

// mui
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';

// icons
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any;
  setData: (data: any) => void;
  edit?: boolean;
  order?: number;
}

export default function AddChannelModal({ open, onClose, data, setData, edit, order }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(edit && data.title ? data.title : '');
  const [description, setDescription] = useState(edit && data.description ? data.description : '');

  const [dataArray, setDataArray] = useState<any[]>([]);

  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const [channelList, setChannelList] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState('');

  const handleChannelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedChannel(event.target.value);
  };

  // 수정일땐 밸류값으로 데이터 가져오기
  const fetchExhibitionDetails = async (id: string): Promise<any> => {
    const doc = await getExhibitionDoc(id);
    if (doc) {
      return doc;
    } else {
      console.error(`Document with id ${id} not found`);
      return null;
    }
  };

  const handleSave = () => {
    let isValid = true;

    if (!title.trim()) {
      setTitleError(t('Title is required'));
      isValid = false;
    }

    if (!description.trim()) {
      setDescriptionError(t('Description is required'));
      isValid = false;
    }

    if (!selectedChannel) {
      alert(t('채널을 선택해주세요.'));
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const newData = {
      title,
      description,
      type: 'GROUP_CHANNEL',
      channelId: selectedChannel,
      layout: 'galleryA',
      order: edit ? data.order : order,
      isDeleted: edit ? data.isDeleted : false,
      createdAt: edit ? data.createdAt : Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (edit) {
      // edit 모드에서는 단일 객체를 수정합니다.
      setData((prevData: any) =>
        prevData.map((item: any) => {
          if (item.order === data.order) {
            return { ...item, ...newData };
          }
          return item;
        })
      );
    } else {
      setData([...dataArray, newData]);
    }

    onClose();
  };

  useEffect(() => {
    // 초기 데이터 배열 설정
    setDataArray(Array.isArray(data) ? data : [data]);
  }, [data]);

  useEffect(() => {
    if (open) {
      setTitle(edit && data.title ? data.title : '');
      setDescription(edit && data.description ? data.description : '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [open, edit, data]);

  useEffect(() => {
    if (edit) {
      setSelectedChannel(data.channelId);
    } else {
      setSelectedChannel(channelList[0]?.id);
    }
  }, [channelList]);

  useEffect(() => {
    const fetchProjects = async () => {
      const projectsRef = collection(db, 'Project');
      const q = query(projectsRef, where('tier', 'in', ['personal', 'business', 'enterprise']));

      try {
        const querySnapshot = await getDocs(q);
        const projectList = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((project: any) => project.currentExhibitionCount >= 3 && project.channelName !== '');
        setChannelList(projectList);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box>
          <CloseButton onClick={onClose}>
            <CloseIcon />
          </CloseButton>

          <Title>{t('Channel (Admin)')}</Title>
          <Row>
            <Label>
              {t('Title')}
              <span>*</span>
            </Label>
            <Value>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('Enter Title')}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.trim()) {
                    setTitleError('');
                  }
                }}
                error={!!titleError}
                helperText={titleError}
              />
            </Value>
          </Row>
          <Row>
            <Label>{t('Description')}</Label>
            <Value>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={t('Enter Description')}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.trim()) {
                    setDescriptionError('');
                  }
                }}
                error={!!descriptionError}
                helperText={descriptionError}
              />
            </Value>
          </Row>
          <Row>
            <Label>
              {t('Channel')}
              <span>*</span>
            </Label>
            <Value className="channel">
              <FormControl>
                <RadioGroup row onChange={handleChannelChange} defaultValue={selectedChannel}>
                  {channelList.map((channel, index) => (
                    <FormControlLabel value={channel.id} control={<Radio />} label={channel.channelName} key={index} />
                  ))}
                </RadioGroup>
              </FormControl>
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
            >
              {t('Save')}
            </Button>
          </Row>
        </Box>
      </Modal>
    </>
  );
}
